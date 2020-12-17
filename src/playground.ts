// import { RedisClient } from 'redis'
// import ClusterGetter from './getters/ClusterGetter'
import RedisClientShared from './RedisClientShared'

RedisClientShared.hget('clusters:overview', 'arst', (err, str) => {
    console.log('error')
    console.log(err)
    console.log('result:')
    console.log(str)
    process.exit(0)
})