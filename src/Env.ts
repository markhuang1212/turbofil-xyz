import fs from 'fs'
import path from 'path'
import { fatalError } from './util'

interface EnvObject {
    mongoUri: string
    port: number
    clusters: Map<string, string>,
    jobIntervalSeconds: number,
    clustersBackend: string
}

let EnvJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../env.json'), 'utf-8'))

let Env: EnvObject = {
    mongoUri: EnvJSON.mongoUri,
    port: EnvJSON.port,
    clusters: new Map(Object.entries(EnvJSON.clusters)),
    jobIntervalSeconds: EnvJSON.jobIntervalSeconds,
    clustersBackend: EnvJSON.clustersBackend
}

export default Env