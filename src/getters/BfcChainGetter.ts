import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import dayjs from 'dayjs'
import CollectionAbstract from "./CollectionAbstract";
import Env from '../env.json'

const FIRST_DAY = '20200701'

class BfcChainGetter extends GetterAbstract {

    // uploadCollection = new CollectionAbstract<Getter.BfcChainUpload>(MongoClientShared, 'bfc-chain', 'uploads')
    rewardCollection = new CollectionAbstract<Getter.BfcChainReward>(MongoClientShared, 'bfc-chain', 'rewards')
    // rnTradeCollection= new CollectionAbstract(MongoClientShared, 'bfc-db', 'rn-trade')
    // fnTradeCollection= new CollectionAbstract(MongoClientShared, 'bfc-db', 'fn-trade')

    task() {
        this.cacheRewards()
    }
    initialize() {
        
    }

    async cacheRewards() {
        console.log('start caching BFC-Chain rewards.')
        
        console.log('caching for BFC-Chain rewards complete.')
    }


}

export default BfcChainGetter