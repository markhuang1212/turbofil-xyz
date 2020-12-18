import Env from '../env.json'
import CollectionAbstract from './CollectionAbstract'
import GetterAbstract from './GetterAbstract'
import fetch from 'node-fetch'

/**
 * The schema of the rnodes stored in MongoDB
 * It contains the fnodes information of rnodes
 * which is sorted.
 */
interface RNode {
    rn_id: string
    runStatus: boolean
    loopStatus: boolean
    backendStatus: boolean
    fnodes: {
        fn_id: string
        fn_status: string
        usedM: string
        quotaM: string
    }[]
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

    static shared = new ClusterGetter()

    /**
     * clusterName => the uri of the web page
     */
    clusterWebInfo: Map<string, string> = new Map(Object.entries(Env.clustersWeb))

    /**
     * clusterName => the uri of the rnode/fnode status api
     */
    clusterRNodeInfo: Map<string, string> = new Map(Object.entries(Env.clustersStatus))
    rnodeCollections: Map<string, CollectionAbstract<RNode>> = new Map()

    /**
     * clusterName => overview url
     */
    clusterOverviewsInfo: Map<string, string> = new Map(Object.entries(Env.clustersOverview))
    clusterOverviews: Map<string, Object> = new Map()


    constructor() {
        super()
        this.clusterRNodeInfo.forEach((val, key) => {
            this.rnodeCollections.set(key, CollectionAbstract.makeCollectionAbstract<RNode>('clusters', key))
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

        const rnodesId = webPageToRnodesId(webPageText)

        for (let i = 0; i < rnodesId.length; i++) {
            const rnStatusUri = `${rnodeUri}/rnStatus/${rnodesId[i]}`
            const fnStatusUri = `${rnodeUri}/fnStatus/${rnodesId[i]}`

            const rnStatusJson = await (await fetch(rnStatusUri)).json()
            const fnStatusJson = await (await fetch(fnStatusUri)).json()



        }

        console.log(`caching rnode for cluster ${cluster} success`)

    }

    async cacheRNodes() {
        console.log('caching rnodes')
        for (let [clusterName, _] of this.clusterRNodeInfo) {
            try {
                this.cacheRNodesForCluster(clusterName)
            } catch (e) {
                console.error(`error when caching cluster ${clusterName}`)
                console.error(e)
            }
        }
    }

    async getRNode() {

    }

    async getFNode() {

    }

    getOverviewForCluster(cluster: string) {
        return this.clusterOverviews.get(cluster)
    }

}

export default ClusterGetter