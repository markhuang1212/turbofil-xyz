import { Long } from "mongodb";

declare namespace Getter {
    interface RNode {
        rn_id: string
        runStatus: boolean
        loopStatus: boolean
        backendStatus: boolean

        web: string
        proc: string
        running: string

        totalStorage: Long // sum of quotaM
        hasStorage: Long // sum of usedM

        fnodes: {
            fn_id: string
            fn_status: string
            usedM: Long
            quotaM: Long
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
}

export { Getter, Handler }