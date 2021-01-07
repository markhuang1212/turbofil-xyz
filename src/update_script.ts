import fs from 'fs'
import path from 'path'
import colors from 'colors'
import { exec } from 'child_process'
import { promisify } from 'util'
colors.enable()

/**
 * Each pair includes a version and a function.
 * The function is what should be run in order to
 * update from the last version.
 * 
 * It is possible that no updating function is needed,
 * but the version pair should always be put below.
 */
const versions: [string, () => void][] = [
    ['1.1.1', () => { }],
    ['1.1.2', nothingToUpdate('1.1.1', '1.1.2')]
]

function update(from: string, to: string) {
    let i = 0;
    while (from !== versions[i][0])
        i++

    while (to !== versions[i][0]) {
        versions[i][1]()
        i++
    }

    versions[i][1]()
}

function nothingToUpdate(from: string, to: string) {
    return (() => {
        process.stdout.write(`v${from} => v${to}: `.yellow)
        process.stdout.write(`Nothing to update\n`)
    })
}

async function main() {
    if (process.argv.length !== 3) {
        console.error('Usage: npm run update [version_old]')
    }

    const version_old = process.argv[2]
    const version_new = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')).version

    console.log(`Updating from v${version_old} to v${version_new}`.black.bgWhite)

    console.log('Installing new dependencies...')
    await promisify(exec)('npm i')

    console.log('Running updating scripts...')
    update(version_old, version_new)

    console.log('Building...')
    await promisify(exec)('npm run build')

    console.log('Success.'.green)
}

main().then(() => process.exit(0))