const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'GOV')

    await page.goto('http://www.gov.cn/index.htm', {
        waitUntil: 'networkidle2',
    })

    // 
    const h206 = await page.$eval('.h206', (ul) => {
        let rets = []

        if (ul.tagName != 'UL') {
            console.log(`GOV: ul.h206 required, ${ul.tagName} not match`)
            return rets
        }

        for (let i = 0; i < ul.children.length; i++) {
            const li = ul.children[i]

            if (li.tagName != 'LI') {
                console.log(`GOV ul.h206 index(${i} isn't a li element, is a ${a.tagName})`)
                continue
            }

            const a = li.children[0]
            if (a.tagName != 'A') {
                console.log(`GOV ul.h206 index(${i} isn't a anchor element, is a ${a.tagName})`)
                continue
            }

            rets.push({
                title: a.innerHTML,
                link: a.href
            })
        }

        return rets
    })
    console.log(h206)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
