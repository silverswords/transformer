const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')
const { delay } = require('../libs/delay')
const { post } = require('../libs/post')

const api = {
    Shibor: "http://192.168.0.22:8081/api/v1/post/shibor",
    LPR: "http://192.168.0.22:8081/api/v1/post/lpr",
    prr: "http://192.168.0.22:8081/api/v1/post/prr",
    pboc: "http://192.168.0.22:8081/api/v1/post/pboc"
}

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'BANK')

    const lprAndshibor = [
        'http://www.chinamoney.com.cn/chinese/lllpr/',
        'http://www.chinamoney.com.cn/chinese/bkshibor/'
    ]

    for (let i = 0; i < lprAndshibor.length; i++) {
        await page.goto(lprAndshibor[i], {
            waitUntil: 'networkidle2',
        })

        const data = await page.$$eval('.section-a', (node) => {
            const children = node[1].children

            const date = children[0].children[2]
            const type = children[0].children[0]
            const typeStigin = type.textContent.trim()

            const table = children[1].children[0].children[0].children[0].children[2].children

            let row = []
            for (let j = 0; j < table.length; j++) {
                const item = table[j]

                const term = item.children[0]
                const td = item.children[1]

                row[term.textContent] = +td.textContent
            }

            let rets = {
                type: typeStigin.substring(typeStigin.indexOf('(') + 1, typeStigin.indexOf(')')),
                date: new Date(date.textContent.substring(0, 10)).toISOString(),
                ...row
            }

            return rets
        })
        post(data, api[data.type])

        await delay((Math.random() * 500) + 200)
    }

    await page.goto('http://www.chinamoney.com.cn/chinese/mkdatapm/', {
        waitUntil: 'networkidle2',
    })

    const prr = await page.$eval('.san-tabs-content', (node) => {
        const children = node.children[1].children[0].children[0].children[0].children[0].children[0]
        const date = children.children[0].children[0].children[0]
        const table = children.children[1].children[0].children[0].children[0].children[2].children

        let row = []
        for (let i = 0; i < table.length; i++) {
            if (table[i].getAttribute('data-blank') !== '1') {
                row[table[i].children[0].textContent] = +table[i].children[1].textContent
            }
        }

        let rets = []
        let year = new Date().getFullYear()
        rets.push({
            date: new Date(year + '-' + date.textContent.trim().substring(0, 5)).toISOString(),
            ...row
        })
        return rets
    })
    post(...prr, api['prr'])

    await page.goto("http://www.chinamoney.com.cn/chinese/yhgkscczh/", {
        waitUntil: "networkidle2",
    })

    const pboc = await page.$eval("#ticket-handle-tbody", (tbody) =>
    {
        let rets = []
        const tr = tbody.children
        for (let i = 0; i < tr.length; i++)
        {
            const td = tr[i]
            rets.push({
                date: new Date(td.children[0].children[0].innerHTML).toISOString(),
                period: +td.children[1].children[0].innerHTML,
                dealAmount: +td.children[2].children[0].innerHTML,
                rate: +td.children[3].children[0].innerHTML,
                tradingMethod: td.children[4].children[0].innerHTML,
            })
        }
        return rets
    })

    for(let i = 0; i< pboc.length; i++) {
        post(pboc[i], api['pboc'])
    }

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
