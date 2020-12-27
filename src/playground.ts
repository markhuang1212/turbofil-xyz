import MongoClientShared from "./MongoClientShared";
import { Getter } from "./Types";

async function run() {
    await MongoClientShared.connect()
    const collection = MongoClientShared.db('bgc').collection('blocks')
    const blocks: Getter.BgcBlock[] = await collection.find({}, { projection: { 'header.Height': 1 } }).toArray()
    console.log(blocks.map(v => v.header.Height))

}

run()