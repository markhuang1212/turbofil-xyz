import { Router } from "express";
import ErcGetter from "../getters/ErcGetter";
import { Handler } from "../Types";

const ErcHandler = Router()

ErcHandler.get('/blocks', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const sortOrder = req.query.sortOrder as string
        if (sortOrder !== 'asc' && sortOrder !== 'desc')
            throw Error('Invalid argument: sortOrder')
        const blocks = await ErcGetter.shared.getBlocks(page, count, sortOrder)
        const response: Handler.ErcBlocksResponse = {
            code: 0,
            msg: 'success',
            data: {
                metadata: {
                    count: Math.ceil(await ErcGetter.shared.getBlockCount() / count),
                    totalCount: Math.ceil(await ErcGetter.shared.getBlockCount() / count),
                    page: 0
                },
                blocks
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`Error when getting TFC-ERC blocks with request ${req.url}`)
        console.error(e)
    }
})

ErcHandler.get('/block', async (req, res) => {
    try {
        const height = parseInt(req.query.height as string)

        const block = await ErcGetter.shared.getBlock(height)
        if (block == undefined)
            throw Error('Block Not Found.')
        const response: Handler.ErcBlockInfoResponse = {
            code: 0,
            msg: 'success',
            data: {
                block
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`Error when getting TFC-ERC block with request ${req.url}`)
        console.error(e)
    }
})

ErcHandler.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const sortOrder = req.query.sortOrder as string
        if (sortOrder !== 'asc' && sortOrder !== 'desc')
            throw Error('Invalid argument: sortOrder')
        const txs = await ErcGetter.shared.getTxs(page, count, sortOrder)
        const response: Handler.ErcTxsResponse = {
            code: 0,
            msg: 'success',
            data: {
                metadata: {
                    count: Math.ceil(await ErcGetter.shared.getTxCount() / count),
                    totalCount: Math.ceil(await ErcGetter.shared.getTxCount() / count),
                    page: 0
                },
                txs
            }
        }
        res.json(response)
    } catch (e) {
        console.error(`Error when getting TFC-ERC blocks with request ${req.url}`)
        console.error(e)
    }
})

ErcHandler.get('/transaction', async (req, res) => {
    try {
        const txid = req.query.txid as string
        if (typeof txid !== 'string')
            throw Error('Invalid argument: txid')
        const tx = await ErcGetter.shared.getTx(txid)
        if (tx === undefined)
            throw Error('No Such Transaction')
        const response: Handler.ErcTxResponse = {
            code: 0,
            msg: 'success',
            data: {
                tx
            }
        }
    } catch (e) {
        console.error(`Error when getting TFC-ERC blocks with request ${req.url}`)
        console.error(e)
    }
})

export default ErcHandler