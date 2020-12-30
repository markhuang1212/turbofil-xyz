import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import dayjs from 'dayjs'
import CollectionAbstract from "./CollectionAbstract";
import Env from '../env.json'

const FIRST_DAY = '20200701'

class BfcChainGetter extends GetterAbstract {

    static shared = new BfcChainGetter()

    rewardCollection = new CollectionAbstract<Getter.BfcChainReward>(MongoClientShared, 'bfc-chain', 'rewards')
    // rnTradeCollection= new CollectionAbstract(MongoClientShared, 'bfc-db', 'rn-trade')
    // fnTradeCollection= new CollectionAbstract(MongoClientShared, 'bfc-db', 'fn-trade')

    async task() {
        await this.cacheRewards()
    }

    async initialize() {
        // await this.rewardCollection.collection.createIndex({ field: 1, fileid: 1 })
        await this.rewardCollection.collection.createIndex({ date: 1 })
    }

    async cacheRewards() {
        console.log('start caching BFC-Chain rewards.')

        const most_recent_doc = await this.rewardCollection.collection.find().sort({ date: -1 }).limit(1).next()
        let day_temp = most_recent_doc?.date ? dayjs(most_recent_doc.date) : dayjs(FIRST_DAY)

        const next_day = dayjs().add(1, 'day')
        while (day_temp.isBefore(next_day, 'day')) {
            const dateStr = day_temp.format('YYYYMMDD')
            const countResponse = await fetch(`${Env.bfcChain}/rewards?page=1&count=1&date=${dateStr}`)
            const count = parseInt(countResponse.headers.get('X-Total-Count') ?? '0')

            const countExist = await this.rewardCollection.collection.countDocuments({ date: day_temp.toDate() })
            if (count == countExist) {
                // SKIP
                day_temp = day_temp.add(1, 'day')
                continue
            }

            const dataResponse: Getter.BfcChainRewardResponse = await (await fetch(`${Env.bfcChain}/rewards?page=1&count=${count}&date=${dateStr}`)).json()
            const blocksResponse = dataResponse.Data

            const bulk = this.rewardCollection.collection.initializeUnorderedBulkOp()
            for (let blockResponse of blocksResponse) {
                const upload: Getter.BfcDbUpload = {
                    field: blockResponse.field,
                    fileid: blockResponse.fileid,
                    date: day_temp.toDate()
                }
                bulk.find({ fileid: upload.fileid, field: upload.field, date: upload.date }).upsert().update({
                    $set: upload
                })
            }
            await bulk.execute()

            day_temp = day_temp.add(1, 'day')
        }

        console.log('caching for BFC-Chain rewards complete.')
    }

    async getRewards(page: number, count: number, date: string) {
        const date_d = dayjs(date, 'YYYYMMDD').toDate()
        const data = await this.rewardCollection.collection.find({
            date: date_d
        }, {
            projection: {
                field: 1,
                fileid: 1
            }
        }).sort({ fileid: 1 }).skip((page - 1) * count).limit(count).toArray()
        return data
    }

    async getRewardsCount(date: string) {
        const data_d = dayjs(date, 'YYYYMMDD').toDate()
        return this.rewardCollection.collection.countDocuments({ date: data_d })
    }

}

export default BfcChainGetter