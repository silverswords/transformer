const puppeteer = require("puppeteer")

const { setUserAgent, setViewportLarge } = require("../libs/agent.js")
const { setupPageEvents } = require("../libs/page_events.js")

async function executor()
{
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, "sme")

    await page.goto("https://sme.miit.gov.cn/zwpd/index.html", {
        waitUntil: "networkidle2",
    })

    const miit = await page.$$eval(".industry_list1", (div) =>
    {
        let obj = {}
        for (let i = 0; i < div.length; i++)
        {
            if (i < 2)
            {
                const node = div[i]
                const headline = node.children[0].children[0].innerHTML
                const ul = node.children[1].children[1].children[0].children[0].getElementsByTagName("LI")
                obj[headline] = []
                for (let j = 0; j < ul.length; j++)
                {
                    const li = ul[j]
                    obj[headline].push({
                        title: li.children[0].children[0].innerHTML.split("<i>")[0],
                        context: li.children[0].children[1].innerHTML,
                        date: li.children[0].children[0].children[0].innerHTML,
                        link: li.children[0].href
                    })
                }

            } else
            {
                const node = div[i]
                const headline = node.children[0].children[0].innerHTML
                const ul = node.children[1].children[1].children[0].getElementsByTagName("LI")
                obj[headline] = []
                for (let j = 0; j < ul.length; j++)
                {
                    const li = ul[j]
                    obj[headline].push({
                        title: li.children[0].innerHTML,
                        date: li.children[1].innerHTML.replace(/[^0-9\-]/g, ""),
                        link: li.children[0].href
                    })
                }
            }
        }
        return obj
    })

    console.log(miit)

    await page.close()
    await browser.close()
}

module.exports = {
    executor,
}
