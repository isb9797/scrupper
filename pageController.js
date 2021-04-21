const pageScraper = require("./pageScraperAvito");
async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    await pageScraper.scraper(browser);
  } catch (err) {
    console.log("Невозможно обработать запрос браузера => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
