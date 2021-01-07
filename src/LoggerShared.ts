import pino from 'pino'
import path from 'path'
import dayjs from 'dayjs'
import fs from 'fs'

const time = dayjs().unix()

const logMode = process.env.NODE_ENV === "development" ? 'development' : 'production'

if (fs.existsSync(path.join(__dirname, '../logs')) === false)
    fs.mkdirSync(path.join(__dirname, '../logs'))

const LoggerShared = pino({
    level: logMode === 'development' ? 'trace' : 'info'
}, logMode == 'production' ? pino.destination({
    dest: path.join(__dirname, '../logs', `${time}.log`),
    sync: false
}) : pino.destination(1))

export default LoggerShared