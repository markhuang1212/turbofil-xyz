import { RedisClient } from "redis";
import Env from "../Env";
import fetch from 'node-fetch'
import { promisify } from 'util'
import { MongoClient } from "mongodb";
import MongoClientShared from "../MongoClientShared";
import GetterAbstract from "./GetterAbstract";

interface Cluster {

}

class ClusterGetter extends GetterAbstract<Cluster> {

    static shared = new ClusterGetter()

    clusterInfo: Map<string, string>

    constructor() {
        super('clusters')
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