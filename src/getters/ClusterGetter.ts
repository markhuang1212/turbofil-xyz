
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

    

    rnodeCollections: Map<string, CollectionAbstract<RNode>>
    clusterOverviewsInfo: Map<string, string>
    clusterOverviews: Map<string, Object>

    constructor() {
        super()
        this.clusterOverviewsInfo = new Map(Object.entries(Env.clustersOverview))
        this.rnodeCollections = new Map()
        this.clusterOverviews = new Map()
        this.clusterOverviewsInfo.forEach((val, key) => {
            this.rnodeCollections.set(key, CollectionAbstract.makeCollectionAbstract<RNode>('clusters', key))
        })
        this.periodic()
    }

    task(){
        this.cacheOverview()
        this.cacheRNodes()
        this.cacheFNodes()
    }

    async cacheOverviewForCluster(cluster: string, uri: string) {
        try {
            const fetch_uri = `${uri}/stats/overview`
            const response = await fetch(fetch_uri)
            const responseJson = await response.json()
            this.clusterOverviews.set(cluster, responseJson)
            console.log(`overview for cluster ${cluster} finished.`)
        } catch(e) {
            console.error(`error occurred when caching overview for cluster ${cluster}`)
            console.error(e)
        }
    }

    async cacheOverview() {
        console.log('caching overviews')
        for (let [clusterName, clusterUri] of this.clusterOverviewsInfo) {
            await this.cacheOverviewForCluster(clusterName, clusterUri)
        }
    }

    async cacheRNodes() {

    }

    async cacheFNodes() {

    }

    async getRNodes() {

    }

    async getFNodes() {

    }

    getOverviewForCluster(cluster: string) {
        return this.clusterOverviews.get(cluster)
    }

}

export default ClusterGetter