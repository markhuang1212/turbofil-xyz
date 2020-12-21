import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";

class BfcTradeGetter extends GetterAbstract {

    static shared = new BfcTradeGetter()

    bfcCollection: CollectionAbstract<Getter.BfcBlock> = new CollectionAbstract(MongoClientShared, 'bfc-trade', 'blocks')

    initialize() {
        
    }
    
    task() {
        throw new Error("Method not implemented.")
    }

    constructor() {
        super()
    }

}

export default BfcTradeGetter