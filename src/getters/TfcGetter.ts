import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";

const BUFFER_SIZE = 64

class TfcGetter extends GetterAbstract {

    blocksCollection = new CollectionAbstract<Getter.TfcBlock>(MongoClientShared, 'tfc', 'blocks')
    txCollection = new CollectionAbstract<Getter.TfcTransaction>(MongoClientShared, 'tfc', 'transactions')

    async task() {
        await this.cacheBlocks()
        await this.cacheTransactions()
    }

    initialize() {

    }

    async cacheBlocks() {

    }

    async cacheTransactions() {

    }

    async getBlocks(page: number, count: number, sortOrder: 'desc' | 'asc') {

    }

    async getBlockHeight() {
        
    }

}

export default TfcGetter