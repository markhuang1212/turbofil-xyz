import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import dayjs, { Dayjs } from 'dayjs'
import CollectionAbstract from "./CollectionAbstract";
import Env from '../env.json'
import LoggerShared from "../LoggerShared";
import MetaGetter from "./MetaGetter";

/**
 * The backend fetch data starting from FIRST_DAY
 */
const FIRST_DAY = '20200701'

const logger = LoggerShared.child({ service: 'GETTER::BFC-CHAIN' })
const META_KEY_BFC_CHAIN_REWARDS = 'bfc-chain-rewards'

class BfcChainGetter extends GetterAbstract {

    static shared = new BfcChainGetter()

    rewardCollection = new CollectionAbstract<Getter.BfcChainReward>(MongoClientShared, 'bfc-chain', 'rewards')
    tradeCollection = new CollectionAbstract<Getter.BfcChainTrade>(MongoClientShared, 'bfc-chain', 'trade')

    async task() {
        try {
            await this.cacheRewards()
            await MetaGetter.shared.setSuccess(META_KEY_BFC_CHAIN_REWARDS, true)
        } catch (e) {
            await MetaGetter.shared.setSuccess(META_KEY_BFC_CHAIN_REWARDS, false)
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

        const success = await MetaGetter.shared.isSuccess(META_KEY_BFC_CHAIN_REWARDS)
        if (!success) {
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
        if (dayjs(date, 'YYYYMMDD').isValid() === false)
            throw Error(`Invalid date string ${date}`)
        /** Argument checking ends */

        const doc = await this.tradeCollection.collection.findOne({
            afid,
            date: dayjs(date, 'YYYYMMDD').toDate()
        })

        if (doc !== null) {
            return {
                rns: doc.rns.map(v => v.rnid),
                fee: doc.rnFee
            }
        }

        const url = `${Env.bfcChain}/afids/${afid}/rns?date=${date}`
        const res_remote = await (await fetch(url)).json() as Getter.BfcChainRnTradeResponse

        await this.tradeCollection.collection.insertOne({
            afid,
            date: dayjs(date, 'YYYYMMDD').toDate(),
            rnFee: res_remote.data.fee,
            rns: res_remote.data.rns.map(v => ({
                rnid: v
            }))
        })

        return res_remote.data
    }

    async lazyCacheFnTrade(afid: string, rnid: string, date: string) {
        if (dayjs(date, 'YYYYMMDD').isValid() === false)
            throw Error(`Invalid date string ${date}`)
        /** Argument checking ends */

        const doc = await this.tradeCollection.collection.findOne({
            afid, date: dayjs(date, 'YYYYMMDD').toDate(),
        }, {
            projection: {
                rns: {
                    $elemMatch: {
                        rnid
                    }
                }
            }
        })

        if (doc === null)
            return {
                fns: [],
                fee: 0
            } // should not happen.

        if (doc.rns.length === 0)
            return {
                fns: [],
                fee: 0
            } // no rnode

        if (doc.rns[0].fns) {
            return {
                fns: doc.rns[0].fns!,
                fee: doc.rns[0].fnFee!
            }
        }

        const url = `${Env.bfcChain}/afids/${afid}/rns/${rnid}/fns?date=${date}`
        const res_remote = await (await fetch(url)).json() as Getter.BfcChainFnTradeResponse

        await this.tradeCollection.collection.updateOne({
            afid,
            date: dayjs(date, 'YYYYMMDD').toDate(),
            'rns.rnid': rnid
        }, {
            $set: {
                'rns.$.fns': res_remote.data.fns,
                'rns.$.fnFee': res_remote.data.fee
            }
        })

        return res_remote.data
    }

}

export default BfcChainGetter