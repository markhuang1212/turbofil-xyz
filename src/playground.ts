import BfcTradeGetter from "./getters/BfcTradeGetter";
import LoggerShared from "./LoggerShared";
import MongoClientShared from "./MongoClientShared";
import { Getter } from "./Types";

async function run() {
    const ts = '1588522778547319600'
    const ts2 = '1588522785'
    LoggerShared.debug('Hello World!')
    LoggerShared.info('Hello World')
}

run()