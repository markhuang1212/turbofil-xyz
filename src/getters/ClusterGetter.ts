import { RedisClient } from "redis";
import Env from "../Env";
import RedisClientShared from "../RedisClientShared";
import http from 'http'

class ClusterGetter {

    static shared = new ClusterGetter(RedisClientShared)

    client: RedisClient
    clusterInfo: Map<string, string>

    constructor(redisClient: RedisClient) {
        this.client = redisClient
        this.clusterInfo = Env.clusters
        setInterval(() => {
            this.cacheOverview()
            this.cacheRNodes()
            this.cacheFNodes()
        }, Env.jobIntervalSeconds * 1000)
    }

    cacheOverview() {
        // const connection = http.request('')
    }

    cacheRNodes() {
        
    }

    cacheFNodes() {

    }

}

export default ClusterGetter