const puppeteer = require("puppeteer");
const fs = require("fs");

const { setUserAgent, setViewportLarge } = require("../libs/agent.js");
const { setupPageEvents } = require("../libs/page_events.js");
const { delay } = require("../libs/delay");
const { url } = require("inspector");

async function executor() {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await setUserAgent(browser, page);
  await setViewportLarge(page);

  setupPageEvents(page, "SYNDROME");

  await getDetail(page);

  await page.close();
  await browser.close();
}

async function getDetail(page) {
  let result = [];
  await page.goto("http://www.a-hospital.com/w/%E6%8A%BD%E6%90%90", {
    waitUntil: "networkidle2",
  });

  let urls = await page.$eval(
    "#bodyContent > table:nth-child(46) > tbody > tr > td:nth-child(2) > ul",
    (list) => {
      let items = list.children;
      let urls = [];

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let a = item.children[0].children[0];
        let title = a.title;

        urls.push({
          title: title,
          url: a.href,
        });

        if (title == "头部症状") {
          for (let j = 1; j <= 4; j++) {
            a = item.children[j];
            urls.push({
              title: a.title,
              url: a.href,
            });
          }
        }

        if (title == "生殖部位症状") {
          for (let j = 1; j <= 2; j++) {
            a = item.children[j];
            urls.push({
              title: a.title,
              url: a.href,
            });
          }
        }

        if (title == "四肢症状") {
          for (let j = 1; j <= 2; j++) {
            a = item.children[j];
            urls.push({
              title: a.title,
              url: a.href,
            });
          }
        }
      }

      return urls;
    }
  );

  console.log(urls);

  for (let i = 0; i < urls.length; i++) {
    await page.goto(urls[i].url, {
      waitUntil: "networkidle2",
    });

    let detail = {};
    console.log(urls[i].title);
    if (urls[i].title == "生殖部位症状" || urls[i].title == "耳部症状") {
      detail = await page.$eval(
        "#bodyContent > ul:nth-child(6)",
        (content, title) => {
          let detail = [];

          let items = content.children;
          for (let i = 0; i < items.length; i++) {
            let item = items[i].children[0];

            detail.push({
              type: title,
              syndrome: item.textContent,
            });
          }

          return detail;
        },
        urls[i].title
      );
    } else {
      detail = await page.$eval(
        "#bodyContent > table:nth-child(6) > tbody > tr",
        (content, title) => {
          let detail = [];

          let tds = content.children;
          for (let i = 0; i < tds.length; i++) {
            let items = tds[i].children[0].children;

            for (let j = 0; j < items.length; j++) {
              if (items[j].children.length == 1) {
                detail.push({
                  type: title,
                  syndrome: items[j].children[0].title,
                });
              } else {
                detail.push({
                  type: title,
                  syndrome: items[j].textContent,
                });
              }
            }
          }

          return detail;
        },
        urls[i].title
      );
    }

    console.log(detail);
    result.push(...detail);

    await delay(Math.random() * 1000 + 400);
  }

  const saveJson = JSON.stringify(result);
  fs.writeFile("syndrome.json", saveJson, (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved.");
  });
}

module.exports = {
  executor,
};
