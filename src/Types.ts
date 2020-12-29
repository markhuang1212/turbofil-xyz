import { Long, Int32 } from "mongodb";

declare namespace Getter {

    interface DBCachedObject {
        cached_success: boolean
    }

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

    interface BfcBlocksResponse {
        Height: number
        LastBlockDate: string
        Block: {
            Version: number
            Height: number
            TxCount: number
            Timestamp: number
            Producer: string
            PrevBlockHash: string
            Hash: string
            TransactionMap: {
                [index: string]: {
                    TransactionID: string
                    TimeStamp: number
                    TransactionType: number
                    TransactionBody: {
                        address: string
                        id: string
                        payload: {
                            [index: string]: any
                        }
                        pubkey: string
                        signature: string
                        timestamp: number
                        type: string
                    }
                }
            }
        }[]
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
        tx_id: string
        block_hash: string
        timestamp: number
        tx_type: number
        tx_body: {
            contract: {
                id: string
                type: string
                payload: {
                    [index: string]: any
                }
                address: string
                timestamp: number
                signature: string
                pub_key: string
            }
        }
    }


    interface BgcBlock {
        header: {
            Height: number
            Hash: string
            [key: string]: any
        }
        body: {
            [key: string]: any
        }
    }

    interface BgcBlockResponse {
        code: 0
        data: {
            blocks: BgcBlock[]
        }
        msg: 'success'
    }

    interface BgcBlockHeightResponse {
        code: 0
        data: {
            blockHeight: number
        }
        msg: 'success'
    }

    interface BfcDbUploadResponse {
        code: 0,
        data: {
            field: string
            fileid: string
        }[]
    }

    interface BfcDbUpload {
        field: string
        fileid: string
        date: Date
        info?: {
            [key: string]: any
        }
    }

    interface BfcDbFileInfoResponse {
        code: 0
        data: {
            [key: string]: any
        }
        msg: 'success'
    }

    interface TfcBlockResponse {
        code: 0
        data: {
            blocks: {
                header: {
                    Height: number
                    Hash: string
                    Timestamp: number
                    [key: string]: any
                }
                body: {
                    transactions: {
                        id: string
                        timestamp?: number
                        [key: string]: any
                    }[]
                }
            }[]
        }
    }

    interface TfcBlockHeightResponse {
        code: 0
        data: {
            blockHeight: number
        }
        msg: string
    }

    type TfcBlock = TfcBlockResponse['data']['blocks'][0]
    type TfcTransaction = TfcBlockResponse['data']['blocks'][0]['body']['transactions']

    interface BfcChainReward {
        field: string
        fileid: string
        date: Date
    }

    interface BfcChainRewardResponse {
        Code: 0
        Data: {
            field: string
            fileid: string
        }[]
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

    type BfcDbUploadResponse = Getter.BfcDbUploadResponse
    type BfcDbFileInfoResponse = Getter.BfcDbFileInfoResponse

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
                Timestamp: number
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
                        [index: string]: string
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

    type BfcLineChartInterval = 'day' | 'week' | 'month' | 'quarter' | 'year'

    type BgcBlockResponse = Getter.BgcBlockResponse
    type BgcBlockHeightResponse = Getter.BgcBlockHeightResponse
}

export { Getter, Handler }