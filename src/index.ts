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

/**
 * This object is used for logging for Middlewares.
 * It inherit properties of ./LoggerShared.ts
 */
let expressPinoLogger = ExpressPinoLogger({
    logger: LoggerShared
})

/**
 * Display information in the shell in production mode
 */
if (process.env.NODE_ENV !== "development") {
    console.log('Turbofil-xyz backend start running. Logs is stored in ./logs.')
    console.log('To view the formatted logs, run "cat logs/file.log | npx pino-pretty"')
}

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'))

/**
 * This async function is called later.
 */
const start = async () => {
    /**
     * Mongodb needs to be connected before any requests is made.
     */
    await MongoClientShared.connect()
    LoggerShared.info('Mongo Client Connected.')

    /**
     * See Getter's task() and initialize() for details.
     * These functions are async.
     */
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

    /**
     * X-Total-Count header is needed for some front-end requests
     */
    app.use(cors({
        exposedHeaders: ['X-Total-Count']
    }))

    /**
     * Load Logger for Middlewares
     */
    app.use(expressPinoLogger)

    app.use('/bgc', BgcHandler)
    app.use(['/clusters', '/cluster'], ClusterHandler)
    app.use('/bfc', BfcTradeHandler)
    app.use('/bfcDb', BfcDbHandler)
    app.use('/bfcChain', BfcChainHandler)
    app.use('/tfc', TfcHandler)
    app.use('/erc', ErcHandler)

    /** GET Backend versions */
    app.get('/version', (req, res) => res.json({
        version: packageJson.version
    }))

    server = app.listen(Env.port, () => {
        LoggerShared.info({ port: Env.port }, `Turbofil-xyz Backend Server Listening.`)
    })

}

/**
 * Start the server
 */
start()

/**
 * Cleanup the server when receiving SIGTERM. It
 * 
 * 1. Close the http server
 * 2. Wait for all mongodb jobs to finish
 */
process.on('SIGTERM', () => {
    console.log('Cleaning up...')
    server.close(err => {
        if (err) {
            console.error('HTTP server closed with error')
            console.error(err)
        } else {
            console.log('HTTP Server closed')
        }
        MongoClientShared.close().then(() => {
            console.log('Mongo Client closed')
        }).catch(err => {
            console.error('Mongo Client closed with error')
            console.error(err)
        }).finally(() => {
            process.exit(0)
        })

    })
})