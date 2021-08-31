let pageEventsStats = {}

function setupPageEvents(page, key) {
    pageEventsStats[key] = {
        url: {
            total: 0,
            failed: 0,
            failedUrls: {}
        },
        messages: []
    }

    page.on('request', (req) => {
        pageEventsStats[key].url.total += 1
    })

    page.on('requestfailed', (req) => {
        const url = pageEventsStats[key].url

        url.failed += 1
        if (url.failedUrls[req.url()] === undefined) {
            url.failedUrls[req.url()] = 0
        }

        url.failedUrls[req.url()] += 1
    })

    page.on('close', () => {
        const stat = pageEventsStats[key]

        console.log(`Crawling ${key} Statistics: \n\ttotal req(${stat.url.total}), failed req(${stat.url.failed})`)

        const failed = Object.keys(stat.url.failedUrls)
        for (let i = 0; i < failed.length; i++) {
            console.log(`\t\t${failed[i]} failed ${stat.url.failedUrls[failed[i]]} times`)
        }

        console.log(`${key} console messages:`)
        stat.messages.forEach(msg => {
            console.log(`\t${msg}`)
        });
    })

    page.on('console', msg => pageEventsStats[key].messages.push(msg.text()))
}

module.exports = {
    setupPageEvents
}
