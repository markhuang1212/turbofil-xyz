import { Router } from "express";
import BfcDbGetter from "../getters/BfcDbGetter";
import { Handler } from "../Types";
import fetch from 'node-fetch'
import http from 'http'
import Env from '../env.json'

const BfcDbHandler = Router()

BfcDbHandler.get('/uploads', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const date = req.query.date
        if (typeof date !== 'string')
            throw Error('Invalid argument: date')
        const data = await BfcDbGetter.shared.getUploads(page, count, date)
        const total_count = await BfcDbGetter.shared.getUploadsCount(date)
        res.setHeader('X-Total-Count', total_count)
        const response: Handler.BfcDbUploadResponse = {
            code: 0,
            data
        }
        res.json(response)
    } catch (e) {
        req.log.error(`error when getting Bfc-db uploads with request ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

BfcDbHandler.get('/rewards', async (req, res) => {
    req.log.info('/bfcDb/rewards not implemented.')
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
        req.log.error(`error when getting Bfc-db file info with request ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

BfcDbHandler.get('/rnTrade', async (req, res) => {
    try {
        const field = req.query.field
        const afid = req.query.afid
        const date = req.query.date

        if (typeof field !== 'string' || typeof afid !== 'string' || typeof date !== 'string')
            throw Error('Invalid argument')

        const url = `${Env.bfcDb}/field/${field}/file/${afid}/rns?date=${date}`
        const res_remote = await (await fetch(url)).json()
        res.json(res_remote)


    } catch (e) {
        req.log.error(`error when /bfcDb/rnTrade with uri ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

BfcDbHandler.get('/fnTrade', async (req, res) => {
    try {
        const field = req.query.field
        const afid = req.query.afid
        const date = req.query.date
        const rnid = req.query.rnid

        if (typeof field !== 'string' || typeof afid !== 'string' || typeof date !== 'string' || typeof rnid !== 'string')
            throw Error('Invalid argument')

        const url = `${Env.bfcDb}/${field}/${afid}/rns/${rnid}/fns?date=${date}`
        const res_remote = await (await fetch(url)).json()
        res.json(res_remote)

    } catch (e) {
        req.log.error(`error when /bfcDb/fnTrade with uri ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

export default BfcDbHandler