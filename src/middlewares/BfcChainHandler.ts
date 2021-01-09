import { Router } from "express";
import BfcChainGetter from "../getters/BfcChainGetter";
import { Handler } from "../Types";
import Env from '../env.json'
import fetch from 'node-fetch'

const BfcChainHandler = Router()

BfcChainHandler.get('/rewards', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string)
        const count = parseInt(req.query.count as string)
        const date = req.query.date
        if (typeof date !== 'string')
            throw Error('Invalid argument: date')
        const data = await BfcChainGetter.shared.getRewards(page, count, date)
        const total_count = await BfcChainGetter.shared.getRewardsCount(date)
        res.setHeader('X-Total-Count', total_count)
        const response: Handler.BfcChainRewardResponse = {
            Code: 0,
            Data: data,
            Msg: 'success'
        }
        res.json(response)
    } catch (e) {
        req.log.error(`error when getting BFC rewards with request ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

BfcChainHandler.get('/rnTrade', async (req, res) => {
    try {
        const afid = req.query.afid
        const date = req.query.date

        if (typeof date !== 'string' || typeof afid !== 'string')
            throw Error('Invalid argument')

        // const url = `${Env.bfcChain}/afids/${afid}/rns?date=${date}`
        // const res_remote = await (await fetch(url)).json()
        // res.json(res_remote)
        const data = await BfcChainGetter.shared.lazyCacheRnTrade(afid, date)
        const result: Handler.BfcChainRnTradeResponse = {
            code: 0,
            msg: 'success',
            data
        }
        res.json(result)

    } catch (e) {
        req.log.error(`error when /bfcDb/rnTrade with uri ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})

BfcChainHandler.get('/fnTrade', async (req, res) => {
    try {
        const afid = req.query.afid
        const date = req.query.date
        const rnid = req.query.rnid

        if (typeof afid !== 'string' || typeof date !== 'string' || typeof rnid !== 'string')
            throw Error('Invalid argument')

        // const url = `${Env.bfcChain}/afids/${afid}/rns/${rnid}/fns?date=${date}`
        // const res_remote = await (await fetch(url)).json()
        // res.json(res_remote)

        const data = await BfcChainGetter.shared.lazyCacheFnTrade(afid, rnid, date)
        const result: Handler.BfcChainFnTradeResponse = {
            code: 0,
            data,
            msg: 'success'
        }

        res.json(result)

    } catch (e) {
        req.log.error(`error when /bfcDb/fnTrade with uri ${req.url}`)
        req.log.error(e)
        res.status(500).end()
    }
})


export default BfcChainHandler