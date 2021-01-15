
/**
 * In Namespace Getter,
 * Types that ends with "Response" is a response sent by the upstream servers
 * Types that doesn't ends with "Response" is objects stored in MongoDB.
 */
declare namespace Getter {

    interface DBMetaData {
        key: string
        success: boolean
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
                        [key: string]: any
                        transfer?: {
                            [key: string]: any
                        }
                        payload?: {
                            [index: string]: any
                        }
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
                [key: string]: any
                payload?: {
                    [index: string]: any
                }
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

    interface BfcChainRewardResponse {
        Code: 0
        Data: {
            field: string
            fileid: string
        }[]
        Msg: string
    }

    interface BfcChainReward {
        field: string
        fileid: string
        date: Date
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

    interface ClusterListResponse {
        code: 0
        msg: 'success'
        data: {
            meta: {
                clusterNum: number
                poolNum: number
                minerNum: number
                totalStorage: number
                hasStorage: number
            }
            clusters: {
                clusterId: string
                totalStorage: number
                hasStorage: number
                rnodeNum: number
                fnodeNum: number
                normalRate: number
            }[]
        }
    }

    interface ErcBlocksResponse {
        code: number
        msg: string
        data: {
            metadata: {
                totalCount: number
                page: number
                count: number
            }
            blocks: Getter.ErcBlock[]
        }
    }

    interface ErcBlockInfoResponse {
        code: number
        msg: string
        data: {
            block: Getter.ErcBlock
        }
    }

    interface ErcTxsResponse {
        code: number
        msg: string
        data: {
            metadata: {
                totalCount: number
                count: number
                page: number
            }
            txs: Getter.ErcTransaction[]
        }
    }

    interface ErcTxResponse {
        code: number
        msg: string
        data: {
            tx: Getter.ErcTransaction
        }
    }

    interface ErcBlock {
        hash: string
        height: number
        parentHash: string
        timestamp: number
        transactions: string[]
        [key: string]: any
    }

    interface ErcTransaction {
        hash: string
        blockHash: string
        blockHeight: string
        [key: string]: string
    }

    interface BfcDbRnTradeResponse {
        code: 0
        msg: 'success'
        data: {
            fee: number
            rnid: string
            rnAddr: string
        }[]
    }

    interface BfcChainRnTradeResponse {
        code: 0
        msg: 'success'
        data: {
            fee: number
            rns: string[]
        }
    }

    interface BfcDbFnTradeResponse {
        code: 0
        msg: 'success'
        data: {
            fnid: string
            fnAddr: string
            fee: number
        }[]
    }

    interface BfcChainFnTradeResponse {
        code: 0
        data: {
            fns: string[]
            fee: number
        }
        msg: 'success'
    }

    interface BfcDbTrade {
        field: string
        afid: string
        date: Date
        rns: {
            fee: number
            rnid: string
            rnAddr: string
            fns?: {
                fnid: string
                fnAddr: string
                fee: number
            }[]
        }[]
    }

    interface BfcChainTrade {
        afid: string
        date: Date
        rnFee: number
        rns: {
            rnid: string
            fnFee?: number
            fns?: string[]
        }[]
    }
}

declare namespace Handler {

    /**
     * GET /clusters/rnodes?cluster={var}
     */
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

    /**
     * GET /clusters/fnodes?cluster={var}&rnode={var}&page={var}&count={var}
     */
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

    /**
     * GET /bfc/blocks?count={var}&page={var}&sortorder={desc|asc}
     */
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

    /**
     * GET /bfc/block?blockhash={var}
     */
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

    /**
     * GET /bfcDb/uploads?page={var}&count={var}&date={YYYYMMDD}
     */
    type BfcDbUploadResponse = Getter.BfcDbUploadResponse

    /**
     * GET /bfcDb/fileinfo?field={var}&afid={var}
     */
    type BfcDbFileInfoResponse = Getter.BfcDbFileInfoResponse

    /**
     * GET /bfcChain/rewards?page={var}&count={var}&date={YYYYMMDD}
     */
    type BfcChainRewardResponse = Getter.BfcChainRewardResponse

    /**
     * GET /bfc/transactions?page={var}&count={var}&sortOrder={asc|desc}
     */
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

    /**
     * GET /bfc/transaction?transid={var}
     */
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
                    [key: string]: any
                    Payload?: {
                        [index: string]: string
                    }
                }
            }
        }
    }

    /**
     * GET /bfc/getLineChartData?interval={day|week|month|quarter|year}
     */
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

    /**
     * GET /bgc/blocks?page={var}&count={var}
     */
    type BgcBlockResponse = Getter.BgcBlockResponse

    /**
     * GET /bgc/blockHeight
     */
    type BgcBlockHeightResponse = Getter.BgcBlockHeightResponse

    /**
     * GET /tfc/blocks?page={var}&count={var}
     */
    type TfcBlockResponse = Getter.TfcBlockResponse

    /**
     * GET /tfc/blockHeight
     */
    type TfcBlockHeightResponse = Getter.TfcBlockHeightResponse

    /**
     * GET /clusters
     */
    type ClusterListResponse = Getter.ClusterListResponse

    /**
     * GET /tfc/transactions?page={var}&count={var}
     */
    interface TfcTransactionResponse {
        code: 0,
        msg: 'success',
        data: {
            transactions: Getter.TfcTransaction[]
        }
    }

    /**
     * GET /erc/blocks?page={var}&count={var}&sortOrder={asc|desc}
     */
    type ErcBlocksResponse = Getter.ErcBlocksResponse

    /**
     * GET /erc/block?height={var}
     */
    type ErcBlockInfoResponse = Getter.ErcBlockInfoResponse

    /**
     * GET /erc/transactions?page={var}&count={var}&sortOrder={asc|desc}
     */
    type ErcTxsResponse = Getter.ErcTxsResponse

    /**
     * GET /erc/transaction?txid={var}
     */
    type ErcTxResponse = Getter.ErcTxResponse

    /**
     * GET /clusters/main
     */
    interface ClusterMainResponse {
        code: 0,
        msg: 'success',
        clusterMain: string
    }

    /**
     * GET /bfcDb/rnTrade?field={var}&afid={var}&date={YYYYMMDD}
     */
    type BfcDbRnTradeResponse = Getter.BfcDbRnTradeResponse

    /**
     * GET /bfcDb/fnTrade?field={var}&afid={var}&date={var}&rnid={var}
     */
    type BfcDbFnTradeResponse = Getter.BfcDbFnTradeResponse

    /**
     * GET /bfcChain/fnTrade?afid={var}&date={YYYYMMDD}&rnid={var}
     */
    type BfcChainFnTradeResponse = Getter.BfcChainFnTradeResponse

    /**
     * GET /bfcChain/rnTrade?afid={var}&date={YYYYMMDD}
     */
    type BfcChainRnTradeResponse = Getter.BfcChainRnTradeResponse
}

export { Getter, Handler }