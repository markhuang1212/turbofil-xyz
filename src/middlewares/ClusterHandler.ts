import { Router } from "express";
import { BooleanLiteral } from "typescript";
import Env from '../env.json'
import ClusterGetter from "../getters/ClusterGetter";

const ClusterHandler = Router()

ClusterHandler.get('/all', (req, res) => {
    res.json({
        code: 200,
        msg: "success",
        clusters: Array.from(Object.keys(Env.clustersOverview))
    })
})

ClusterHandler.get('/overview', (req, res) => {

    const cluster = req.query.cluster

    if (typeof cluster !== 'string') {
        res.status(500).end()
        return
    }

    const overview = ClusterGetter.shared.getOverviewForCluster(cluster)

    if (overview === undefined) {
        res.status(500).end()
        return
    }

    res.json(overview)
})

interface RNodeResponse {
    code: 0,
    data: {
        meta: {
            clusterId: string
            totalStorage: number
            hasStorage: number
            rnodeNum: number
            fnodeNum: number
            normalRate: number
        },
        rnodes: {
            rnode: string
            cluster: string
            web: string
            proc: string
            running: string
            runStatus: boolean
            loopStatus: boolean
            backendStatus: boolean
            dead: boolean
            fnodeNum: number
            totalStorage: number
            hasStorage: number
            state: boolean
        }[]
    }
}

ClusterHandler.get('/:clusterName/rnodes', (req, res) => {

})

interface FNodeResponse {
    code: 0 | 1,
    msg: string
    data: {
        meta: {
            clusterId: string
            rnode: string
            totalStorage: number
            hasStorage: number
            fnodeNum: number
            state: boolean
        }
        fnodes: {
            fnid: string,
            rnode: string,
            cluster: string,
            fnStatus: string,
            usedM: string,
            quotaM: string
        }[]
    }
}

ClusterHandler.get('/:clusterName/fnodes', (req, res) => {

})

export default ClusterHandler