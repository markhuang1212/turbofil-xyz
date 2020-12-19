import { Router } from "express";
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

ClusterHandler.get('/rnodes', (req, res) => {
    const cluster = req.query.cluster
})

ClusterHandler.get('/fnodes', (req, res) => {
    try {
        const cluster = req.query.cluster
        const rnode = req.query.rnode
        const page = parseInt((req.query.page as string) ?? '0')
        const count = parseInt((req.query.count as string) ?? '0')

        // const response: FNodeResponse = {
        //     code: 1,
        //     msg: 'success',
            
        // }

    } catch (e) {
        console.error(`error when getting fnodes with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default ClusterHandler