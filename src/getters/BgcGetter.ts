import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import Env from '../env.json'
import CollectionAbstract from "./CollectionAbstract";
import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import LoggerShared from "../LoggerShared";
import MetaGetter from "./MetaGetter";

const logger = LoggerShared.child({ service: 'GETTER::BGC' })
const META_KEY_BGC_BLOCKS = 'bgc-blocks'

class BgcGetter extends GetterAbstract {

    static shared = new BgcGetter()

    blocksCollection: CollectionAbstract<Getter.BgcBlock> = new CollectionAbstract(MongoClientShared, 'bgc', 'blocks')

    async task() {
        try {
            await this.cacheBlocks()
            await MetaGetter.shared.setSuccess(META_KEY_BGC_BLOCKS, true)
        } catch (e) {
            await MetaGetter.shared.setSuccess(META_KEY_BGC_BLOCKS, false)
            logger.error('error when caching BGC blocks')
            logger.error(e)
        }
    }

    initialize() {
        this.blocksCollection.collection.createIndex({ 'header.Height': 1 })
    }

    async cacheBlocks() {
        logger.info('Start caching BGC blocks')

        const BUFFER_SIZE = 100

        const blockHeightResponse: Getter.BgcBlockHeightResponse
            = await (await fetch(`${Env.bgc}/blockHeight`)).json()
        const blockHeight = blockHeightResponse.data.blockHeight
        const blockCountExist = await this.blocksCollection.collection.countDocuments()
        if (blockCountExist === blockHeight) {
            logger.info('No BGC blocks to cache')
            return
        }

        let page = 1
        const success = MetaGetter.shared.isSuccess(META_KEY_BGC_BLOCKS)
        if (success) {
            page = Math.floor(blockCountExist / BUFFER_SIZE) + 1
        }

        for (; page < Math.ceil(blockHeight / BUFFER_SIZE) + 1; page++) {
            const reqUrl = `${Env.bgc}/block?page=${page}&count=${BUFFER_SIZE}`
            const blocksResponse: Getter.BgcBlockResponse = await (await fetch(reqUrl)).json()
            const blocks = blocksResponse.data.blocks
            const bulk = this.blocksCollection.collection.initializeUnorderedBulkOp()
            for (let block of blocks) {
                bulk.find({ 'header.Hash': block.header.Hash }).upsert().updateOne({ $set: block })
            }
            await bulk.execute()
        }

        logger.info('caching BGC blocks success.')
    }

    async getBlocks(page: number, count: number) {
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