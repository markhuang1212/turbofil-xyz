enum RedisResponseParsingStage {
    ParseNotBegin,
    ParseType,
    ParseLength,
    ParseContent,
    ParseFinished
}

class RedisResponseParser {

    stage = RedisResponseParsingStage.ParseNotBegin

    write(str: Buffer) {

    }
}