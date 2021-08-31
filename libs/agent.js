async function setUserAgent(browser, page) {
    let agent = await browser.userAgent()

    await page.setUserAgent(agent.replace('Headless', ''))
}

async function setViewportLarge(page) {
    await page.setViewport({ width: 1440, height: 788 })
}

module.exports = {
    setUserAgent,
    setViewportLarge
}
