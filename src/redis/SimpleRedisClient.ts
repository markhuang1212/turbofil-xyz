import { RedisConnectionCoordinator } from './RedisConnectionCoordinator'

const TERMINATE_BIN = Buffer.from('\r\n', 'ascii')

type RedisCommand = Buffer

class SimpleRedisClient {

    coordinator: RedisConnectionCoordinator

    constructor() {
        this.coordinator = new RedisConnectionCoordinator()
    }

    smallCmd(cmd: RedisCommand) {
        const connection = this.coordinator.allocate()

        let temp: Buffer[] = []

        return new Promise<Buffer>((res, rej) => {
            connection.socket.on('error', e => {
                this.coordinator.free(connection)
                rej(e)
            })
            connection.socket.on('close', () => {
                this.coordinator.free(connection)
                res(Buffer.concat(temp))
            })
            connection.socket.on('data', chunk => {
                temp.push(chunk)
            })
            connection.socket.write(cmd)
        })
    }

    bigCmd(cmd: RedisCommand) {

    }

}

export default SimpleRedisClient