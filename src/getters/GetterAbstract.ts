import { Collection, MongoClient } from "mongodb";
import MongoClientShared from "../MongoClientShared";

class GetterAbstract<T> {

    client: MongoClient
    dbName: string
    collectionName: string

    get collection(): Collection<T> {
        return this.client.db(this.dbName).collection(this.collectionName)
    }

    constructor(collectionName: string, client: MongoClient = MongoClientShared, dbName = "turbofil") {
        this.client = client
        this.dbName = dbName
        this.collectionName = collectionName
    }

}

export default GetterAbstract