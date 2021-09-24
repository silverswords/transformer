const puppeteer = require("puppeteer")

const { setUserAgent, setViewportLarge } = require("../libs/agent.js")
const { setupPageEvents } = require("../libs/page_events.js")

async function executor()
{
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, "OMO")

    await page.goto("http://www.chinamoney.com.cn/chinese/yhgkscczh/", {
        waitUntil: "networkidle2",
    })

    const PBOC = await page.$eval("#ticket-handle-tbody", (tbody) =>
    {
        let rets = []
        const tr = tbody.children
        for (let i = 0; i < tr.length; i++)
        {
            const td = tr[i]
            rets.push({
                date: td.children[0].children[0].innerHTML,
                period: td.children[1].children[0].innerHTML,
                dealAmount: td.children[2].children[0].innerHTML,
                rate: td.children[3].children[0].innerHTML,
                tradingMethod: td.children[4].children[0].innerHTML,

            })
        }
        return rets
    })

    console.log(PBOC)

    await page.close()
    await browser.close()
}

module.exports = {
    executor,
}
