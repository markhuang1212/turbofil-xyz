import ClusterGetter from "./getters/ClusterGetter";
import fetch from 'node-fetch'

async function run() {
    const response = await fetch("http://39.106.183.14/9302/index.php?_m=main.php&cluster=BAAA")
    const responseText = await response.text()
    const rnodesUri = responseText.match(/rs=http:\/\/.*\/[0-9]+/g) ?? []
    const rnodesId = rnodesUri.map(val => val.substr(-4))
    console.log(rnodesId)
}

run()