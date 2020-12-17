import { Router } from "express";

const ClusterHandler = Router()

ClusterHandler.get('/all', (req, res) => {

})

ClusterHandler.get('/overview', (req, res) => {

})

ClusterHandler.get('/:clusterName/rnodes', (req, res) => {

})

ClusterHandler.get('/:clusterName/fnodes', (req, res) => {

})

export default ClusterHandler