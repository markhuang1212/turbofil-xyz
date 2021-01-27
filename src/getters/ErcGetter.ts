import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import Env from '../env.json'
import LoggerShared from "../LoggerShared";
import MetaGetter from "./MetaGetter";

const BUFFER_SIZE = 100
const META_KEY_ERC_BLOCKS = 'tfc-erc-blocks'
const META_KEY_ERC_TXS = 'tfc-erc-transactions'
const logger = LoggerShared.child({ service: 'GETTER::ERC' })

class ErcGetter extends GetterAbstract {

    static shared = new ErcGetter()

    blocksCollection = new CollectionAbstract<Getter.ErcBlock>(MongoClientShared, 'tfc-erc', 'blocks')
    txsCollection = new CollectionAbstract<Getter.ErcTransaction>(MongoClientShared, 'tfc-erc', 'txs')
    metaCollection = new CollectionAbstract<Getter.DBMetaData>(MongoClientShared, 'meta', 'meta')

    async task() {
        try {
            await this.cacheBlocks()
            await MetaGetter.shared.setSuccess(META_KEY_ERC_BLOCKS, true)
        } catch (e) {
            await MetaGetter.shared.setSuccess(META_KEY_ERC_BLOCKS, false)
            logger.error(`error when caching ERC20 blocks`)
            logger.error(e)
        }
        try {
            await this.cacheTxs()
            await MetaGetter.shared.setSuccess(META_KEY_ERC_TXS, true)
        } catch (e) {
            await MetaGetter.shared.setSuccess(META_KEY_ERC_TXS, false)
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

        let p = 1
        const blockCountExist = await this.blocksCollection.collection.countDocuments()
        const success = await MetaGetter.shared.isSuccess(META_KEY_ERC_BLOCKS)
        if (success) {
            p = Math.floor(blockCountExist / BUFFER_SIZE) + 1
        }

        for (; true; p++) {
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
        if (bulk.length >= 1)
            await bulk.execute()
        logger.info('caching ERC blocks complete.')
    }

    async cacheTxs() {
        logger.info('start caching ERC txs')
        const bulk = this.txsCollection.collection.initializeUnorderedBulkOp()
        let p = 1
        const txCountExist = await this.txsCollection.collection.countDocuments()
        const success = MetaGetter.shared.isSuccess(META_KEY_ERC_TXS)

        if (success) {
            p = Math.floor(txCountExist / BUFFER_SIZE) + 1
        }

        for (; true; p++) {
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
        const SORT_ORDER = sortOrder == 'asc' ? 1 : -1
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