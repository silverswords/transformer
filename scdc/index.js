const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')
const { delay } = require('../libs/delay')

const partition = [
    '海关', '办公室', '分行', '银行', '大学', '署', '局',
    '厅', '处', '院', '会', '团', '部', '社', '组', '总裁',
    '党委', '市', '省', '自治区', '公司', '实业', '集团'
]

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'SCDC')

    await page.goto('https://www.ccdi.gov.cn/scdc/', {
        waitUntil: 'networkidle2',
    })

    const departments = await page.$eval('.main', (node) => {
        const children = node.children

        let rets = []
        let department = ''

        for (let i = 1; i < children.length; i++) {
            if (children[i].className === 'title_1' || children[i].className === 'title_2') {
                department = children[i].textContent.trim()
            }

            if (children[i].className === 'title_3') {
                rets.push({
                    department: department,
                    link: children[i].children[1].href
                })
            }
        }

        return rets
    })

    let scdc = []
    for (let i = 0; i < departments.length; i++) {
        await page.goto(departments[i].link)

        const item = await page.$eval('.main', (node, department, partition) => {
            const list = node.children[1].children

            let rets = []
            for (let j = 0; j < list.length; j++) {
                const a = list[j].children[0]
                const date = list[j].children[1]

                function split(str) {
                    for (let k = 0; k < partition.length; k++) {
                        if (str.indexOf(partition[k]) !== -1) {
                            return str.substring(0, str.indexOf(partition[k]) + partition[k].length)
                        }
                    }
                }

                rets.push({
                    departments: department,
                    date: date.textContent,
                    title: split(a.textContent.trim()),
                    info: a.textContent.trim()
                })
            }

            return rets
        }, departments[i].department, partition)

        scdc.push(...item)

        await delay((Math.random() * 1000) + 400)
    }
    console.log(scdc)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}
