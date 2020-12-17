import fs from 'fs'
import path from 'path'

interface EnvObject {
    port: number
    clusters: Map<string, string>
}

let EnvJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../env.json'), 'utf-8'))

let Env: EnvObject = {
    port: EnvJSON.port,
    clusters: new Map(Object.entries(EnvJSON.clusters))
}

export default Env