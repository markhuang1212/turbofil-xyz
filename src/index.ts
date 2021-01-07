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
import fs from 'fs'
import path from 'path'

let app!: Express
let server: http.Server
let expressPinoLogger = ExpressPinoLogger({
    logger: LoggerShared
})

if (process.env.NODE_ENV !== "development") {
    console.log('Turbofil-xyz backend start running. Logs is stored in ./logs.')
    console.log('To view the formatted logs, run "cat logs/file.log | npx pino-pretty"')
}

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))

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

    app.get('/version', (req, res) => res.json({
        version: packageJson.version
    }))

    server = app.listen(Env.port, () => {
        LoggerShared.info({ port: Env.port }, `Turbofil-xyz Backend Server Listening.`)
    })

}

declare module 'http' {
    interface Server {
        closeAsync: () => Promise<void>
    }
}

http.Server.prototype.closeAsync = function () {
    return new Promise((res, rej) => {
        this.close(err => {
            if (err)
                rej(err)
            res()
        })
    })
}

start()

process.on('SIGTERM', () => {
    console.log('Cleaning up...')
    Promise.all([
        server.closeAsync().then(() => console.log('HTTP Server closed.')),
        MongoClientShared.close(false).then(() => console.log('Mongo Client closed.'))
    ]).then(() => {
        console.log('Exiting...')
        process.exit(0)
    }).catch(e => {
        console.log('Exit with error.')
        console.log(e)
        process.exit(0)
    })
})