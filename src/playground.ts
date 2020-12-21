import ClusterGetter from "./getters/ClusterGetter";
import fetch from 'node-fetch'
import { Long, MongoClient } from "mongodb";
import MongoClientShared from "./MongoClientShared";

async function run() {
    const client = MongoClientShared;
    await client.connect()

    await client.db('playground').collection('playground').insertOne({
        count: Long.fromString('9223372036854775807')
    })

    const result = await client.db('playground').collection('playground').find().toArray();

    console.log(result)
}

run()