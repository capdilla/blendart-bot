//@ts-check
require("dotenv").config();
const puppeteer = require("puppeteer");
const dowloadImages = require("./dowloadImages");

const email = process.env.EMAIL;
const pass = process.env.PASS;
const pageURL = process.env.PAGEURL;

class Publisher {
  constructor(styleTransfer) {
    this.page = null;

    this.styleTransfer = styleTransfer;
  }

  async init() {
    const { HIDE_BROWSER } = process.env;
    this.browser = await puppeteer.launch({
      headless: HIDE_BROWSER == "true", //false to show browser
      args: [
        "--start-maximized", // you can also use '--start-fullscreen'
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--proxy-server='direct://'",
        "--proxy-bypass-list=*",
      ],
      userDataDir: __dirname + "/cookies",
    });

    this.page = await this.browser.newPage();

    await this.page.goto(pageURL);
    await this.page.setViewport({ width: 1900, height: 1000 });

    await this.page.waitFor(2000);
  }

  async start() {
    await this.init();
    await this.makeLogin();

    await this.page.waitFor(1000);

    await this.readLastPost();

    await this.makePost();

    await this.page.waitFor(4000);

    await this.browser.close();
  }

  async makePost() {
    console.log("making post!!");

    (await this.page.waitForSelector("[name='xhpc_message']")).click();

    const modalName = "#feedx_sprouts_container";
    const modal = await this.page.waitForSelector(modalName);

    await modal.click();

    await this.page.waitFor(1000);

    await this.page.keyboard.type(
      "Hello World check this new image \n comment if you want to try it.",
      {
        delay: 300,
      }
    );

    const input = await modal.$("input[name='composer_photo[]']");

    //load photo
    await input.uploadFile(`${__dirname}/temp/out.png`);

    //click on publish button
    (await modal.$("button[type='submit']")).click();
  }

  async readLastPost() {
    //click on 'see more'

    (await this.page.$("a[ajaxify][rel='ajaxify']")).click();

    //find the comment tag
    const aTagComment = await this.page.waitForSelector(
      "span[data-hover='tooltip'] > a[role='button'][data-ft]"
    );

    const href = await (await aTagComment.getProperty("href")).jsonValue();

    const page2 = await this.browser.newPage();

    // @ts-ignore
    await page2.goto(href);

    const h6Parent = await (await page2.waitForSelector("h6")).$x("..");

    const ul = await h6Parent[0].$$("ul");
    const imgs = await ul[1].$$("img[class='img']");

    const urls = await Promise.all(
      imgs.map(async (img) => await (await img.getProperty("src")).jsonValue())
    );

    const imgsPath = await dowloadImages(urls);

    //Make the StyleTransfer with the dowloadaded images
    if (this.styleTransfer) {
      await this.styleTransfer(imgsPath);

      console.log("Style transfer Complete");
    }

    await page2.close();
  }

  async makeLogin() {
    try {
      const loginForm = await this.page.waitForSelector("#login_form", {
        timeout: 1000,
      });

      if (loginForm) {
        await this.setValToInput("#email", email, loginForm);
        await this.setValToInput("#pass", pass, loginForm);

        await loginForm.press("Enter");
      }
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {String} selector
   * @param {String} val
   * @param {import("puppeteer").ElementHandle} el
   */
  async setValToInput(selector, val, el) {
    let input = null;
    if (el) {
      input = await el.$(selector);
    } else {
      input = await this.page.$(selector);
    }

    await input.click({ clickCount: 3 }); //clean
    await input.type(val);
  }
}

// new Publisher().start();

module.exports = (styleTransfer) => new Publisher(styleTransfer).start();
