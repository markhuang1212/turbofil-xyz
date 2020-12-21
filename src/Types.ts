import { Long, Int32 } from "mongodb";

declare namespace Getter {
    interface RNode {
        rn_id: string
        runStatus: boolean
        loopStatus: boolean
        backendStatus: boolean

        web: string
        proc: string
        running: string

        totalStorage: number // sum of quotaM
        hasStorage: number // sum of usedM

        num_of_fnodes: number
        fnodes: {
            fn_id: string
            fn_status: string
            usedM: number
            quotaM: number
        }[]
    }

    interface FNodeStatusResponse {
        code: 0
        msg: string
        data: {
            fnid: string
            fnStatus: string
            usedM: string
            quotaM: string
        }[]
    }

    interface RNodeStatusResponse {
        code: 0
        msg: string
        data: {
            RunStatus: boolean
            LoopStatus: boolean
            BackendStatus: boolean
        }
    }

    interface BfcBlock {
        block_height: number
        block_hash: string
        prev_hash: string
        producer: string
        timestamp: number
        tx_count: number
        tx_ids: string[]
    }

    interface BfcTransaction {
        Txid: string
        BlockHash: string
        Timestamp: number
        TxType: number
        TxBody: {
            Contract: {
                ID: string
                Type: string
                Payload: {
                    AccountFrom: string
                    AccountTo: string
                    CoinNum: number
                }
                Address: string
                Timestamp: number
                Signature: string
                Pubkey: string
            }
        }
    }

}

declare namespace Handler {

    interface RNodeResponse {
        code: 0,
        data: {
            meta: {
                clusterId: string
                totalStorage: number
                hasStorage: number
                rnodeNum: number
                fnodeNum: number
                normalRate: number
            },
            rnodes: {
                rnode: string
                cluster: string
                web: string
                proc: string
                running: string
                runStatus: boolean
                loopStatus: boolean
                backendStatus: boolean
                dead: boolean
                fnodeNum: number
                totalStorage: number
                hasStorage: number
                state: boolean
            }[]
        }
    }

    interface FNodeResponse {
        code: 0 | 1,
        msg: string
        data: {
            meta: {
                clusterId: string
                rnode: string
                totalStorage: number
                hasStorage: number
                fnodeNum: number
                state: boolean
            }
            fnodes: {
                fnid: string,
                rnode: string,
                cluster: string,
                fnStatus: string,
                usedM: string,
                quotaM: string
            }[]
        }
    }

    interface BfcBlocksResponse {
        code: 0
        msg: string
        data: {
            metaData: {
                totalCount: number
                page: number
                count: number
            }
            blocks: {
                BlockHeight: number
                BlockHash: string
                Producer: string
                Timestamp: number
                TxCount: number
            }[]
        }
    }

    interface BfcBlockResponse {
        code: 0,
        msg: string
        data: {
            BlockHeight: number
            BlockHash: string
            PrevBlockHash: string
            Producer: string
            Timestamp: number
            TxCount: number
            Txids: string[]
        }
    }

    interface BfcTransactionsResponse {
        code: 0
        msg: string
        data: {
            metaData: {
                totalCount: number
                page: number
                count: number
            }
            txs: {
                Txid: string
                timestamp: number
            }[]
        }
    }

    interface BfcTransactionResponse {
        code: 0
        msg: string
        data: {
            Txid: string
            BlockHash: string
            Timestamp: number
            TxType: number
            TxBody: {
                Contract: {
                    ID: string
                    Type: string
                    Payload: {
                        AccountFrom: string
                        AccountTo: string
                        CoinNum: number
                    }
                    Address: string
                    Timestamp: number
                    Signature: string
                    Pubkey: string
                }
            }
        }
    }

    interface BfcLineChartDataResponse {
        code: 0
        msg: string
        data: {
            labels: string[]
            uploads: number[]
            rewards: number[]
        }
    }
}

export { Getter, Handler }