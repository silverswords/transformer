const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'GUANCHA')

    await page.goto('https://www.guancha.cn/', {
        waitUntil: 'networkidle2',
    });

    const hotKeys = await page.$eval('.module-hot-point', (node) => {
        const children = node.children

        let rets = []
        for (let i = 0; i < children.length; i++) {
            const item = children[i]
            if (item.tagName != 'DIV') {
                continue
            }

            const a = item.children[0]
            const span = a.children[0]
            
            rets.push({
                title: span.innerHTML,
                link: a.href
            })
        }

        return rets
    })
    console.log(hotKeys)

    const newsList = await page.$eval('.img-List', (ul) => {
        const children = ul.children

        let rets = []
        for (let i = 0; i < children.length; i++) {
            const li = children[i]

            if (li.tagName != 'LI') {
                continue
            }

            const a = li.children[0].children[0]

            rets.push({
                title: a.innerHTML,
                link: a.href
            })
        }

        return rets
    })
    console.log(newsList)

    await page.close()
    await browser.close();
}

module.exports = {
    executor
}
