import Env from '../env.json'

/**
 * An GetterAbstract instance is the underlying
 * class that is responsible for fetching, caching
 * some APIs.
 */
abstract class GetterAbstract {

    periodic() {
        setInterval(() => {
            this.task()
        }, Env.jobIntervalSeconds * 1000)
    }

    constructor() {
        this.periodic()
    }

    abstract task(): any
    abstract initialize(): any
}

export default GetterAbstract