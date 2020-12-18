import Env from '../env.json'

abstract class GetterAbstract {
    periodic() {
        // this.task()
        setInterval(this.task, Env.jobIntervalSeconds * 1000)
    }
    abstract task(): any
}

export default GetterAbstract