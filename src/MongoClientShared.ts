import { MongoClient } from 'mongodb'
import Env from './env.json'

/**
 * This MongoClient object is used to connect to the MongoDB for ALL database operations
 */
const MongoClientShared = new MongoClient(Env.mongoUri, { useUnifiedTopology: true, ignoreUndefined: true })

export default MongoClientShared