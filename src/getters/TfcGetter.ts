import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import Env from '../env.json'
import fetch from 'node-fetch'

const BUFFER_SIZE = 64
const SERVICE_NAME = 'GETTER::TFC'

class TfcGetter extends GetterAbstract {

    static shared = new TfcGetter()

    blocksCollection = new CollectionAbstract<Getter.TfcBlock>(MongoClientShared, 'tfc', 'blocks')
    txCollection = new CollectionAbstract<Getter.TfcTransaction>(MongoClientShared, 'tfc', 'transactions')

    async task() {
        await this.cacheBlocksAndTransactions()
    }

    initialize() {
        this.blocksCollection.collection.createIndex({ 'header.Height': 1 })
        this.blocksCollection.collection.createIndex({ 'header.Hash': 1 })
        this.txCollection.collection.createIndex({ id: 1 })
        this.txCollection.collection.createIndex({ timestamp: 1 })
    }

    async cacheBlocksAndTransactions() {
        console.log(`start caching TFC blocks.`)

        const blockHeightResponse: Getter.TfcBlockHeightResponse
            = await (await fetch(`${Env.tfc}/blockHeight`)).json()
        const blockHeight = blockHeightResponse.data.blockHeight

        for (let page = 1; page < Math.ceil(blockHeight / BUFFER_SIZE) + 1; page++) {
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

        console.log(`caching TFC blocks completed.`)
    }

    async getBlocks(page: number, count: number) {

        const blocks
            = await this.blocksCollection.collection.find().sort({ 'body.Height': -1 }).skip((page - 1) * count).limit(count).toArray()
        return blocks
    }

    async getBlockHeight() {
        const height
            = (await this.blocksCollection.collection.find().sort({ 'body.Height': -1 }).limit(1).next())?.header.Height ?? 0
        return height
    }

    async getTxs(page: number, count: number) {
        const txs =
            await this.txCollection.collection.find().sort({ timestamp: -1 }).skip((page - 1) * count).limit(count).toArray()
        return txs
    }

}

export default TfcGetter