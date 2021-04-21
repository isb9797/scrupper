const browserObject = require("./browser");
const scraperController = require("./pageController");

//создаю объект браузера
let browserInstance = browserObject.startBrowser();

// отдаю браузер в скрапер
scraperController(browserInstance);
