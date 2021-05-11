//jshint esversion:6

// Importing All the necessory modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGODB_LOCAL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("MongoDB could not connect" + err));

var defaultList = [];
var productTitle = ["#productTitle", ".B_NuCI"];
var productImage = ["#imgTagWrapperId > img", "._396cs4"];
var productPrice = [
  "#priceblock_ourprice",
  ".CEmiEU > div > div",
  "#priceblock_dealprice",
  ".CEmiEU > div > div",
];

//Order Schema
const orderSchema = new mongoose.Schema({
  productName: String,
  url: String,
  imageUrl: String,
  price: Number,
  expectedPrice: Number,
  optWebsite: Number,
});
//CustomerSchema
const customerSchema = new mongoose.Schema({
  name: String,
  _email: String,
  password: String,
  orders: [orderSchema],
});

//Model of the schema
const Customer = mongoose.model("Customer", customerSchema);
const Order = mongoose.model("Order", orderSchema);

// Get Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/pages/login.html");
});
app.get("/userdashboard/:user", (req, res) => {
  Customer.findOne({ _email: req.params.user }, function (err, foundCustomer) {
    if (!err) {
      if (foundCustomer) {
        res.render("dashboard", {
          pageTitle: "User Dashboard",
          userName: foundCustomer.name,
          email: foundCustomer._email,
          orders: foundCustomer.orders,
        });
      }
    }
  });
});
app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/pages/signup.html");
});
app.get("/home", function (req, res) {
  res.render("home", { pageTitle: "Welcome ! | E-Product Price Tracker" });
});
app.get("/about", function (req, res) {
  res.render("about", { pageTitle: "About | E-Product Price Tracker" });
});
app.get("/contact", function (req, res) {
  res.render("contact", { pageTitle: "Contact | E-Product Price Tracker" });
});
app.get("/team", function (req, res) {
  res.render("team", { pageTitle: "Team | E-Product Price Tracker" });
});

// Post Routes
app.post("/login", (req, res) => {
  userEmail = req.body.email;
  userPassword = req.body.password;
  Customer.findOne({ _email: userEmail }, function (err, foundCustomer) {
    if (!err) {
      if (foundCustomer) {
        if (userPassword == foundCustomer.password) {
          res.redirect("userdashboard/" + foundCustomer._email);
        } else {
          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    }
  });
});

app.post("/signup", function (req, res) {
  console.log(req.body);
  const email = req.body.email;
  Customer.findOne({ _email: email }, function (err, foundCustomer) {
    if (!err) {
      if (!foundCustomer) {
        const newCustomer = new Customer({
          name: req.body.name,
          _email: req.body.email,
          password: req.body.password,
          orders: defaultList,
        });
        newCustomer.save(function (err) {
          if (!err) {
            res.redirect("/login");
          }
        });
      } else {
        res.redirect("/login");
      }
    }
  });
});

app.post("/item/:user", function (req, res) {
  Customer.findOne(
    { _email: req.params.user },
    async function (err, foundCustomer) {
      if (!err) {
        const optWebsite = parseInt(req.body.website);
        var url = req.body.URL.split("ref=")[0];
        url = url.split("?")[0];
        console.log(url);
        let data = await webScrapper(url, optWebsite);
        if (data != null) {
          console.log(data);
          if (data.price < req.body.userPrice) {
            sendMail(req.params.user, data.title, url);
          }
          var newOrder = new Order({
            productName: data.title,
            url: url,
            price: data.price,
            imageUrl: data.image,
            expectedPrice: req.body.userPrice,
            optWebsite: optWebsite,
          });
          foundCustomer.orders.push(newOrder);
          foundCustomer.save();
        }
        res.redirect("/userdashboard/" + foundCustomer._email);
      }
    }
  );
});

app.post("/delete/:user", function (req, res) {
  productID = req.body.delete;
  userEmail = req.params.user;
  Customer.findOneAndUpdate(
    { _email: userEmail },
    { $pull: { orders: { _id: productID } } },
    function (err, found) {
      if (!err) {
        res.redirect("/userdashboard/" + userEmail);
      }
    }
  );
});

// Server Port
app.listen(3000, function () {
  console.log("Server is running on port 3000!!!");
});

// Mailing Code
function sendMail(userMail, titleGiven, urlGiven) {
  console.log("Sending Mail to " + userMail);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email, // Your Email Address
      pass: process.env.password, // Your Password
    },
  });

  var mailOptions = {
    from: process.env.email,
    to: userMail,
    subject: "Buy Now Its Cheaper !!",
    text:
      `Hi,\n\n` +
      titleGiven +
      " is now cheaper \n\nBUY NOW !!!!\n\n" +
      urlGiven,
  };

  // Function required to send the e-mail.
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
}

// Midnight Update Price Code
repeat();
function repeat() {
  var date = new Date();
  // date.setHours(00);
  // console.log(date.getHours());
  if (date.getHours() == 0) {
    console.log("Updating the price List ...");
    updatePrice();
  }
  setInterval(repeat, 3600000);
}
function updatePrice() {
  Customer.find(function (err, found) {
    if (!err) {
      found.forEach(async (element) => {
        console.log(element.name);
        await element.orders.forEach(async (order) => {
          var currPrice = await webScrapeOrder(order.url, order.optWebsite);
          Customer.findOneAndUpdate(
            { _email: element._email },
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
            Customer.updateOne(
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
}

// WebScrapprer Functions
async function webScrapeOrder(url, optWebsite) {
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
}
async function webScrapper(url, optWebsite) {
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
          var title = document.querySelector(productTitle[optWebsite])
            .innerText;
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
}
