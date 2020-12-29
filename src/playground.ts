import BfcTradeGetter from "./getters/BfcTradeGetter";
import MongoClientShared from "./MongoClientShared";
import { Getter } from "./Types";

async function run() {
    const count = await BfcTradeGetter.shared.uploadsCollection.collection.countDocuments()
    console.log(count)

}

run()