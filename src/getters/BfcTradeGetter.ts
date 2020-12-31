import MongoClientShared from "../MongoClientShared";
import { Getter, Handler } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import Env from '../env.json'
import fetch from 'node-fetch'
import dayjs, { Dayjs } from "dayjs";

import quarterOfYear from 'dayjs/plugin/quarterOfYear'

dayjs.extend(quarterOfYear)

class BfcTradeGetter extends GetterAbstract {

    static shared = new BfcTradeGetter()

    blockCollection: CollectionAbstract<Getter.BfcBlock> =
        new CollectionAbstract(MongoClientShared, 'bfc-trade', 'blocks')
    txCollection: CollectionAbstract<Getter.BfcTransaction> =
        new CollectionAbstract(MongoClientShared, 'bfc-trade', 'transactions')

    // read-only
    uploadsCollection = new CollectionAbstract<Getter.BfcDbUpload>(MongoClientShared, 'bfc-db', 'uploads')
    // read-only
    rewardsCollection = new CollectionAbstract<Getter.BfcChainReward>(MongoClientShared, 'bfc-chain', 'rewards')

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
                            ...body.TransactionBody
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

    async getTxs(page: number, count: number, sortOrder: 'desc' | 'asc'): Promise<Handler.BfcTransactionsResponse['data']> {
        const total_count = await this.txCollection.collection.countDocuments()
        const txsDoc = await this.txCollection.collection.find({}, {
            projection: { timestamp: 1, tx_id: 1 }
        }).sort({
            timestamp: sortOrder == 'asc' ? 1 : -1
        }).skip((page - 1) * count).limit(count).toArray()

        return {
            metaData: {
                totalCount: total_count,
                page, count
            },
            txs: txsDoc.map(v => {
                return {
                    Txid: v.tx_id,
                    Timestamp: v.timestamp
                }
            })
        }
    }

    async getTx(tx_id: string) {
        const txDoc = await this.txCollection.collection.findOne({ tx_id })
        if (txDoc == null)
            return

        const data: Handler.BfcTransactionResponse['data'] = {
            Txid: txDoc.tx_id,
            BlockHash: txDoc.block_hash,
            Timestamp: txDoc.timestamp,
            TxType: txDoc.tx_type,
            TxBody: {
                Contract: {
                    ID: txDoc.tx_body.contract.id,
                    Type: txDoc.tx_body.contract.type,
                    Timestamp: txDoc.tx_body.contract.timestamp,
                    Signature: txDoc.tx_body.contract.signature,
                    Pubkey: txDoc.tx_body.contract.pub_key,
                    Address: txDoc.tx_body.contract.address,
                    Payload: txDoc.tx_body.contract.payload ? JSON.parse(
                        JSON.stringify(txDoc.tx_body.contract.payload)
                            .replace('accountFrom', 'AccountFrom')
                            .replace('accountTo', 'AccountTo')
                            .replace('coinNum', 'CoinNum')
                            .replace('fileid', 'FileId')
                            .replace('duration', 'Duration')
                            .replace('fee', 'Fee')
                            .replace('fileLengthKiB', 'FileLengthKiB')
                            .replace('storageExp', 'StorageExp')
                            .replace('field', 'Field')
                            .replace('cluster', 'Cluster')
                            .replace('uploader', 'Uploader')
                    ) : {}
                }
            }
        }

        return data
    }

    async getLineChartData(_interval: Handler.BfcLineChartInterval) {
        const interval = <any>_interval

        const end_of_curr_period = dayjs().endOf(interval)
        const intervals = [
            end_of_curr_period.subtract(7, interval).toDate(),
            end_of_curr_period.subtract(6, interval).toDate(),
            end_of_curr_period.subtract(5, interval).toDate(),
            end_of_curr_period.subtract(4, interval).toDate(),
            end_of_curr_period.subtract(3, interval).toDate(),
            end_of_curr_period.subtract(2, interval).toDate(),
            end_of_curr_period.subtract(1, interval).toDate(),
            end_of_curr_period.toDate()
        ]

        let rewards_count: number[] = []
        let uploads_count: number[] = []

        for (let i = 0; i < 7; i++) {
            rewards_count[i] = await this.rewardsCollection.collection.countDocuments({
                date: {
                    $lt: intervals[i + 1],
                    $gte: intervals[i]
                }
            })
            uploads_count[i] = await this.uploadsCollection.collection.countDocuments({
                date: {
                    $lt: intervals[i + 1],
                    $gte: intervals[i]
                }
            })
        }

        return {
            labels: intervals.map(v => dayjs(v).format('YYYY-MM-DD')),
            uploads: uploads_count,
            rewards: rewards_count
        } as Handler.BfcLineChartDataResponse['data']
    }

}

export default BfcTradeGetter