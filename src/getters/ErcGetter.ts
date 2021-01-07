import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import Env from '../env.json'
import LoggerShared from "../LoggerShared";

const BUFFER_SIZE = 100
const logger = LoggerShared.child({ service: 'GETTER::ERC' })

class ErcGetter extends GetterAbstract {

    static shared = new ErcGetter()

    blocksCollection = new CollectionAbstract<Getter.ErcBlock>(MongoClientShared, 'tfc-erc', 'blocks')
    txsCollection = new CollectionAbstract<Getter.ErcTransaction>(MongoClientShared, 'tfc-erc', 'txs')

    async task() {
        try {
            await this.cacheBlocks()
        } catch (e) {
            logger.error(`error when caching ERC20 blocks`)
            logger.error(e)
        }
        try {
            await this.cacheTxs()
        } catch (e) {
            logger.error(`error when caching ERC20 transactions`)
            logger.error(e)
        }
    }

    initialize() {
        this.blocksCollection.collection.createIndex({ timestamp: 1 })
        this.blocksCollection.collection.createIndex({ height: 1 })
        this.txsCollection.collection.createIndex({ hash: 1 })
        this.txsCollection.collection.createIndex({ blockHeight: 1 })
    }

    async cacheBlocks() {
        logger.info('start caching ERC blocks')
        const bulk = this.blocksCollection.collection.initializeUnorderedBulkOp()
        for (let p = 1; true; p++) {
            const response = await (await fetch(`${Env.erc}/blocks?page=${p}&count=${BUFFER_SIZE}&sortOrder=asc`)).json() as Getter.ErcBlocksResponse
            if (response.data.blocks.length == 0)
                break;
            for (let block of response.data.blocks) {
                const blockInfoResponse = await (await fetch(`${Env.erc}/blockinfo?height=${block.height}`)).json() as Getter.ErcBlockInfoResponse
                bulk.find({ hash: block.hash }).upsert().updateOne({
                    $set: blockInfoResponse.data.block
                })
            }
        }
        await bulk.execute()
        logger.info('caching ERC blocks complete.')
    }

    async cacheTxs() {
        logger.info('start caching ERC txs')
        const bulk = this.txsCollection.collection.initializeUnorderedBulkOp()
        for (let p = 1; true; p++) {
            const uri = `${Env.erc}/txs?page=${p}&count=${BUFFER_SIZE}&sortOrder=asc`
            const response = await (await fetch(uri)).json() as Getter.ErcTxsResponse
            if (response.data.txs.length == 0)
                break;
            for (let tx of response.data.txs) {
                const txInfoResponse = await (await fetch(`${Env.erc}/tx/${tx.hash}`)).json() as Getter.ErcTxResponse
                bulk.find({ hash: tx.hash }).upsert().updateOne({
                    $set: txInfoResponse.data.tx
                })
            }
        }
        await bulk.execute()
        logger.info('caching ERC txs complete.')
    }

    async getBlocks(page: number, count: number, sortOrder: 'desc' | 'asc') {
        const SORT_ORDER = sortOrder == 'asc' ? -1 : 1
        return this.blocksCollection.collection.find({}, {
            projection: {
                hash: 1,
                height: 1,
                parentHash: 1,
                timestamp: 1,
                transactions: 1
            }
        }).sort({ timestamp: SORT_ORDER }).skip((page - 1) * count).limit(count).toArray()
    }

    async getBlock(height: number) {
        return (await this.blocksCollection.collection.findOne({ height })) ?? undefined
    }

    async getTxs(page: number, count: number, sortOrder: 'desc' | 'asc') {
        const SORT_ORDER = sortOrder == 'asc' ? 1 : -1
        return this.txsCollection.collection.find({}, {
            projection: {
                hash: 1, blockHash: 1, blockHeight: 1
            }
        }).sort({ blockHeight: SORT_ORDER }).skip((page - 1) * count).limit(count).toArray()
    }

    async getTx(txid: string) {
        return (await this.txsCollection.collection.findOne({ hash: txid })) ?? undefined
    }

    async getTxCount() {
        return this.txsCollection.collection.countDocuments()
    }

    async getBlockCount() {
        return this.blocksCollection.collection.countDocuments()
    }
}

export default ErcGetter