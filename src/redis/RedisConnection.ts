import net from 'net';

class RedisConnection {
    socket: net.Socket;
    constructor(host = 'localhost', port = 6379) {
        this.socket = net.createConnection({ host, port });
    }
}

export { RedisConnection }