import dayjs from "dayjs";
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

BfcTradeHandler.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string ?? '0')
        const count = parseInt(req.query.count as string ?? '0')
        const sortOrder = req.query.sortorder

        if (sortOrder !== 'desc' && sortOrder !== 'asc')
            throw Error('Invalid argument: sortorder')

        const data = await BfcTradeGetter.shared.getTxs(page, count, sortOrder)

        const response: Handler.BfcTransactionsResponse = {
            code: 0,
            msg: 'success',
            data
        }

        res.json(response)

    } catch (e) {
        console.error(`error when fetching transactions with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

BfcTradeHandler.get('/transaction', async (req, res) => {
    try {
        const txid = req.query.transid
        if (typeof txid !== 'string')
            return

        const data = await BfcTradeGetter.shared.getTx(txid)
        if (data === undefined)
            throw Error(`Cannot get transaction with id ${txid}`)

        const response: Handler.BfcTransactionResponse = {
            code: 0,
            msg: 'success',
            data
        }

        res.json(response)

    } catch (e) {
        console.error(`error when fetching transaction with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

BfcTradeHandler.get('/getLineChartData', async (req, res) => {
    try {
        const interval = req.query.interval
        if (interval !== 'day' && interval !== 'week' && interval !== 'month' && interval !== 'quarter' && interval !== 'year')
            throw Error('invalid argument: interval')

        const data = await BfcTradeGetter.shared.getLineChartData(interval)
        const response: Handler.BfcLineChartDataResponse = {
            code: 0,
            msg: 'success',
            data
        }

        res.json(response)

    } catch (e) {
        console.error(`error when getting Bfc LineChartData with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default BfcTradeHandler