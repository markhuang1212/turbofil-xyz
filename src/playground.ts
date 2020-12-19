import ClusterGetter from "./getters/ClusterGetter";
import fetch from 'node-fetch'

function webPageToInfo(text: string) {
    const strMatch = text.match(/<b>0.[0-9A-Z]+/g) ?? []
    const strResult = strMatch.map(val => val.substr(3))
    const result: { web: string, proc: string, running: string }[] = []

    for (let i = 0; i < strResult.length / 3; i++) {
        result.push({
            web: strResult[i * 3],
            proc: strResult[i * 3 + 1],
            running: strResult[i * 3 + 2]
        })
    }
    
    return result
}
async function run() {
    const response = await fetch("http://39.106.183.14/9302/index.php?_m=main.php&cluster=BAAA")
    const responseText = await response.text()
    const result = webPageToInfo(responseText)
    console.log(result)
}

run()