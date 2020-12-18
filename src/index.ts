import express from 'express'
import Env from './env.json'
import ClusterGetter from './getters/ClusterGetter'
import BgcHandler from './middlewares/BgcHandler'
import ClusterHandler from './middlewares/ClusterHandler'
import MongoClientShared from './MongoClientShared'

const start = async () => {
    await MongoClientShared.connect()
    console.log('mongo client connected.')

    ClusterGetter.shared.task()

    const app = express()

    app.use('/bgc', BgcHandler)

    app.use(['/clusters', '/cluster'], ClusterHandler)

    app.listen(Env.port, () => {
        console.log(`listening at port ${Env.port}`)
    })

}

start()