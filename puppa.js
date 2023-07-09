const puppeteer = require("puppeteer");

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.cineplanet.com.pe/peliculas");
    await page.waitForSelector(".movies-list", { timeout: 1000 });
    const body = await page.evaluate(() => {
      return document.querySelector("div").innerHTML;
    });
    console.log(body);
    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
