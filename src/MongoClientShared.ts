import { MongoClient } from 'mongodb'
import Env from './env.json'

const MongoClientShared = new MongoClient(Env.mongoUri, { useUnifiedTopology: true, ignoreUndefined: true })

export default MongoClientShared