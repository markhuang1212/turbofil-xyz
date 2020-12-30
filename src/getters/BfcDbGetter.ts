import MongoClientShared from "../MongoClientShared";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";
import dayjs from 'dayjs'
import fetch from 'node-fetch'
import Env from '../env.json'
import { Getter } from "../Types";

const FIRST_DAY = '20200701'

class BfcDbGetter extends GetterAbstract {

    static shared = new BfcDbGetter()

    async task() {
        await this.cacheUploads()
        await this.cacheFilesInfo()
        await this.cacheRnTrade()
        await this.cacheFnTrade()
    }

    initialize() {
        this.uploadCollection.collection.createIndex({ field: 1, fileid: 1 })
        this.uploadCollection.collection.createIndex({ date: 1 })
    }

    uploadCollection = new CollectionAbstract<Getter.BfcDbUpload>(MongoClientShared, 'bfc-db', 'uploads')
    // rnTradeCollection: CollectionAbstract<any> = new CollectionAbstract(MongoClientShared, 'bfc-db', 'rn-trade')
    // fnTradeCollection: CollectionAbstract<any> = new CollectionAbstract(MongoClientShared, 'bfc-db', 'fn-trade')

    async cacheUploads() {
        console.log('start caching uploads for BFC-db')

        const most_recent_doc = await this.uploadCollection.collection.find().sort({ date: -1 }).limit(1).next()
        let day_temp = most_recent_doc?.date ? dayjs(most_recent_doc.date) : dayjs(FIRST_DAY)

        const next_day = dayjs().add(1, 'day')
        while (day_temp.isBefore(next_day, 'day')) {
            const dateStr = day_temp.format('YYYYMMDD')
            const countResponse = await fetch(`${Env.bfcDb}/uploads?page=1&count=1&date=${dateStr}`)
            const count = parseInt(countResponse.headers.get('X-Total-Count') ?? '0')

            const countExist = await this.uploadCollection.collection.countDocuments({ date: day_temp.toDate() })
            if (count == countExist) {
                // console.debug('skip')
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
        console.log('caching for uploads of BFC-db success.')


    }

    async cacheFilesInfo() {
        console.log('starting caching files info for BFC-db')
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
        console.log('caching of files info for BFC-db complete.')
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
        }).skip((page - 1) * count).limit(count).toArray()
        return data as Pick<Getter.BfcDbUpload, 'field' | 'fileid'>[]
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