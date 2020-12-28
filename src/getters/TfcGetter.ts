import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";

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

    async getBlocks() {

    }

}

export default TfcGetter