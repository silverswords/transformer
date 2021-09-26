const { delay } = require('../libs/delay')

async function waitClick(page, select) {
    await page.waitForSelector(select, {visible: 'visibility: hidden'})
    await delay((Math.random() * 500) + 200)
    await page.click(select,{'delay': (Math.random() * 500) + 200})
}

module.exports = {
    waitClick
}