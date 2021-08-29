
const argv = process.argv

if (argv.length < 3) {
    console.log('Usage: node index.js xxx xxx xxx')
    return
}

async function main() {
    for (let i = 2; i < argv.length; i++) {
        let executor = async function () {
            await require(`./${argv[i]}/index.js`).executor()
        }

        await executor()
    }
}

main()
