const delay = require('../libs/delay.js').delay

async function executor() {
    console.log('start crawling golang.com')

    await delay(1500)
}

module.exports = {
    executor
}
