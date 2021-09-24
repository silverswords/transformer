const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')
const { delay } = require('../libs/delay')
const { post } = require('../libs/post')

const api = {
    Shibor: "http://192.168.0.25:8080/api/v1/post/shibor",
    LPR: "http://192.168.0.25:8080/api/v1/post/lpr"
}

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

            const date = children[0].children[2]
            const type = children[0].children[0]
            const typeStigin = type.textContent.trim()

            const table = children[1].children[0].children[0].children[0].children[2].children

            let tempRets = []
            for (let j = 0; j < table.length; j++) {
                const item = table[j]

                const term = item.children[0]
                const td = item.children[1]

                tempRets[term.textContent] = +td.textContent
            }

            let rets = {
                type: typeStigin.substring(typeStigin.indexOf('(') + 1, typeStigin.indexOf(')')),
                date: new Date(date.textContent.substring(0, 10)).toISOString(),
                ...tempRets
            }

            return rets
        })
        post(data, api[data.type])

        await delay((Math.random() * 500) + 200)
    }

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
