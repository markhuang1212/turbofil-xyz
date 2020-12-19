import { Router } from "express";
import Env from '../env.json'
import ClusterGetter from "../getters/ClusterGetter";
import { Handler } from "../Types";

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

ClusterHandler.get('/rnodes', async (req, res) => {
    try {

        const cluster = req.query.cluster

        const result = await ClusterGetter.shared.getRNode(cluster as string)

        if (result === undefined)
            throw Error()

        const response: Handler.RNodeResponse = {
            code: 0,
            data: result
        }

        res.json(response)

    } catch (e) {
        console.error(e)
        res.status(500).end()
    }

})

ClusterHandler.get('/fnodes', async (req, res) => {
    try {
        const cluster = req.query.cluster
        const rnode = req.query.rnode
        const page = parseInt((req.query.page as string) ?? '0')
        const count = parseInt((req.query.count as string) ?? '0')

        if (typeof cluster !== 'string' || typeof rnode !== 'string')
            throw Error()

        const result = await ClusterGetter.shared.getFNode(cluster, rnode, page, count)

        if (result == undefined)
            throw Error()

        const response: Handler.FNodeResponse = {
            code: 0,
            data: result,
            msg: 'success'
        }

        res.json(response)

    } catch (e) {
        console.error(`error when getting fnodes with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default ClusterHandler