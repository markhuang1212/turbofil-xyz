import { Router } from "express";
import Env from "../Env";
import ClusterGetter from "../getters/ClusterGetter";

const ClusterHandler = Router()

ClusterHandler.get('/all', (req, res) => {
    res.json({
        code: 200,
        msg: "success",
        clusters: Array.from(Env.clusters.keys())
    })
})

ClusterHandler.get('/overview', (req, res) => {
    
})

ClusterHandler.get('/:clusterName/rnodes', (req, res) => {

})

ClusterHandler.get('/:clusterName/fnodes', (req, res) => {

})

export default ClusterHandler