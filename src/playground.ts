import net from 'net'
import SimpleRedisClient from './redis/SimpleRedisClient'

const client = new SimpleRedisClient()
client.smallCmd(Buffer.from("set hello world\r\n", 'ascii')).then(data => {
    data.toString('ascii')
}).catch(e => {
    console.error(e)
})