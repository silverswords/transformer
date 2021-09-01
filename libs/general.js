const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('./agent.js')
const { setupPageEvents } = require('.//page_events.js')

async function inspectSiteSelector(site, selector) {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'SITE INSPECT')

    await page.goto(site, {
        waitUntil: 'networkidle2',
    })

    const tree = await page.$eval(selector, (node) => {
        function dumpDOMTree(node) {
            const tagName = node.tagName
            const className = node.className
            const children = []

            if (!node.children || node.children.length == 0) {
                return {
                    tag: tagName,
                    class: className,
                    html: node.innerHTML
                }
            }
        
            for (let i = 0; i < node.children.length; i++) {
                children.push(dumpDOMTree(node.children[i]))
            }
        
            tree = {
                tag: tagName,
                class: className,
                html: node.innerHTML,
                children: children
            }

            return tree
        }

        return dumpDOMTree(node)
    })

    await page.close()
    await browser.close()

    return tree
}

async function inspectPageEvents(site) {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'SITE EVENTS INSPECT')

    page.on('error', err => {
        console.log(`${site} error: ${err}`)
    })

    page.on('frameattached', frame => {
        console.log(`${site} frame attached: ${frame.name()} - ${frame.url()}`)
    })

    page.on('workercreated', worker => {
        console.log(`${site} worker created: ${worker.url()}`)
    })

    await page.goto(site, {
        waitUntil: 'networkidle2',
    })

    await page.close()
    await browser.close()
}

module.exports = {
    inspectSiteSelector,
    inspectPageEvents
}