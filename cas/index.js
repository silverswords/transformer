const puppeteer = require('puppeteer')

const { setUserAgent, setViewportLarge } = require('../libs/agent.js')
const { setupPageEvents } = require('../libs/page_events.js')
const { delay } = require('../libs/delay')

async function executor() {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, 'CAS')

    await page.goto('http://casad.cas.cn/ysxx2017/ysmdyjj/qtysmd_124280/', {
        waitUntil: 'networkidle2'
    })

    const allCasName = await page.$eval('#allNameBar', (node) => {
        const children = node.children

        let rets = []
        let department = ''
        for (let i = 0; i < children.length; i++) {
            const item = children[i]
            if (item.tagName != 'DD') {
                let text = item.textContent

                department = text.substring(0, text.indexOf('（'))
            } else {
                const span = item.children
                for (let i = 0; i < span.length; i++) {
                    const a = span[i].children[0]

                    rets.push({
                        department: department,
                        name: a.innerHTML,
                        link: a.href
                    })
                }
            }
        }

        return rets
    })

    const casNameInfo = []
    for (let i = 0; i < allCasName.length; i++) {

        await page.goto(allCasName[i].link, {
            waitUntil: 'networkidle2'
        })

        const info = await page.$eval('.contentBar', (node, casName) => {
            const content = node.children[1]

            const img = content.children[0].children[0]
            const div = content.children[1]

            const ps = div.querySelectorAll('p')
            let p = ''
            for (let j = 0; j < Object.keys(ps).length; j++) {
                if (ps[j].textContent.length < 6) {
                    continue
                }

                p = div.children[j].textContent
            }

            let expertise = ''
            if (p.indexOf('学家') != -1) {
                expertise = p.substring(0, p.indexOf('学家') + 2)
            }

            if (p.indexOf('专家') != -1) {
                expertise = p.substring(0, p.indexOf('专家') + 2)
            }

            let province = ''
            if (p.indexOf("生于") != -1) {
                province = p.substring(p.indexOf('生于') + 2, p.indexOf('生于') + 4)
            }

            if (p.indexOf("生，") != -1) {
                province = p.substring(p.indexOf('生，') + 2, p.indexOf('生，') + 4)
            }

            const birthday = p.substring(p.indexOf('年') - 4, p.indexOf('月') + 1)
            const elected = p.substring(p.indexOf('当选') - 5, p.indexOf('当选') - 1)

            let school = ''
            const schoolText = p.substring(p.indexOf('毕业于'))
            if (schoolText.indexOf('，') != -1) {
                school = schoolText.substring(3, schoolText.indexOf('，'))
            } else if (schoolText.indexOf('。') != -1) {
                school = schoolText.substring(3, schoolText.indexOf('。'))
            }

            return {
                department: casName.department,
                name: casName.name,
                province: province,
                school: school,
                img: img.src,
                expertis: expertise,
                birthday: birthday,
                elected: elected,
                info: p
            }
        }, allCasName[i])

        casNameInfo.push(info)
        console.log(info)

        await delay((Math.random() * 500) + 200)
    }
    console.log(casNameInfo)

    await page.close()
    await browser.close()
}

module.exports = {
    executor
}