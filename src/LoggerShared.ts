import pino from 'pino'
import path from 'path'
import dayjs from 'dayjs'

const time = dayjs().unix()

const logMode = process.env.NODE_ENV === "development" ? 'development' : 'production'

console.log(logMode)

const LoggerShared = pino({
    level: logMode === 'development' ? 'trace' : 'info'
}, logMode == 'production' ? pino.destination({
    dest: path.join(__dirname, '../logs', `${time}.log`),
    sync: false
}) : pino.destination(1))

export default LoggerShared