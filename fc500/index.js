const puppeteer = require('puppeteer')
const fs = require('fs');

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')
const { delay } = require('../libs/delay')
const { press } = require('../libs/press')
const { waitClick } = require('../libs/wait_click.js')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'FC500')

    const url = {
        '2021': 'http://www.fortunechina.com/fortune500/c/2021-07/20/content_392708.htm',
        '2020': 'http://www.fortunechina.com/fortune500/c/2020-07/27/content_369925.htm',
        '2019': 'http://www.fortunechina.com/fortune500/c/2019-07/10/content_337536.htm',
        '2018': 'http://www.fortunechina.com/fortune500/c/2018-07/10/content_309961.htm',
        '2017': 'http://www.fortunechina.com/fortune500/c/2017-07/31/content_287415.htm'
    }

    await page.goto(url['2021'], {
        waitUntil: 'networkidle2',
    })

    //Tables will not be formatted differently until 2018, please note L32, L33

    await waitClick(page, '#table1_length > label > select')
    await press(page, 'ArrowDown', 'ArrowDown', 'ArrowDown', 'Enter')

    //L38 Use '#table1 > tbody' after 2018
    //L38 Use '#yytable > tbody' by 2018

    const companyList = await page.$eval('#table1 > tbody', (table) => {
        const row = table.children
        let rets = []

        for (let i = 0; i < row.length; i++) {
            const item = row[i]
            const ranking = item.children[0]
            const lastRanking = item.children[1]
            const a = item.children[2]
            const revenue = item.children[3]
            const profit = item.children[4]

            rets.push({
                ranking: +ranking.textContent.trim(),
                lastRanking: +lastRanking.textContent.trim(),
                name: a.textContent.trim(),
                link: a.children[0].href,
                revenue: +revenue.textContent.trim().replaceAll(',', ''),
                profit: +profit.textContent.trim().replaceAll(',', ''),
            })
        }

        return rets
    })

    for (let i = 0; i < companyList.length; i++) {
        await page.goto(companyList[i].link, {
            waitUntil: 'networkidle2',
        })

        const info = await page.$eval('#printArea', (node) => {
            const table = node.children[1].children[1].children[0].children[0].children[0].children[0]

            const revenueAnnualIncrease = table.children[1].children[2]
            const profitAnnualIncrease = table.children[2].children[2]
            const asset = table.children[3].children[1]
            const market = table.children[4].children[1]
            const shareholderRights = table.children[5].children[1]
            const netInterestRateAnnualIncrease = table.children[7].children[2]
            const returnOnNetAssets = table.children[8].children[2]
            const returnOnAssets = table.children[9].children[2]

            const form = node.children[1].children[1].children[0].children[1]

            const chairman = form.children[3]
            const employee = form.children[7]
            const website = form.children[11].children[0]
            const addr = form.children[1]

            let province = ''

            if (addr.textContent.trim().indexOf('省') > 0) {
                province = addr.textContent.trim().substring(0, addr.textContent.trim().indexOf('省') + 1)
            } else if (addr.textContent.trim().indexOf('市') > 0) {
                province = addr.textContent.trim().substring(0, addr.textContent.trim().indexOf('市') + 1)
            } else if (addr.textContent.trim().indexOf('区') > 0) {
                province = addr.textContent.trim().substring(0, addr.textContent.trim().indexOf('区') + 1)
            } else if (addr.textContent.trim().indexOf('道') > 0) {
                province = addr.textContent.trim().substring(0, addr.textContent.trim().indexOf('道') + 1)
            }

            const trade = node.children[3].children[0]

            return {
                trade: trade.textContent.replace('- 行业横向比较','').replace('利润','').replace('营收','').replace('总资产','').trim(),
                revenueAnnualIncrease: revenueAnnualIncrease.textContent.trim(),
                profitAnnualIncrease: profitAnnualIncrease.textContent.trim(),
                asset: +asset.textContent.trim().replaceAll(',', ''),
                market: +market.textContent.trim().replaceAll(',', ''),
                shareholderRights: +shareholderRights.textContent.trim().replaceAll(',', ''),
                netInterestRateAnnualIncrease: +netInterestRateAnnualIncrease.textContent.trim().replaceAll(',', ''),
                returnOnNetAssets: +returnOnNetAssets.textContent.trim().replaceAll(',', ''),
                returnOnAssets: +returnOnAssets.textContent.trim().replaceAll(',', ''),
                addr: addr.textContent.trim(),
                province: province,
                chairman: chairman.textContent.trim(),
                employee: +employee.textContent.trim().replaceAll(',', ''),
                website: website.href
            }
        })

        infoKey = Object.keys(info)

        for(let j = 0; j < infoKey.length; j++) {
            companyList[i][infoKey[j]] = info[infoKey[j]]
        }

        await delay((Math.random() * 500) + 200)
        console.log(i, companyList[i].name)
    }
    const saveJson = JSON.stringify(companyList)
    fs.writeFile('fc500.json', saveJson, (err) => {
        if (err) {
            throw err
        }
        console.log("JSON data is saved.")
    })

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
