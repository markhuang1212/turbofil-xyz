import MongoClientShared from "./MongoClientShared";

async function UPDATE_1_2() {
    await MongoClientShared.connect()
    await MongoClientShared.db('bfc-trade').dropDatabase()
    console.log('successfully update from version 1 to version 2.')
}

UPDATE_1_2().then(() => process.exit(0))