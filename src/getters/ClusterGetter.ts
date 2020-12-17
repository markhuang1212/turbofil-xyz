import { RedisClient } from "redis";
import Env from "../Env";
import fetch from 'node-fetch'
import { promisify } from 'util'
import { MongoClient } from "mongodb";
import MongoClientShared from "../MongoClientShared";


class ClusterGetter {

    static shared = new ClusterGetter(MongoClientShared)

    client: MongoClient
    clusterInfo: Map<string, string>

    constructor(client: MongoClient) {
        this.client = client
        this.clusterInfo = Env.clusters
        
    }

    async cacheOverviewForCluster(cluster: string, uri: string) {
        
    }

    async cacheOverview() {
        console.log('caching overviews')
        for (let [clusterName, clusterUri] of this.clusterInfo) {
            await this.cacheOverviewForCluster(clusterName, clusterUri)
        }
    }

    async cacheRNodes() {

    }

    async cacheFNodes() {

    }

    async getOverviewForCluster(cluster: string) {
        
    }

}

export default ClusterGetter