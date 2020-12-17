import express from 'express'
import BgcHandler from './middlewares/BgcHandler'
import ClusterHandler from './middlewares/ClusterHandler'

const app = express()

app.use('/bgc',BgcHandler)

app.use(['/clusters','cluster'], ClusterHandler)