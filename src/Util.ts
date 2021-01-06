import LoggerShared from "./LoggerShared"

function fatalError(msg: string) {
    LoggerShared.fatal(msg)
    process.exit(1)
}

function error(msg: string) {
    LoggerShared.error(msg)
}

export { fatalError, error }