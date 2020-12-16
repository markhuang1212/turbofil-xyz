import events from 'events'

enum RedisResponseParsingStage {
    ParseType,
    ParseLength,
    ParseContent,
    ParseFinished
}

enum RedisResponseType {
    SimpleString = '+',
    Error = '-',
    Integer = ':',
    BulkString = '$',
    Array = '*'
}

function isRedisResponseType(str: string) {
    return str == '+' || str == '-' || str == ':' || str == '$' || str == '*'
}

class RedisResponseParser extends events.EventEmitter {

    stage = RedisResponseParsingStage.ParseType

    type?: RedisResponseType = undefined

    length?: number = 0

    isSimpleContent?: boolean = undefined

    temp?: Buffer = undefined

    write(str: Buffer) {
        let atByte = 0
        while (atByte < str.length) {

            if (this.stage == RedisResponseParsingStage.ParseType) {
                this.stage = RedisResponseParsingStage.ParseType
                const firstByte = str.slice(0, 1).toString('ascii')
                if (!isRedisResponseType(firstByte))
                    this.emit('error', Error('Invalid Response Type'))
                this.type = firstByte as RedisResponseType
                atByte += 1
            }

            if (this.stage == RedisResponseParsingStage.ParseLength) {
                this.stage = RedisResponseParsingStage.ParseContent
                if (this.type == RedisResponseType.BulkString) {
                    
                }
                if (this.type == RedisResponseType.Array) {

                }
                
            }
        }
    }
}

export { RedisResponseParser }