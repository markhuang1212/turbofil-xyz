import { Router } from "express";
import BfcDbGetter from "../getters/BfcDbGetter";
import { Handler } from "../Types";

const BfcDbHandler = Router()

BfcDbHandler.get('/uploads', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const date = req.query.date
        if (typeof date !== 'string')
            throw Error('Invalid argument: date')
        const data = await BfcDbGetter.shared.getUploads(page, count, date)
        const response: Handler.BfcDbUploadResponse = {
            code: 0,
            data
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting Bfc-db uploads with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

BfcDbHandler.get('/rewards', async (req, res) => {
    console.log('/bfcDb/rewards not implemented.')
    res.status(500).end()
})

BfcDbHandler.get('/fileInfo', async (req, res) => {
    try {
        const field = req.query.field
        const afid = req.query.afid
        if (typeof field !== 'string' || typeof afid !== 'string')
            throw Error('invalid argument.')
        const data = await BfcDbGetter.shared.getFileInfo(field, afid)
        if (data === undefined)
            throw Error('data not found.')
        const response: Handler.BfcDbFileInfoResponse = {
            code: 0,
            msg: 'success',
            data
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting Bfc-db file info with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default BfcDbHandler