const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'TREDNING')

    await page.goto('https://github.com/trending/go?since=daily', {
        waitUntil: 'networkidle2'
    })

    const trendList = await page.$$eval('.Box-row', (nodeList) => {
        const rets = []

        for (let i = 0; i < nodeList.length; i++) {
            const item = nodeList[i]

            const a = item.children[1].children[0]
            const p = item.children[2]

            const div = item.children[3]
            const stars = div.children[1]
            const forks = stars.nextElementSibling
            const dailyStars = div.lastElementChild

            rets.push({
                repository: a.href,
                synopsis: p.textContent.trim(),
                stars: +stars.textContent.trim().replaceAll(',', ''),
                forks: +forks.textContent.trim().replaceAll(',', ''),
                dailyStars: +dailyStars.textContent.trim().replaceAll(',', '').replace('stars today', '')
            })
        }

        return rets
    })
    console.log(trendList)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}