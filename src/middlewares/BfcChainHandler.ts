import { Router } from "express";
import BfcChainGetter from "../getters/BfcChainGetter";
import { Handler } from "../Types";

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
        console.error(`error when getting BFC rewards with request ${req.url}`)
        console.error(e)
        res.status(500).end()
    }
})

export default BfcChainHandler