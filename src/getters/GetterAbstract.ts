import Env from '../env.json'

/**
 * The object that is inherited by all Getters
 */
abstract class GetterAbstract {

    /**
     * Execute task() periodically
     */
    periodic() {
        setInterval(() => {
            this.task()
        }, Env.jobIntervalSeconds * 1000)
    }

    constructor() {
        this.periodic()
    }

    /** Any tasks that should be run periodically */
    abstract task(): any

    /** 
     * Any tasks that should be run once.
     * For example, create MongoDB Indexes.
     */
    abstract initialize(): any
}

export default GetterAbstract