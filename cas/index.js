const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'CAS')

    await page.goto('http://casad.cas.cn/ysxx2017/ysmdyjj/qtysmd_124280/', {
        waitUntil: 'networkidle2'
    })

    const allCasName = await page.$eval('#allNameBar', (node) => {
        const children = node.children

        let rets = []
        let department = ''
        for (let i = 0; i < children.length; i++) {
            const item = children[i]
            if (item.tagName != 'DD') {
                let text = item.textContent

                department = text.substring(0, text.indexOf('（'))
            } else {
                const span = item.children
                for (let i = 0; i < span.length; i++) {
                    const a = span[i].children[0]

                    rets.push({
                        department: department,
                        name: a.innerHTML,
                        link: a.href
                    })
                }
            }
        }

        return rets
    })
    console.log(allCasName)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}