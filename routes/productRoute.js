const router = require("express").Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { sendMail } = require("../helper/mailer");
const { ensureAuthenticated } = require("../config/auth");
const { urlFormat } = require("../helper/urlFormatter");
const { webScrapeOrder, webScrapper } = require("../helper/scrapper");

// ADD ONLINE PRODUCT
router.post("/add/:email", ensureAuthenticated, function (req, res) {
  User.findOne({ email: req.params.email }, async function (err, foundUser) {
    if (!err) {
      const websiteNumber = parseInt(req.body.website);
      url = urlFormat(req.body.URL);
      console.log("Fetching details from " + url);
      let data = await webScrapper(url, websiteNumber);
      if (data != null) {
        if (data.price < req.body.userPrice) {
          console.log("Sending Mail to user : " + req.params.email);
          sendMail(req.params.email, data.title, url);
        }
        var newProduct = new Product({
          name: data.title,
          url: url,
          actualPrice: data.price,
          imageURL: data.image,
          expectedPrice: req.body.userPrice,
          website: websiteNumber,
        });
        foundUser.products.push(newProduct);
        foundUser.save().then((err, user) => {
          console.log(foundUser.email + " Added a product " + newProduct.name);
        });
      }
      res.redirect("/users/dashboard/" + req.params.email);
    }
  });
});

// DELETE ONLINE PRODUCT
router.post("/delete/:email", ensureAuthenticated, function (req, res) {
  productName = req.body.delete;
  userEmail = req.params.email;
  console.log(userEmail + " Deleted a Product " + productName);
  User.findOneAndUpdate(
    { email: userEmail },
    {
      $pull: {
        products: { name: productName },
      },
    },
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/users/dashboard/" + userEmail);
      }
    }
  );
});

module.exports = router;
