import { Router } from "express";
import TfcGetter from "../getters/TfcGetter";
import { Handler } from "../Types";

const TfcHandler = Router()


TfcHandler.get('/blocks', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const sortOrder = req.query.sortOrder
        if (sortOrder !== 'desc' && sortOrder !== 'asc')
            throw Error('Invalid argument: sortOrder')
        const blocks = await TfcGetter.shared.getBlocks(page, count, sortOrder)
        const response: Handler.TfcBlockResponse = {
            code: 0,
            data: {
                blocks
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting TFC blocks with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

TfcHandler.get('/blockHeight', async (req, res) => {
    try {
        const blockHeight = await TfcGetter.shared.getBlockHeight()
        const response: Handler.TfcBlockHeightResponse = {
            code: 0,
            msg: 'success',
            data: {
                blockHeight
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting tfc blockHeight with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default TfcHandler