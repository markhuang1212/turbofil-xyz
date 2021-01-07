import BfcTradeGetter from "./getters/BfcTradeGetter";
import LoggerShared from "./LoggerShared";
import MongoClientShared from "./MongoClientShared";
import { Getter } from "./Types";

function wait1() {
    return new Promise((res, rej) => {
        setTimeout(() => {
            console.log('wait1 finish')
            res(undefined)
        }, 1000)
    })
}

function wait2() {
    return new Promise((res, rej) => {
        setTimeout(() => {
            console.log('wait2 finish')
            res(undefined)
        }, 2000)
    })
}

Promise.all([
    wait1().then(() => console.log('hi')),
    wait2().then(() => console.log('hi'))
]).then(() => console.log('finish'))