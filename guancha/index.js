const delay = require('../libs/delay.js').delay

async function executor() {
    console.log('start crawling guancha.com')

    await delay(3000)
}

module.exports = {
    executor
}
