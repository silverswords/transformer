
const argv = process.argv

if (argv.length < 3) {
    console.log('Usage: node index.js xxx xxx xxx')
    return
}

async function main() {
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
