import Env from '../env.json'

abstract class GetterAbstract {

    periodic() {
        setInterval(() => {
            this.task()
        }, Env.jobIntervalSeconds * 1000)
    }

    abstract task(): any
    abstract initialize(): any
}

export default GetterAbstract