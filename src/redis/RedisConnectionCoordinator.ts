import { RedisConnection } from './RedisConnection';

class RedisConnectionCoordinator {

    connections_free: RedisConnection[] = [];
    connections_busy: RedisConnection[] = [];

    allocate() {

        if (this.connections_free.length == 0)
            this.newConnection();

        const connection = this.connections_free.pop()!;
        this.connections_busy.push(connection);

        return connection;
    }

    free(connection: RedisConnection) {
        connection.socket.removeAllListeners();
        let index = -1;
        for (let i = 0; i < this.connections_busy.length; i++) {
            if (this.connections_busy[i] == connection) {
                index = i;
            }
        }
        this.connections_free.splice(index, 1);
        this.connections_free.push(connection);
    }

    newConnection() {
        this.connections_free.push(new RedisConnection());
    }
}

export { RedisConnection, RedisConnectionCoordinator }