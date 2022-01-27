const puppeteer = require("puppeteer");
var productTitle = ["#productTitle", ".B_NuCI"];
var productImage = ["#imgTagWrapperId > img", "._396cs4"];
var productPrice = [
  ".a-price span",
  ".CEmiEU > div > div",
  ".a-price span",
  ".CEmiEU > div > div",
];

// WebScrapprer Functions for updation of products
exports.webScrapeOrder = async function (url, websiteNumber) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 1200000,
      waitForSelector: productTitle[websiteNumber],
    });
    try {
      let data = await page.evaluate(
        (websiteNumber, productPrice) => {
          var price;
          // var subElement = websiteNumber == 0 ? 7 : 1;
          var subElement = 1;
          if (document.querySelector(productPrice[websiteNumber]) != null) {
            price = parseFloat(
              document
                .querySelector(productPrice[websiteNumber])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else if (
            document.querySelector(productPrice[websiteNumber + 2]) != null
          ) {
            price = parseFloat(
              document
                .querySelector(productPrice[websiteNumber + 2])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else {
            price = Number.MAX_VALUE;
          }
          return {
            price,
          };
        },
        websiteNumber,
        productPrice
      );
      return data;
    } catch (e) {
      console.log(e);
      console.log(
        "Error Happend ! Please check if you have opted the details correctly"
      );
    } finally {
      // page.close();
      browser.close();
    }
  } catch (e) {
    console.log("Invalid  URL Given");
  }
};

// Webscrapper function for fetching the product first time
exports.webScrapper = async function (url, websiteNumber) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 1200000,
      waitForSelector: productImage[websiteNumber],
    });
    try {
      let data = await page.evaluate(
        (websiteNumber, productTitle, productImage, productPrice) => {
          var title = document.querySelector(
            productTitle[websiteNumber]
          ).innerText;
          var image = document.querySelector(productImage[websiteNumber]).src;
          var price;
          // var subElement = websiteNumber == 0 ? 7 : 1;
          var subElement = 1;
          console.log(subElement);
          if (document.querySelector(productPrice[websiteNumber]) != null) {
            price = parseFloat(
              document
                .querySelector(productPrice[websiteNumber])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else if (
            document.querySelector(productPrice[websiteNumber + 2]) != null
          ) {
            price = parseFloat(
              document
                .querySelector(productPrice[websiteNumber + 2])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else {
            price = Number.MAX_VALUE;
          }
          return {
            title,
            image,
            price,
          };
        },
        websiteNumber,
        productTitle,
        productImage,
        productPrice
      );
      return data;
    } catch (e) {
      console.log(e);
      console.log(
        "Error Happend ! Please check if you have opted the details correctly"
      );
    } finally {
      // page.close();
      browser.close();
    }
  } finally {
    console.log("Invalid URL Given");
  }
};
