import ClusterGetter from "./getters/ClusterGetter";
import fetch from 'node-fetch'
import { Long, MongoClient } from "mongodb";
import MongoClientShared from "./MongoClientShared";

function webPageToClusterInfo(text: string) {
    const textEle = text.split('rs=').map(v => 'rs=' + v).splice(1)
    const result: { rnId: string, web?: string, proc?: string, running?: string }[] = []
    for (let ele of textEle) {
        const rnId = (ele.match(/rs=http:\/\/.*\/[0-9]+/g) ?? [''])[0]?.substr(-4)
        const web = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[0]?.substr(3)
        const proc = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[1]?.substr(3)
        const running = (ele.match(/<b>0.[0-9A-Z]+/g) ?? [''])[2]?.substr(3)
        result.push({ rnId, web, proc, running })
    }
    return result
}

async function run() {
    const responseText = await (await fetch('http://39.106.183.14/9302/index.php?_m=main.php&cluster=BAAA')).text()
    console.log(webPageToClusterInfo(responseText))
}

run()