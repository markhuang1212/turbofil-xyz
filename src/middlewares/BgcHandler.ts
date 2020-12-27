import { Router } from "express";
import BgcGetter from "../getters/BgcGetter";
import { Handler } from "../Types";

const BgcHandler = Router()

BgcHandler.get('/blocks', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const blocks = await BgcGetter.shared.getBlocks(page, count)
        const response: Handler.BgcBlockResponse = {
            code: 0,
            msg: 'success',
            data: {
                blocks
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting BGC blocks with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

BgcHandler.get('/blockHeight', async (req, res) => {
    try {
        const blockHeight = await BgcGetter.shared.getBlockHeight()
        const response: Handler.BgcBlockHeightResponse = {
            code: 0,
            msg: 'success',
            data: {
                blockHeight
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`error when getting BGC blockHeight with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default BgcHandler