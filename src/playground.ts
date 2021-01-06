import BfcTradeGetter from "./getters/BfcTradeGetter";
import LoggerShared from "./LoggerShared";
import MongoClientShared from "./MongoClientShared";
import { Getter } from "./Types";

async function run() {
    try {
        throw Error("Some Error!")
    } catch (e) {
        LoggerShared.child({ service: 'PLAYGROUND' }).error(e)
    }

}

run()