import { Collection, MongoClient } from "mongodb";
import MongoClientShared from "../MongoClientShared";

class CollectionAbstract<T>{

    client: MongoClient
    dbName: string
    collectionName: string

    get collection(): Collection {
        if (this.client.isConnected() == false)
            throw Error('Mongo Client Not Connected.')
        return this.client.db(this.dbName).collection(this.collectionName)
    }

    constructor(client: MongoClient, dbName: string, collectionName: string) {
        this.client = client
        this.dbName = dbName
        this.collectionName = collectionName
    }

    static makeCollectionAbstract<U>(dbName: string, collectionName: string) {
        return new CollectionAbstract<U>(MongoClientShared, dbName, collectionName)
    }

}

export default CollectionAbstract