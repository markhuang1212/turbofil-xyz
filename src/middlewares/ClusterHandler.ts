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

ClusterHandler.get('/:clusterName/rnodes', (req, res) => {

})

ClusterHandler.get('/:clusterName/fnodes', (req, res) => {

})

export default ClusterHandler