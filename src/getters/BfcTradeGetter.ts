import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import Env from '../env.json'

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

    task() {

    }

    async getBlocksAndTransactions() {
        const response = await fetch(Env.bfcBlocks)
        const hasHeight = (await response.json()).Height

        const docCursor = this.blockCollection.collection.find().sort({ block_height: -1 }).limit(1)
        const currHeight = (await docCursor.next())?.block_height ?? 0

        if (currHeight == hasHeight)
            return

        const blocksResponse =
            await (await fetch(`${Env.bfcBlocks}?start=${currHeight + 1}&count=${hasHeight - currHeight}`)).json()
        
        
    }

    constructor() {
        super()
    }

}

export default BfcTradeGetter