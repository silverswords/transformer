const puppeteer = require("puppeteer")

const { setUserAgent, setViewportLarge } = require("../libs/agent.js")
const { setupPageEvents } = require("../libs/page_events.js")

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, "FUND")

    await page.goto("http://fund.eastmoney.com/company/default.html", {
        waitUntil: "networkidle2",
    })

    const Fund = await page.$eval(".common-sort-table > tbody", (tbody) => {
        let rets = []
        const tr = tbody.children
        for (let i = 0; i < tr.length; i++) {
            const td = tr[i]
            const fundsize = td.children[5].children[0].innerHTML
            rets.push({
                name: td.children[1].children[0].innerHTML,
                established: td.children[3].innerHTML,
                fundsize: fundsize.split("&")[0].replace(/[,\-]/g, ""),
                fundnum: td.children[6].children[0].innerHTML,
                personnel: td.children[7].children[0].innerHTML,
                date: td.children[5].children[0].children[0].innerHTML
            })
        }
        return rets
    })

    await page.close()
    await browser.close()
}

module.exports = {
    executor,
}
