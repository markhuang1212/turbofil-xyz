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

BfcTradeHandler.get('/block', (req, res) => {

})

export default BfcTradeHandler