import express from 'express'
import Env from './Env'
import BgcHandler from './middlewares/BgcHandler'
import ClusterHandler from './middlewares/ClusterHandler'

const app = express()

app.use('/bgc', BgcHandler)

app.use(['/clusters', 'cluster'], ClusterHandler)

app.listen(Env.port, () => {
    console.log(`listening at port ${Env.port}`)
})