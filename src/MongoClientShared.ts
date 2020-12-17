import { MongoClient } from 'mongodb'

const MongoClientShared = new MongoClient('mongo://localhost:27017')

export default MongoClientShared