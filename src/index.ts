import express, { Express } from 'express'
import Env from './env.json'
import BfcChainGetter from './getters/BfcChainGetter'
import BfcDbGetter from './getters/BfcDbGetter'
import BfcTradeGetter from './getters/BfcTradeGetter'
import BgcGetter from './getters/BgcGetter'
import ClusterGetter from './getters/ClusterGetter'
import TfcGetter from './getters/TfcGetter'
import BfcChainHandler from './middlewares/BfcChainHandler'
import BfcDbHandler from './middlewares/BfcDbHandler'
import BfcTradeHandler from './middlewares/BfcTradeHandler'
import BgcHandler from './middlewares/BgcHandler'
import ClusterHandler from './middlewares/ClusterHandler'
import TfcHandler from './middlewares/TfcHandler'
import MongoClientShared from './MongoClientShared'
import cors from 'cors'
import ErcGetter from './getters/ErcGetter'
import ErcHandler from './middlewares/ErcHandler'

let app!: Express

const start = async () => {
    await MongoClientShared.connect()
    console.log('mongo client connected.')

    ClusterGetter.shared.initialize()
    ClusterGetter.shared.task()
    BfcTradeGetter.shared.initialize()
    BfcTradeGetter.shared.task()
    BfcDbGetter.shared.initialize()
    BfcDbGetter.shared.task()
    BfcChainGetter.shared.initialize()
    BfcChainGetter.shared.task()
    BgcGetter.shared.initialize()
    BgcGetter.shared.task()
    TfcGetter.shared.initialize()
    TfcGetter.shared.task()
    ErcGetter.shared.initialize()
    ErcGetter.shared.task()

    app = express()

    app.use(cors())

    app.use('/bgc', BgcHandler)

    app.use(['/clusters', '/cluster'], ClusterHandler)
    app.use('/bfc', BfcTradeHandler)
    app.use('/bfcDb', BfcDbHandler)
    app.use('/bfcChain', BfcChainHandler)
    app.use('/tfc', TfcHandler)
    app.use('/erc', ErcHandler)

    app.listen(Env.port, () => {
        console.log(`listening at port ${Env.port}`)
    })

}

start()

process.on('SIGTERM', () => {
    console.log('Server to terminate.')
    process.exit(0)
})