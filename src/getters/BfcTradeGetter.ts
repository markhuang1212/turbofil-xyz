import MongoClientShared from "../MongoClientShared";
import { Getter, Handler } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import Env from '../env.json'
import fetch from 'node-fetch'

class BfcTradeGetter extends GetterAbstract {

    static shared = new BfcTradeGetter()

    blockCollection: CollectionAbstract<Getter.BfcBlock> =
        new CollectionAbstract(MongoClientShared, 'bfc-trade', 'blocks')
    txCollection: CollectionAbstract<Getter.BfcTransaction> =
        new CollectionAbstract(MongoClientShared, 'bfc-trade', 'transactions')

    initialize() {
        this.blockCollection.collection.createIndex({ block_hash: 1 })
        this.blockCollection.collection.createIndex({ block_height: 1 })
        this.txCollection.collection.createIndex({ tx_id: 1 })
    }

    async task() {
        try {
            console.log('start getting BFC blocks and transactions')
            await this.cacheBlocksAndTransactions()
            console.log('getting BFC blocks and transactions finished')
        } catch (e) {
            console.error('error when getting BFC blocks and transactions')
            console.error(e)
        }
    }

    async cacheBlocksAndTransactions() {
        const response = await fetch(Env.bfcBlocks)
        const hasHeight = (await response.json()).Height

        const docCursor = this.blockCollection.collection.find().sort({ block_height: -1 }).limit(1)
        const currHeight = (await docCursor.next())?.block_height ?? 0

        if (currHeight == hasHeight)
            return

        const blocksResponse: Getter.BfcBlocksResponse =
            await (await fetch(`${Env.bfcBlocks}?start=${currHeight + 1}&count=${hasHeight - currHeight}`)).json()

        for (let blockObj of blocksResponse.Block) {
            const block: Getter.BfcBlock = {
                block_height: blockObj.Height,
                block_hash: blockObj.Hash,
                prev_hash: blockObj.PrevBlockHash,
                producer: blockObj.Producer,
                timestamp: blockObj.Timestamp,
                tx_count: blockObj.TxCount,
                tx_ids: Object.keys(blockObj.TransactionMap)
            }
            const txs: Getter.BfcTransaction[] = Object.values(blockObj.TransactionMap).map(val => {
                const body = val
                const tx: Getter.BfcTransaction = {
                    tx_id: body.TransactionID,
                    timestamp: body.TimeStamp,
                    tx_type: body.TransactionType,
                    block_hash: block.block_hash,
                    tx_body: {
                        contract: {
                            id: body.TransactionBody.id,
                            address: body.TransactionBody.address,
                            type: body.TransactionBody.type,
                            signature: body.TransactionBody.signature,
                            timestamp: body.TransactionBody.timestamp,
                            payload: body.TransactionBody.payload,
                            pub_key: body.TransactionBody.pubkey
                        }
                    }
                }
                return tx
            })
            await this.blockCollection.collection.updateOne({ block_hash: block.block_hash }, { $set: block }, { upsert: true })
            for (let tx of txs) {
                await this.txCollection.collection.updateOne({ tx_id: tx.tx_id }, { $set: tx }, { upsert: true })
            }
        }
    }

    async getBlocks(page: number, count: number, sortOrder: 'desc' | 'asc'): Promise<Handler.BfcBlocksResponse['data']> {
        const num_of_blocks = await this.blockCollection.collection.countDocuments({})

        const blocksDoc = await this.blockCollection.collection.find({}).sort({
            timestamp: sortOrder == 'asc' ? 1 : -1
        }).skip((page - 1) * count).limit(count).toArray()

        return {
            metaData: {
                count,
                page,
                totalCount: num_of_blocks
            },
            blocks: blocksDoc.map(doc => {
                return {
                    BlockHeight: doc.block_height,
                    BlockHash: doc.block_hash,
                    Timestamp: doc.timestamp,
                    TxCount: doc.tx_count,
                    Producer: doc.producer
                }
            })
        }

    }

    async getBlock(blockHash: string) {
        const block = await this.blockCollection.collection.findOne({ block_hash: blockHash })
        if (block == null)
            return
        const data: Handler.BfcBlockResponse['data'] = {
            BlockHash: block.block_hash,
            BlockHeight: block.block_height,
            PrevBlockHash: block.prev_hash,
            Timestamp: block.timestamp,
            TxCount: block.tx_count,
            Txids: block.tx_ids,
            Producer: block.producer
        }
        return data
    }

    async cacheUploads() {

    }



    async makeLineChartData() {

    }

    constructor() {
        super()
    }

}

export default BfcTradeGetter