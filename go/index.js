const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'GO')

    await page.goto('https://go.dev/blog', {
        waitUntil: 'networkidle2',
    })

    const messages = []
    const blogs = await page.$eval('#blogindex', (node) => {
        const children = node.children

        let rets = []
        for (let i = 0; i < children.length - 1; i += 2) {
            const title = children[i]
            const summary = children[i + 1]

            if (title.tagName != 'P' || title.className != 'blogtitle') {
                messages.push(`Go Blog, children[${i}] is ${title.tagName}, P required; Class: [${title.className}], blogtitle required`)
                continue
            }

            if (summary.tagName != 'P' || summary.className != 'blogsummary') {
                messages.push(`Go Blog, children[${i}] is ${summary.tagName}, P required; Class: [${summary.className}], blogsummary required`)
                continue
            }

            rets.push({
                title: title.children[0].innerHTML,
                link: title.children[0].href,
                summary: summary.innerHTML
            })
        }

        return rets
    })

    if (messages.length != 0) {
        messages.forEach(m => console.warn(`Go Blog Warning: ${m}`))
    }

    console.log(blogs)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
