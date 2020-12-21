import express from 'express'
import Env from './env.json'
import BfcTradeGetter from './getters/BfcTradeGetter'
import ClusterGetter from './getters/ClusterGetter'
import BgcHandler from './middlewares/BgcHandler'
import ClusterHandler from './middlewares/ClusterHandler'
import MongoClientShared from './MongoClientShared'

const start = async () => {
    await MongoClientShared.connect()
    console.log('mongo client connected.')

    ClusterGetter.shared.initialize()
    ClusterGetter.shared.task()

    // BfcTradeGetter.

    const app = express()

    app.use('/bgc', BgcHandler)

    app.use(['/clusters', '/cluster'], ClusterHandler)

    app.listen(Env.port, () => {
        console.log(`listening at port ${Env.port}`)
    })

}

start()