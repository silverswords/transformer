const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'BANK')

    const banks = [
        'http://www.chinamoney.com.cn/chinese/lllpr/',
        'http://www.chinamoney.com.cn/chinese/bkshibor/'
    ]

    for (let i = 0; i < banks.length; i++) {
        await page.goto(banks[i], {
            waitUntil: 'networkidle2',
        })

        const data = await page.$$eval('.section-a', (node) => {
            const children = node[1].children

            let rets = []
            let date = children[0].children[2]
            let type = children[0].children[0]
            const typeStigin = type.textContent.trim()

            let table = children[1].children[0].children[0].children[0].children[2].children

            let tempRets = []
            for (let j = 0; j < table.length; j++) {
                const item = table[j]

                const term = item.children[0]
                const td = item.children[1]

                tempRets[term.textContent] = td.textContent
            }

            rets.push({
                type:typeStigin.substring(typeStigin.indexOf('(') + 1, typeStigin.indexOf(')')),
                date: date.textContent.substring(0, 10),
                ...tempRets
            })

            return rets
        })
        console.log(data)
    }

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
