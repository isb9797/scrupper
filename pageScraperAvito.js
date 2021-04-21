const tesseract = require("tesseract.js");
const fs = require("fs");

const scraperObject = {
  url:
    "https://www.avito.ru/sankt-peterburg/koshki/poroda-meyn-kun-ASgBAgICAUSoA5IV",
  scrapedData: {},
  async scraper(browser) {
    let page = await browser.newPage();
    //let currentPage = await browser.page();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".items-items-38oUm");
    console.log("Загрузка началась ...");
    // Get the link to all the required books
    let urls = await page.$$eval(
      "div.iva-item-titleStep-2bjuh > a",
      (links) => {
        // Extract the links from the data
        links = links.map((el) => el.href);
        return links;
      }
    );

    //?Цикл перехода по ссылкам
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        //Заносим данные в объект с ключами
        dataObj["title"] = await newPage.$eval(
          "h1.title-info-title > span",
          (text) => text.textContent
        );
        dataObj["description"] = await newPage.$eval(
          "div[itemprop='description'] > p",
          (text) => text.textContent
        );
        dataObj["url"] = await newPage.url();
        dataObj["price"] = await newPage.$eval(
          ".price-value-string",
          (text) => {
            const rep = text.textContent.replace(/₽\s+/g, "").trim();
            const repNum = +rep.replace(/\s/g, "");
            return repNum;
          }
        );
        dataObj["author"] = await newPage.$eval(
          ".seller-info-name > a",
          (a) => {
            const name = a.innerText;
            const ahref = a.href;

            return `${name}: ${ahref}`;
          }
        );
        //Не реализована в полном обьеме
        dataObj["date"] = await newPage.$eval(
          "div.title-info-metadata-item-redesign",
          (date) => {
            const dateText = date.textContent.replace(/\n\s+/g, "").trim();
            const months = new Map([
              ["января", "01"],
              ["февраля", "02"],
              ["марта", "03"],
              ["апреля", "04"],
              ["мая", "05"],
              ["июня", "06"],
              ["июля", "07"],
              ["августа", "08"],
              ["сентября", "09"],
              ["октября", "10"],
              ["ноября", "11"],
              ["декабря", "12"],
            ]);

            const dateArr = dateText.split(" ");

            if (dateArr.length < 5) {
              const date = new Date();
              const nowYear = date.getFullYear();
            }

            return dateArr;
          }
        );

        resolve(dataObj);
        await newPage.close();
      });

    let iteration = 0;

    for (link in urls) {
      if (iteration <= 10) {
        iteration = iteration + 1;
        let currentPageData = await pagePromise(urls[link]);
        this.scrapedData[link] = currentPageData;
        console.log(currentPageData);

        //console.log(link, " Загружен");
      } else {
        fs.writeFile("result.json", JSON.stringify(this.scrapedData), (err) => {
          if (err) {
            return console.error(err);
          }
        });
        await browser.close();
        return;
      }
    }
  },
};

module.exports = scraperObject;
