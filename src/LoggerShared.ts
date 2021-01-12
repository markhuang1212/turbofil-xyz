import pino from 'pino'
import path from 'path'
import dayjs from 'dayjs'
import fs from 'fs'

const time = dayjs().unix()

const logMode = process.env.NODE_ENV === "development" ? 'development' : 'production'

if (fs.existsSync(path.join(__dirname, '../logs')) === false)
    fs.mkdirSync(path.join(__dirname, '../logs'))


/**
 * All logging is done by the LoggerShared.
 * It sets the logging mode and logging destination
 * according to the environment variable NODE_NEV
 */
const LoggerShared = pino({
    level: logMode === 'development' ? 'trace' : 'info'
}, logMode == 'production' ? pino.destination({
    dest: path.join(__dirname, '../logs', `${time}.log`),
    sync: false
}) : pino.destination(1))

export default LoggerShared