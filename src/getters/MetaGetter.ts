import MongoClientShared from "../MongoClientShared";
import { Getter } from "../Types";
import CollectionAbstract from "./CollectionAbstract";
import GetterAbstract from "./GetterAbstract";

class MetaGetter extends GetterAbstract {
    task() {
        return
    }
    initialize() {
        return
    }

    static shared = new MetaGetter()

    metaCollection = new CollectionAbstract<Getter.DBMetaData>(MongoClientShared, 'meta', 'meta')

    async isSuccess(key: string) {
        const meta = await this.metaCollection.collection.findOne({ key })
        return meta?.success
    }

    async setSuccess(key: string, val: boolean) {
        await this.metaCollection.collection.updateOne({ key }, { $set: { success: val } }, { upsert: true })
    }

}

export default MetaGetter