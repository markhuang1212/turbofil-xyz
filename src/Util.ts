function fatalError(msg: string) {
    console.log(`FATAL ERROR: ${msg}`)
    console.log('server terminating.')
    process.exit(1)
}

export {fatalError}