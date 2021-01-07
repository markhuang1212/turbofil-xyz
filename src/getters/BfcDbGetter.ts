import MongoClientShared from "../MongoClientShared";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import dayjs, { Dayjs } from 'dayjs'
import fetch from 'node-fetch'
import Env from '../env.json'
import { Getter } from "../Types";
import LoggerShared from "../LoggerShared";

const FIRST_DAY = '20200701'
const META_KEY_BFC_DB_REWARDS = 'bfc-db-uploads'

const logger = LoggerShared.child({ service: 'GETTER::BFC-DB' })

class BfcDbGetter extends GetterAbstract {

    static shared = new BfcDbGetter()

    metaCollection = new CollectionAbstract<Getter.DBMetaData>(MongoClientShared, 'meta', 'meta')

    async task() {
        try {
            await this.cacheUploads()
            await this.metaCollection.collection.updateOne({ key: META_KEY_BFC_DB_REWARDS }, {
                $set: {
                    key: META_KEY_BFC_DB_REWARDS,
                    success: true
                }
            }, { upsert: true })
        } catch (e) {
            logger.error('Cannot cache uploads')
            logger.error(e)
            return
        }
        try {
            await this.cacheFilesInfo()
        } catch (e) {
            logger.error('Cannot cache files info')
            logger.error(e)
        }
    }

    initialize() {
        this.uploadCollection.collection.createIndex({ field: 1, fileid: 1 })
        this.uploadCollection.collection.createIndex({ fileid: 1 })
        this.uploadCollection.collection.createIndex({ date: 1 })
    }

    uploadCollection = new CollectionAbstract<Getter.BfcDbUpload>(MongoClientShared, 'bfc-db', 'uploads')

    async cacheUploads() {
        logger.info('start caching uploads')

        let day_temp: Dayjs

        const meta = await this.metaCollection.collection.findOne({ key: META_KEY_BFC_DB_REWARDS })
        if (meta === null) {
            day_temp = dayjs(FIRST_DAY)
        } else if (meta.success === false) {
            day_temp = dayjs(FIRST_DAY)
            logger.info('Re-cache all uploads')
        } else {
            day_temp = dayjs(FIRST_DAY)
            const most_recent_doc =
                await this.uploadCollection.collection.find({}, { projection: { date: 1 } }).sort({ date: -1 }).limit(1).next()
            day_temp = most_recent_doc?.date ? dayjs(most_recent_doc.date) : dayjs(FIRST_DAY)
        }

        const most_recent_doc = await this.uploadCollection.collection.find().sort({ date: -1 }).limit(1).next()
        day_temp = most_recent_doc?.date ? dayjs(most_recent_doc.date) : dayjs(FIRST_DAY)

        const next_day = dayjs().add(1, 'day')
        while (day_temp.isBefore(next_day, 'day')) {
            const dateStr = day_temp.format('YYYYMMDD')
            const countResponse = await fetch(`${Env.bfcDb}/uploads?page=1&count=1&date=${dateStr}`)
            const count = parseInt(countResponse.headers.get('X-Total-Count') ?? '0')

            const countExist = await this.uploadCollection.collection.countDocuments({ date: day_temp.toDate() })
            if (count == countExist) {
                logger.debug(`skipping uploads of ${day_temp.format('YYYY-MM-DD')}`)
                day_temp = day_temp.add(1, 'day')
                continue
            }

            const dataResponse: Getter.BfcDbUploadResponse = await (await fetch(`${Env.bfcDb}/uploads?page=1&count=${count}&date=${dateStr}`)).json()
            const blocksResponse = dataResponse.data

            const bulk = this.uploadCollection.collection.initializeUnorderedBulkOp()
            for (let blockResponse of blocksResponse) {
                const upload: Getter.BfcDbUpload = {
                    field: blockResponse.field,
                    fileid: blockResponse.fileid,
                    date: day_temp.toDate()
                }
                bulk.find({ fileid: blockResponse.fileid, field: blockResponse.field }).upsert().update({
                    $set: upload
                })
            }
            await bulk.execute()

            day_temp = day_temp.add(1, 'day')
        }

        logger.info('Caching uploads success')

    }

    async cacheFilesInfo() {
        logger.info('Start caching files info')
        const filesToCache = this.uploadCollection.collection.find({ info: { $exists: false } })
        while (await filesToCache.hasNext()) {
            const { fileid, field } = (await filesToCache.next())!
            const fileInfoResponse: Getter.BfcDbFileInfoResponse = await (await fetch(`${Env.bfcDb}/field/${field}/file/${fileid}`)).json()

            const info = fileInfoResponse.data
            await this.uploadCollection.collection.updateOne({ fileid, field }, {
                $set: {
                    info
                }
            })
        }
        logger.info('Caching files info success')
    }

    async getUploads(page: number, count: number, date: string) {
        const date_d = dayjs(date, 'YYYYMMDD').toDate()
        const data = await this.uploadCollection.collection.find({
            date: date_d
        }, {
            projection: {
                field: 1,
                fileid: 1
            }
        }).sort({ fileid: 1 }).skip((page - 1) * count).limit(count).toArray()
        return data as Pick<Getter.BfcDbUpload, 'field' | 'fileid'>[]
    }

    async getUploadsCount(date: string) {
        const date_d = dayjs(date, 'YYYYMMDD').toDate()
        return this.uploadCollection.collection.countDocuments({ date: date_d })
    }

    async getFileInfo(field: string, afid: string) {
        const upload = await this.uploadCollection.collection.findOne({ field, fileid: afid })
        const info = upload?.info
        return info
    }

    async cacheRewards() {

    }

    async cacheRnTrade() {

    }

    async cacheFnTrade() {

    }
}

export default BfcDbGetter