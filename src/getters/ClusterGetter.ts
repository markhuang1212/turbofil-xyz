import Env from '../env.json'
import CollectionAbstract from './CollectionAbstract'
import GetterAbstract from './GetterAbstract'
import fetch from 'node-fetch'
import { Getter, Handler } from '../Types'
import LoggerShared from '../LoggerShared'
import MongoClientShared from '../MongoClientShared'

const logger = LoggerShared.child({
    service: 'GETTER::CLUSTER'
})

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

/**
 * This handles the data of the clusters apis, including
 * /clusters/all
 * /clusters/overview
 * /clusters/:cluster/rnodes
 * /clusters/:cluster/fnodes
 */
class ClusterGetter extends GetterAbstract {

    initialize() {
        this.rnodeCollections.forEach((val) => {
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
        this.clusterRNodeInfo.forEach((_, key) => {
            this.rnodeCollections.set(key, new CollectionAbstract<Getter.RNode>(MongoClientShared, 'clusters', key))
        })
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
            logger.info({ uri }, `Caching overview for cluster ${cluster} success`)
        } catch (e) {
            logger.info({ uri }, `Cannot cache overview for cluster ${cluster}`)
        }
    }

    cacheOverview() {
        logger.info('Start caching overview')
        for (let [clusterName, clusterUri] of this.clusterOverviewsInfo) {
            this.cacheOverviewForCluster(clusterName, clusterUri)
        }
    }

    async cacheRNodesForCluster(cluster: string) {
        logger.info(`Start caching rnodes for cluster ${cluster}`)

        const collectionManaged = this.rnodeCollections.get(cluster)
        const webpageUri = this.clusterWebInfo.get(cluster)
        const rnodeUri = this.clusterRNodeInfo.get(cluster)

        if (!collectionManaged || !webpageUri || !rnodeUri) {
            throw Error(`Invalid cluster name`)
        }

        /** Argument check ends */

        const webPageResponse = await fetch(webpageUri)
        const webPageText = await webPageResponse.text()
        const rnodeInfo = webPageToClusterInfo(webPageText)

        const bulk = this.rnodeCollections.get(cluster)!.collection.initializeUnorderedBulkOp()

        for (let i = 0; i < rnodeInfo.length; i++) {

            if (rnodeInfo[i].web !== rnodeInfo[i].proc ||
                rnodeInfo[i].proc !== rnodeInfo[i].running ||
                typeof rnodeInfo[i].web !== 'string') {
                logger.info(`rnode ${rnodeInfo[i].rnId} in cluster ${cluster} is invalid.`)
                let rnode: Getter.RNode = {
                    rn_id: rnodeInfo[i].rnId,
                    runStatus: false,
                    backendStatus: false,
                    loopStatus: false,
                    web: rnodeInfo[i].web ?? '',
                    proc: rnodeInfo[i].proc ?? '',
                    running: rnodeInfo[i].running ?? '',
                    num_of_fnodes: 0,
                    fnodes: [],
                    totalStorage: 0,
                    hasStorage: 0
                }
                bulk.find({ rn_id: rnode.rn_id }).upsert().update({ $set: rnode })
                continue
            }

            const rnStatusUri = `${rnodeUri}/rnStatus/${rnodeInfo[i].rnId}`
            const fnStatusUri = `${rnodeUri}/fnStatus/${rnodeInfo[i].rnId}`

            const rnStatusJson: Getter.RNodeStatusResponse = await (await fetch(rnStatusUri)).json()
            const fnStatusJson: Getter.FNodeStatusResponse = await (await fetch(fnStatusUri)).json()

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
            bulk.find({ rn_id: rnode.rn_id }).upsert().update({ $set: rnode })

        }

        await bulk.execute()
        logger.info(`caching rnodes for cluster ${cluster} success`)

    }

    async cacheRNodes() {
        logger.info('Start caching rnodes')
        for (let [clusterName, _] of this.clusterRNodeInfo) {
            this.cacheRNodesForCluster(clusterName).catch(e => {
                logger.info(`Error when caching rnodes for cluster ${clusterName}`)
                logger.debug(e)
            })
        }
    }

    async getRNode(cluster: string) {

        const mongoCollection = this.rnodeCollections.get(cluster)
        if (mongoCollection == undefined)
            return undefined

        const rnodes = await mongoCollection.collection.find({}, { projection: { fnodes: 0, _id: 0 } }).toArray() ?? []

        const normalRate = rnodes.filter(v => v.runStatus).length / rnodes.length

        let result: Handler.RNodeResponse['data'] = {
            meta: {
                clusterId: cluster,
                totalStorage: rnodes.reduce((accu, v) => accu + v.totalStorage, 0),
                hasStorage: rnodes.reduce((accu, v) => accu + v.hasStorage, 0),
                rnodeNum: rnodes.length,
                fnodeNum: rnodes.reduce((accu: number, curr: Getter.RNode) => accu + (curr.num_of_fnodes as number), 0),
                normalRate,
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
                    dead: val.backendStatus,
                    fnodeNum: val.num_of_fnodes as number,
                    totalStorage: val.totalStorage as number,
                    hasStorage: val.hasStorage as number,
                    state: val.backendStatus
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

    async getClusterList() {
        const clusterNum = this.rnodeCollections.size
        let minerNum = 0
        let poolNum = 0
        const clustersData: Getter.ClusterListResponse['data']['clusters'] = []
        for (let [clusterId, dbCollection] of this.rnodeCollections.entries()) {
            const rnodes = await dbCollection.collection.find({}, { projection: { fnodes: 0 } }).toArray()
            minerNum += rnodes.reduce((accu: number, v) => accu + v.num_of_fnodes, 0)
            poolNum += rnodes.length
            clustersData.push({
                clusterId,
                rnodeNum: rnodes.length,
                fnodeNum: rnodes.reduce((accu: number, v: Getter.RNode) => accu + v.num_of_fnodes, 0),
                hasStorage: rnodes.reduce((accu: number, v: Getter.RNode) => accu + v.hasStorage, 0),
                totalStorage: rnodes.reduce((accu: number, v: Getter.RNode) => accu + v.totalStorage, 0),
                normalRate: rnodes.filter(v => v.runStatus).length / rnodes.length ?? 0
            })
        }
        const clusterList: Getter.ClusterListResponse['data'] = {
            meta: {
                poolNum, minerNum, clusterNum,
                totalStorage: clustersData.reduce((accu, v) => accu + v.totalStorage, 0),
                hasStorage: clustersData.reduce((accu, v) => accu + v.hasStorage, 0)
            },
            clusters: clustersData
        }
        return clusterList
    }

}

export default ClusterGetter