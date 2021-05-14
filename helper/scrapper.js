const User = require("../models/userModel");
const puppeteer = require("puppeteer");
const sendMail = require("./mailer");

var productTitle = ["#productTitle", ".B_NuCI"];
var productImage = ["#imgTagWrapperId > img", "._396cs4"];
var productPrice = [
  "#priceblock_ourprice",
  ".CEmiEU > div > div",
  "#priceblock_dealprice",
  ".CEmiEU > div > div",
];

exports.updatePrice = function () {
  User.find(function (err, found) {
    if (!err) {
      found.forEach(async (element) => {
        console.log(element.name);
        await element.orders.forEach(async (order) => {
          var currPrice = await webScrapeOrder(order.url, order.optWebsite);
          User.findOneAndUpdate(
            { email: element.email },
            {
              $set: {
                orders: {
                  _id: order._id,
                  price: currPrice.price,
                  productName: order.productName,
                  url: order.url,
                  imageUrl: order.imageUrl,
                  expectedPrice: order.expectedPrice,
                  optWebsite: order.optWebsite,
                },
              },
            }
          ).then(() => {
            console.log("Updated Price Successfully ! ");
          });
          if (currPrice.price <= order.expectedPrice) {
            console.log(
              "Cheaper : Current Price " +
                currPrice.price +
                " User Expected Price " +
                order.expectedPrice
            );
            User.updateOne(
              { _email: element._email },
              { $set: { "order.price": currPrice.price } }
            );
            sendMail(element._email, order.title, order.url);
          } else {
            console.log(
              "Expensive : Current Price " +
                currPrice.price +
                " User Expected Price " +
                order.expectedPrice
            );
          }
        });
      });
    }
  });
};

// WebScrapprer Functions
exports.webScrapeOrder = async function (url, optWebsite) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 1200000,
      waitForSelector: productTitle[optWebsite],
    });
    try {
      let data = await page.evaluate(
        (optWebsite, productPrice) => {
          var price;
          var subElement = optWebsite == 0 ? 7 : 1;
          if (document.querySelector(productPrice[optWebsite]) != null) {
            price = parseFloat(
              document
                .querySelector(productPrice[optWebsite])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else {
            price = parseFloat(
              document
                .querySelector(productPrice[optWebsite + 2])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          }
          return {
            price,
          };
        },
        optWebsite,
        productPrice
      );
      return data;
    } catch (e) {
      console.log(e);
      console.log(
        "Error Happend ! Please check if you have opted the details correctly"
      );
    } finally {
      browser.close();
      console.log("webScrapeOrder() finished");
    }
  } catch (e) {
    console.log("Invalid URL Given");
  }
};
exports.webScrapper = async function (url, optWebsite) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 1200000,
      waitForSelector: productImage[optWebsite],
    });
    try {
      let data = await page.evaluate(
        (optWebsite, productTitle, productImage, productPrice) => {
          var title = document.querySelector(
            productTitle[optWebsite]
          ).innerText;
          var image = document.querySelector(productImage[optWebsite]).src;
          var price;
          var subElement = optWebsite == 0 ? 7 : 1;
          if (document.querySelector(productPrice[optWebsite]) != null) {
            price = parseFloat(
              document
                .querySelector(productPrice[optWebsite])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          } else {
            price = parseFloat(
              document
                .querySelector(productPrice[optWebsite + 2])
                .innerHTML.substring(subElement)
                .replaceAll(",", "")
            );
          }
          return {
            title,
            image,
            price,
          };
        },
        optWebsite,
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
      browser.close();
    }
  } catch (e) {
    console.log("Invalid URL Given");
  }
};
