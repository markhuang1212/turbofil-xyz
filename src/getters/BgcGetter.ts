import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import Env from '../env.json'
import CollectionAbstract from "./CollectionAbstract";
import MongoClientShared from "../MongoClientShared";
import { Getter, Handler } from "../Types";
import BgcHandler from "../middlewares/BgcHandler";

const SERVICE_NAME = 'GETTER::BGC'

class BgcGetter extends GetterAbstract {

    static shared = new BgcGetter()

    blocksCollection: CollectionAbstract<Getter.BgcBlock> = new CollectionAbstract(MongoClientShared, 'bgc', 'blocks')

    async task() {
        try {
            await this.cacheBlocks()
        } catch (e) {
            console.error(`error when caching BGC blocks`)
            console.error(e)
        }
    }

    initialize() {
        this.blocksCollection.collection.createIndex({ 'header.Height': 1 })
    }

    async cacheBlocks() {
        console.log('start caching BGC blocks')

        const BUFFER_SIZE = 100

        const blockHeightResponse: Getter.BgcBlockHeightResponse
            = await (await fetch(`${Env.bgc}/blockHeight`)).json()
        const blockHeight = blockHeightResponse.data.blockHeight

        for (let page = 1; page < Math.ceil(blockHeight / BUFFER_SIZE) + 1; page++) {
            const reqUrl = `${Env.bgc}/block?page=${page}&count=${BUFFER_SIZE}`
            const blocksResponse: Getter.BgcBlockResponse = await (await fetch(reqUrl)).json()
            const blocks = blocksResponse.data.blocks
            const bulk = this.blocksCollection.collection.initializeUnorderedBulkOp()
            for (let block of blocks) {
                bulk.find({ 'header.Hash': block.header.Hash }).upsert().updateOne({ $set: block })
            }
            await bulk.execute()
        }

        console.log('caching BGC blocks complete.')
    }

    async getBlocks(page: number, count: number) {
        // const blocks = await this.blocksCollection.collection.find().sort({ 'header.Height': -1 }).skip((page - 1) * count).limit(count).toArray()
        // return blocks
        const blockHeight = await this.getBlockHeight()
        const blocks = await this.blocksCollection.collection.find({
            'header.Height': {
                $gt: blockHeight - page * count,
                $lte: blockHeight - (page - 1) * count
            }
        }).sort({ 'header.Height': -1 }).toArray()
        return blocks
    }

    async getBlockHeight() {
        const height
            = (await this.blocksCollection.collection.find().sort({ 'header.Height': -1 }).limit(1).next())?.header?.Height ?? 0
        return height
    }

}

export default BgcGetter