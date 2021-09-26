const { delay } = require('../libs/delay')

async function press(page, ...key) {
    for (let i = 0; i < key.length; i++) {
        await delay((Math.random() * 500) + 200)
        await page.keyboard.press(key[i])
    }
}

module.exports = {
    press
}