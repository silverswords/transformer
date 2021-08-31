async function setUserAgent(browser, page) {
    let agent = await browser.userAgent()

    await page.setUserAgent(agent.replace('Headless', ''))
}

module.exports = {
    setUserAgent
}
