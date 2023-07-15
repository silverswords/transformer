const puppeteer = require("puppeteer")
const fs = require('fs');

const { setUserAgent, setViewportLarge } = require("../libs/agent.js")
const { setupPageEvents } = require("../libs/page_events.js")
const { delay } = require('../libs/delay')


async function executor() {
    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage()
    await setUserAgent(browser, page)
    await setViewportLarge(page)

    setupPageEvents(page, "MEDICINE")

    await getDetail(page)

    await page.close()
    await browser.close()
}

async function getDetail(page) {
    let result = []
    for (let nextPage = 1; nextPage <= 45; nextPage++) {
        await page.goto("http://www.zhongyoo.com/name/page_" + nextPage + ".html", {
            waitUntil: "networkidle2",
        })
    
        let infos = await page.$eval("body > div:nth-child(6) > div > div.one-right2 > div.r2-cons > div", async (list) => {
            let medicines = list.children
            let infos = []

            for (let i = 0; i < medicines.length; i++) {
                const medicine = medicines[i]
                const span = medicine.children[0].children[0]
                const a = medicine.children[1].children[0]
    
                infos.push({
                    url: a.href,
                    image: span.children[0].src,
                    name: a.textContent
                })
            }

            return infos
        })

        for (let i = 0; i < infos.length; i++) {
            console.log(infos[i].name)

            await page.goto(infos[i].url, {
                waitUntil: "networkidle2",
            })

            let detail = await page.$eval("body > div:nth-child(7) > div.con_left2 > div.gaishu > div.text", (content, info) => {
                let ps = content.children
                fieldType = ""

                for (let i = 2; i < ps.length - 6; i++) {
                    item = ps[i]

                    if (item.getElementsByTagName("strong").length > 0) {
                        fieldType = item.getElementsByTagName("strong")[0].textContent
                        
                        switch (fieldType) {
                            case "别名":
                                info.alias = item.textContent.trim().slice(4, -1).split("、")
                                break
                            case "性味归经":
                                let tasteAndTropism = item.textContent.trim().slice(6, -1).split("。")
                                info.taste = tasteAndTropism[0].split("，")
                                if (tasteAndTropism.length == 2) {
                                    info.tropism = tasteAndTropism[1].split("、")
                                    info.tropism[0] = info.tropism[0].slice(1)
                                }
                                break
                            case "功效与作用":
                                info.effect = item.textContent.trim().slice(7)
                                break
                            case "临床应用":
                                info.clinical =  item.textContent.trim().slice(6)
                                break
                            case "药理研究":
                                info.pharmacology = [item.textContent.trim().slice(6)]
                                break
                            case "主要成分":
                                info.element = item.textContent.trim().slice(6)
                                break
                            case "使用禁忌":
                                info.taboo = item.textContent.trim().slice(6)
                                break
                            case "药用部位":
                                info.medicinalPart =  item.textContent.trim().slice(6)
                                break
                            case "植物形态":
                                info.plantForm = item.textContent.trim().slice(6)
                                break
                            case "产地分布":
                                info.placeOfOrigin = item.textContent.trim().slice(6)
                                break
                            case "采收加工":
                                info.harvest = item.textContent.trim().slice(6)
                                break
                            case "药材性状":
                                info.character = item.textContent.trim().slice(6)
                                break
                            case "配伍药方":
                                info.prescription = [item.textContent.trim().slice(6)]
                                break
                        }
                    } else {
                        switch (fieldType) {
                            case "药理研究":
                                info.pharmacology.push(item.textContent.trim())
                                break
                            case "配伍药方":
                                info.prescription.push(item.textContent.trim())
                                break
                        }
                    }
                }

                return info
            }, infos[i])
            
            console.log(detail)
            result.push(detail)
        }

        console.log("page:" + nextPage)

        await delay((Math.random() * 1000) + 400)
    }

    const saveJson = JSON.stringify(result)
    fs.writeFile('medicine.json', saveJson, (err) => {
        if (err) {
            throw err
        }
        console.log("JSON data is saved.")
    })
}

module.exports = {
    executor,
}
