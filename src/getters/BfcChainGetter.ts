import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import dayjs, { Dayjs } from 'dayjs'
import CollectionAbstract from "./CollectionAbstract";
import Env from '../env.json'
import LoggerShared from "../LoggerShared";

const FIRST_DAY = '20200701'

const logger = LoggerShared.child({ service: 'GETTER::BFC-CHAIN' })
const META_KEY_BFC_CHAIN_REWARDS = 'bfc-chain-rewards'

class BfcChainGetter extends GetterAbstract {

    static shared = new BfcChainGetter()

    rewardCollection = new CollectionAbstract<Getter.BfcChainReward>(MongoClientShared, 'bfc-chain', 'rewards')
    metaCollection = new CollectionAbstract<Getter.DBMetaData>(MongoClientShared, 'meta', 'meta')

    async task() {
        try {
            await this.cacheRewards()
            await this.metaCollection.collection.updateOne({ key: META_KEY_BFC_CHAIN_REWARDS }, {
                $set: {
                    success: true
                }
            }, { upsert: true })
        } catch (e) {
            await this.metaCollection.collection.updateOne({ key: META_KEY_BFC_CHAIN_REWARDS }, {
                $set: {
                    success: false
                }
            }, { upsert: true })
            logger.error('Error when caching rewards')
            logger.debug(e)
        }
    }

    async initialize() {
        await this.rewardCollection.collection.createIndex({ date: 1 })
    }

    async cacheRewards() {

        logger.info('Start caching')
        let day_temp: Dayjs

        const meta = await this.metaCollection.collection.findOne({ key: META_KEY_BFC_CHAIN_REWARDS })
        if (meta == null) {
            day_temp = dayjs(FIRST_DAY)
        } else if (meta.success === false) {
            logger.info('Re-caching rewards')
            day_temp = dayjs(FIRST_DAY)
        } else {
            logger.info('Lazy caching rewards')
            const most_recent_doc =
                await this.rewardCollection.collection.find({}, { projection: { date: 1 } }).sort({ date: -1 }).limit(1).next()
            day_temp = most_recent_doc?.date ? dayjs(most_recent_doc.date) : dayjs(FIRST_DAY)
        }

        const next_day = dayjs().add(1, 'day')
        while (day_temp.isBefore(next_day, 'day')) {
            const dateStr = day_temp.format('YYYYMMDD')
            const countResponse = await fetch(`${Env.bfcChain}/rewards?page=1&count=1&date=${dateStr}`)
            const count = parseInt(countResponse.headers.get('X-Total-Count') ?? '0')

            const countExist = await this.rewardCollection.collection.countDocuments({ date: day_temp.toDate() })
            if (count == countExist) {
                logger.debug(`Skipping rewards of ${day_temp.format('YYYY-MM-DD')}`)
                day_temp = day_temp.add(1, 'day')
                continue
            }

            const dataResponse: Getter.BfcChainRewardResponse
                = await (await fetch(`${Env.bfcChain}/rewards?page=1&count=${count}&date=${dateStr}`)).json()
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

        logger.info('Successfully cached: Rewards')
    }

    async getRewards(page: number, count: number, date: string) {

        page = Math.floor(page)
        count = Math.floor(count)

        if (page <= 0) {
            throw Error('Invalid argument: page')
        }

        if (count <= 0) {
            throw Error('Invalid argument: count')
        }

        if (dayjs(date, 'YYYYMMDD').isValid() === false) {
            throw Error('Invalid argument: date')
        }

        /** Argument checking ends */

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

        if (dayjs(date, 'YYYYMMDD').isValid() === false)
            throw Error('Invalid argument: date')

        /** Argument checking ends */

        const data_d = dayjs(date, 'YYYYMMDD').toDate()
        return this.rewardCollection.collection.countDocuments({ date: data_d })
    }

    async lazyCacheRnTrade(afid: string, date: string) {

    }

    async lazyCacheFnTrade(afid: string, fnid: string, date: string) {

    }

}

export default BfcChainGetter