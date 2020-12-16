import SimpleRedisClient from "./SimpleRedisClient"

describe('Simple Redis Client', () => {
    it('Simple Cmd', async () => {
        const client = new SimpleRedisClient()
        console.log(await client.smallCmd(SimpleRedisClient.makeCmd('set hello world')))
    })
})