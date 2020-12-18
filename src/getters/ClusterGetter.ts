
import Env from '../env.json'
import CollectionAbstract from './CollectionAbstract'
import GetterAbstract from './GetterAbstract'
import fetch from 'node-fetch'

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

class ClusterGetter extends GetterAbstract {

    static shared = new ClusterGetter()

    clusterWebInfo: Map<string, string> = new Map(Object.entries(Env.clustersWeb))

    clusterRNodeInfo: Map<string, string> = new Map(Object.entries(Env.clustersStatus))
    rnodeCollections: Map<string, CollectionAbstract<RNode>> = new Map()

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

    async cacheRNodesForCluster(cluster: string, uri: string) {
        const collection = this.rnodeCollections.get(cluster)
        if (collection === undefined) {
            throw (`Mongo collection for cluster ${cluster} not defined.`)
        }
    }

    async cacheRNodes() {
        console.log('caching rnodes')
        for (let [clusterName, clusterUri] of this.clusterRNodeInfo) {
            this.cacheRNodesForCluster(clusterName, clusterUri)
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