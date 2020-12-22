import { Router } from "express";
import BfcTradeGetter from "../getters/BfcTradeGetter";
import { Handler } from "../Types";

const BfcTradeHandler = Router()

BfcTradeHandler.get('/blocks', async (req, res) => {
    try {
        const count = parseInt(req.query.count as string ?? '1')
        const page = parseInt(req.query.page as string ?? '1')
        const order = req.query.sortorder
        if (order !== 'desc' && order !== 'asc')
            throw Error('Invalid argument: sortOrder')

        const result = await BfcTradeGetter.shared.getBlocks(page, count, order)
        const response: Handler.BfcBlocksResponse = {
            code: 0,
            msg: 'success',
            data: result
        }

        res.json(response)

    } catch (e) {
        console.error(`error when fetching blocks with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

BfcTradeHandler.get('/block', async (req, res) => {
    try {
        const hash = req.query.blockhash
        if (typeof hash !== 'string')
            throw ('Invalid parameter blockhash')

        const data = await BfcTradeGetter.shared.getBlock(hash)
        if (data == undefined)
            throw (`Cannot get block with blockhash ${hash}`)

        const response: Handler.BfcBlockResponse = {
            code: 0,
            msg: 'success',
            data
        }
        res.json(response)
    } catch (e) {
        console.error(`error when fetching block with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default BfcTradeHandler