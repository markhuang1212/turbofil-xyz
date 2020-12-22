import Env from '../env.json'
import CollectionAbstract from './CollectionAbstract'
import GetterAbstract from './GetterAbstract'
import fetch from 'node-fetch'
import { Long } from 'mongodb'
import { Getter, Handler } from '../Types'

function webPageToClusterInfo(text: string) {
    const textEle = text.split('rs=').map(v => 'rs=' + v).splice(1)
    const result: { rnId: string, web?: string, proc?: string, running?: string }[] = []
    for (let ele of textEle) {
        const rnId = (ele.match(/rs=http:\/\/.*\/[0-9]+/g) ?? [''])[0]?.substr(-4)
        const web = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[0]?.substr(3)
        const proc = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[1]?.substr(3)
        const running = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[2]?.substr(3)
        result.push({ rnId, web, proc, running })
    }
    return result
}

function webPageToInfo(text: string) {
    const strMatch = text.match(/<b>0.[0-9A-Z]+/g) ?? []
    const strResult = strMatch.map(val => val.substr(3))
    const result: { web: string, proc: string, running: string }[] = []

    for (let i = 0; i < strResult.length / 3; i++) {
        result.push({
            web: strResult[i * 3],
            proc: strResult[i * 3 + 1],
            running: strResult[i * 3 + 2]
        })
    }

    return result
}

function webPageToRnodesId(text: string) {
    const rnodesUri = text.match(/rs=http:\/\/.*\/[0-9]+/g) ?? []
    const rnodesId = rnodesUri.map(val => val.substr(-4))
    return rnodesId
}

/**
 * This handles the data of the clusters apis, including
 * /clusters/all
 * /clusters/overview
 * /clusters/:cluster/rnodes
 * /clusters/:cluster/fnodes
 */
class ClusterGetter extends GetterAbstract {

    initialize() {
        this.rnodeCollections.forEach((val, key) => {
            val.collection.createIndex({ rn_id: 1 })
        })
    }

    static shared = new ClusterGetter()

    /**
     * clusterName => the uri of the web page
     */
    clusterWebInfo: Map<string, string> = new Map(Object.entries(Env.clustersWeb))

    /**
     * clusterName => the uri of the rnode/fnode status api
     */
    clusterRNodeInfo: Map<string, string> = new Map(Object.entries(Env.clustersStatus))
    rnodeCollections: Map<string, CollectionAbstract<Getter.RNode>> = new Map()

    /**
     * clusterName => overview url
     */
    clusterOverviewsInfo: Map<string, string> = new Map(Object.entries(Env.clustersOverview))
    clusterOverviews: Map<string, Object> = new Map()


    constructor() {
        super()
        this.clusterRNodeInfo.forEach((val, key) => {
            this.rnodeCollections.set(key, CollectionAbstract.makeCollectionAbstract<Getter.RNode>('clusters', key))
        })
        this.periodic()
    }

    task() {
        this.cacheOverview()
        this.cacheRNodes()
    }

    async cacheOverviewForCluster(cluster: string, uri: string) {
        try {
            const fetch_uri = `${uri}/stats/overview`
            const response = await fetch(fetch_uri)
            const responseJson = await response.json()
            this.clusterOverviews.set(cluster, responseJson)
            console.log(`overview for cluster ${cluster} finished.`)
        } catch (e) {
            console.error(`error occurred when caching overview for cluster ${cluster}`)
            console.error(e)
        }
    }

    cacheOverview() {
        console.log('caching overviews')
        for (let [clusterName, clusterUri] of this.clusterOverviewsInfo) {
            this.cacheOverviewForCluster(clusterName, clusterUri)
        }
    }

    async cacheRNodesForCluster(cluster: string) {
        console.log(`start caching rnode for cluster ${cluster}`)

        const collectionManaged = this.rnodeCollections.get(cluster)
        const webpageUri = this.clusterWebInfo.get(cluster)
        const rnodeUri = this.clusterRNodeInfo.get(cluster)

        if (!collectionManaged || !webpageUri || !rnodeUri) {
            throw Error(`Error when caching rnode for cluster ${cluster}`)
        }

        const webPageResponse = await fetch(webpageUri)
        const webPageText = await webPageResponse.text()

        // const rnodesId = webPageToRnodesId(webPageText)
        // const rnodesInfo = webPageToInfo(webPageText)
        const rnodeInfo = webPageToClusterInfo(webPageText)

        for (let i = 0; i < rnodeInfo.length; i++) {
            const rnStatusUri = `${rnodeUri}/rnStatus/${rnodeInfo[i].rnId}`
            const fnStatusUri = `${rnodeUri}/fnStatus/${rnodeInfo[i].rnId}`

            const rnStatusJson: Getter.RNodeStatusResponse = await (await fetch(rnStatusUri)).json()
            const fnStatusJson: Getter.FNodeStatusResponse = await (await fetch(fnStatusUri)).json()

            // console.log(fnStatusJson)

            let rnode: Getter.RNode = {
                rn_id: rnodeInfo[i].rnId,
                runStatus: rnStatusJson.data.RunStatus,
                loopStatus: rnStatusJson.data.LoopStatus,
                backendStatus: rnStatusJson.data.BackendStatus,
                web: rnodeInfo[i].web ?? '',
                proc: rnodeInfo[i].proc ?? '',
                running: rnodeInfo[i].running ?? '',
                num_of_fnodes: fnStatusJson.data.length,
                fnodes: fnStatusJson.data.map(val => {
                    return {
                        fn_id: val.fnid,
                        fn_status: val.fnStatus,
                        usedM: val.usedM == '' ? 0 : parseInt(val.usedM),
                        quotaM: val.quotaM == '' ? 0 : parseInt(val.quotaM)
                    }
                }),
                totalStorage: 0,
                hasStorage: 0
            }

            rnode.totalStorage = rnode.fnodes.reduce((accu, curr) => accu + (curr.quotaM as number), 0)

            rnode.hasStorage = rnode.fnodes.reduce((accu, curr) => accu + (curr.usedM as number), 0)

            const mongoCollection = this.rnodeCollections.get(cluster)!.collection

            await mongoCollection.updateOne({ rn_id: rnode.rn_id }, { $set: rnode }, { upsert: true })

        }

        console.log(`caching rnode for cluster ${cluster} success`)

    }

    async cacheRNodes() {
        console.log('caching rnodes')
        for (let [clusterName, _] of this.clusterRNodeInfo) {
            this.cacheRNodesForCluster(clusterName).catch(e => {
                console.error(`error when caching cluster ${clusterName}`)
                console.error(e)
            })
        }
    }

    async getRNode(cluster: string) {

        const mongoCollection = this.rnodeCollections.get(cluster)
        if (mongoCollection == undefined)
            return undefined

        const rnodes = await mongoCollection.collection.find({}, { projection: { fnodes: 0, _id: 0 } }).toArray() ?? []

        let result: Handler.RNodeResponse['data'] = {
            meta: {
                clusterId: cluster,
                totalStorage: 0,
                hasStorage: 0,
                rnodeNum: rnodes.length,
                fnodeNum: rnodes.reduce((accu: number, curr: Getter.RNode) => accu + (curr.num_of_fnodes as number), 0),
                normalRate: 1.0,
            },
            rnodes: rnodes.map(val => {
                return {
                    rnode: val.rn_id,
                    cluster,
                    web: val.web,
                    proc: val.proc,
                    running: val.running,
                    loopStatus: val.loopStatus,
                    backendStatus: val.backendStatus,
                    runStatus: val.runStatus,
                    dead: false,
                    fnodeNum: val.num_of_fnodes as number,
                    totalStorage: val.totalStorage as number,
                    hasStorage: val.hasStorage as number,
                    state: true
                }
            })
        }

        return result
    }

    async getFNode(cluster: string, rnode: string, page: number, count: number) {
        const mongoCollection = this.rnodeCollections.get(cluster)?.collection
        if (mongoCollection == undefined)
            return undefined

        const doc = await mongoCollection.findOne({ rn_id: rnode })
        if (doc == null)
            return undefined

        const result: Handler.FNodeResponse['data'] = {
            meta: {
                clusterId: cluster,
                rnode,
                totalStorage: doc.totalStorage as number,
                hasStorage: doc.hasStorage as number,
                fnodeNum: doc.num_of_fnodes as number,
                state: true
            },
            fnodes: doc.fnodes.slice((page - 1) * count, page * count).map(val => {
                return {
                    fnid: val.fn_id,
                    rnode,
                    cluster,
                    fnStatus: val.fn_status,
                    usedM: val.usedM.toString(),
                    quotaM: val.quotaM.toString()
                }
            })
        }

        return result
    }

    getOverviewForCluster(cluster: string) {
        return this.clusterOverviews.get(cluster)
    }

}

export default ClusterGetter