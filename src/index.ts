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
import http from 'http'
import LoggerShared from './LoggerShared'
import ExpressPinoLogger from 'express-pino-logger'

let app!: Express
let server: http.Server
let expressPinoLogger = ExpressPinoLogger({
    logger: LoggerShared
})

console.log('Turbofil-xyz backend start running. Logs is stored in ./logs.')
console.log('To view the formatted logs, run "cat logs/file.log | npx pino-pretty"')

const start = async () => {
    await MongoClientShared.connect()
    LoggerShared.info('Mongo Client Connected.')

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

    app.use(cors({
        exposedHeaders: ['X-Total-Count']
    }))

    app.use(expressPinoLogger)

    app.use('/bgc', BgcHandler)
    app.use(['/clusters', '/cluster'], ClusterHandler)
    app.use('/bfc', BfcTradeHandler)
    app.use('/bfcDb', BfcDbHandler)
    app.use('/bfcChain', BfcChainHandler)
    app.use('/tfc', TfcHandler)
    app.use('/erc', ErcHandler)

    server = app.listen(Env.port, () => {
        LoggerShared.info({ port: Env.port }, `Turbofil-xyz Backend Server Listening.`)
    })

}

start()