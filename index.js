const { inspectSiteSelector } = require('./libs/general.js')

const argv = process.argv

if (argv.length < 3) {
    console.log('Usage: node index.js xxx xxx xxx')
    return
}

async function main() {
    const command = argv[2]

    if (command == "inspect") {
        const tree = await inspect(argv)
        console.log(JSON.stringify(tree))
        return
    }

    await crawling()
}

async function inspect(args) {
    const site = args[3]
    const selector = args[4]

    return await inspectSiteSelector(site, selector)
}

async function crawling() {
    for (let i = 2; i < argv.length; i++) {
        const site = argv[i]

        try {
            let executor = async function () {
                await require(`./${site}/index.js`).executor()
            }

            await executor()
        } catch (err) {
            console.log(`${site} - ${err}`)
        }
    }
}

main()
