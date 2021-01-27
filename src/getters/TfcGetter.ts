import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import Env from '../env.json'
import fetch from 'node-fetch'
import LoggerShared from "../LoggerShared";

const BUFFER_SIZE = 64
const logger = LoggerShared.child({ service: 'GETTER::TFC' })
const META_KEY_TFC_DB_BLOCKS_AND_TXS = 'tfc-db-blocks-and-transactions'

class TfcGetter extends GetterAbstract {

    static shared = new TfcGetter()

    blocksCollection = new CollectionAbstract<Getter.TfcBlock>(MongoClientShared, 'tfc', 'blocks')
    txCollection = new CollectionAbstract<Getter.TfcTransaction>(MongoClientShared, 'tfc', 'transactions')
    metaCollection = new CollectionAbstract<Getter.DBMetaData>(MongoClientShared, 'meta', 'meta')

    async task() {
        try {
            await this.cacheBlocksAndTransactions()
            await this.metaCollection.collection.updateOne({
                key: META_KEY_TFC_DB_BLOCKS_AND_TXS
            }, {
                $set: {
                    success: true
                }
            }, { upsert: true })
        } catch (e) {
            await this.metaCollection.collection.updateOne({
                key: META_KEY_TFC_DB_BLOCKS_AND_TXS
            }, {
                $set: {
                    success: false
                }
            }, { upsert: true })
            logger.error('Error when caching TFC blocks and transactions')
            logger.error(e)
        }
    }

    initialize() {
        this.blocksCollection.collection.createIndex({ 'header.Height': 1 })
        this.blocksCollection.collection.createIndex({ 'header.Hash': 1 })
        this.txCollection.collection.createIndex({ id: 1 })
        this.txCollection.collection.createIndex({ timestamp: 1 })
    }

    async cacheBlocksAndTransactions() {
        logger.info(`start caching TFC blocks.`)

        const blockHeightResponse: Getter.TfcBlockHeightResponse
            = await (await fetch(`${Env.tfc}/blockHeight`)).json()
        const blockHeight = blockHeightResponse.data.blockHeight

        const blockExistCount = await this.blocksCollection.collection.countDocuments()

        if (blockHeight === blockExistCount) {
            logger.info('No TFC blocks to cache.')
            return
        }

        let page = 1;
        const meta = await this.metaCollection.collection.findOne({ key: META_KEY_TFC_DB_BLOCKS_AND_TXS })
        if (meta?.success === true) {
            page = Math.floor(blockExistCount / BUFFER_SIZE) + 1
        }

        for (; page < Math.ceil(blockHeight / BUFFER_SIZE) + 1; page++) {
            const blockResponse: Getter.TfcBlockResponse
                = await (await fetch(`${Env.tfc}/blocks?page=${page}&count=${BUFFER_SIZE}`)).json()
            const blocks = blockResponse.data.blocks

            const block_bulk = this.blocksCollection.collection.initializeUnorderedBulkOp()
            const tx_bulk = this.txCollection.collection.initializeUnorderedBulkOp()

            for (let block of blocks) {
                const doc: Getter.TfcBlock = {
                    header: block.header,
                    body: {
                        transactions: block.body.transactions.map(v => { return { id: v.id } })
                    }
                }
                block_bulk.find({ 'header.Hash': doc.header.Hash }).upsert().update({
                    $set: doc
                })
                for (let tx of block.body.transactions) {
                    tx_bulk.find({ id: tx.id }).upsert().update({
                        $set: tx
                    })
                }
            }
            await Promise.all([
                tx_bulk.execute(),
                block_bulk.execute(),
            ])
        }

        logger.info(`caching TFC blocks completed.`)
    }

    async getBlocks(page: number, count: number) {

        const blocks
            = await this.blocksCollection.collection.find().sort({ 'header.Height': -1 }).skip((page - 1) * count).limit(count).toArray()
        return blocks
    }

    async getBlockHeight() {
        const height
            = (await this.blocksCollection.collection.find().sort({ 'header.Height': -1 }).limit(1).next())?.header.Height ?? 0
        return height
    }

    async getTxCount() {
        const height = await this.txCollection.collection.countDocuments()
        return height
    }

    async getTxs(page: number = 1, count: number = 1) {
        const txs =
            await this.txCollection.collection.find().sort({ timestamp: -1 }).skip((page - 1) * count).limit(count).toArray()
        return txs
    }

}

export default TfcGetter