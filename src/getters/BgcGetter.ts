import GetterAbstract from "./GetterAbstract";
import fetch from 'node-fetch'
import Env from '../env.json'
import CollectionAbstract from "./CollectionAbstract";
import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import BgcHandler from "../middlewares/BgcHandler";

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
        const currHeight = (await this.blocksCollection.collection.find().sort({ 'header.height': -1 }).limit(1).next())?.header.Height ?? 0

        for (let page = 1; page < Math.ceil(blockHeight / BUFFER_SIZE) + 1; page++) {
            const reqUrl = `${Env.bgc}/block?page=${page}&count=${BUFFER_SIZE}`
            const blocksResponse: Getter.BgcBlockResponse = await (await fetch(reqUrl)).json()
            const blocks = blocksResponse.data.blocks
            const bulk = this.blocksCollection.collection.initializeUnorderedBulkOp()
            for (let block of blocks) {
                bulk.find({ 'header.Height': block.header.Height }).upsert().updateOne({ $set: block })
            }
            await bulk.execute()
        }

        console.log('caching BGC blocks complete.')
    }

    async getBlockHeight() {

    }

}

export default BgcGetter