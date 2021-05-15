const router = require("express").Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { sendMail } = require("../helper/mailer");
const { ensureAuthenticated } = require("../config/auth");
const { webScrapeOrder, webScrapper } = require("../helper/scrapper");

router.post("/", function (req, res) {
  User.findOne(
    { email: req.user.email },
    ensureAuthenticated,
    async function (err, foundUser) {
      if (!err) {
        const optWebsite = parseInt(req.body.website);
        var url = req.body.URL.split("ref=")[0];
        url = url.split("?")[0];
        console.log("Fetching details from " + url);
        let data = await webScrapper(url, optWebsite);
        if (data != null) {
          console.log(data);
          if (data.price < req.body.userPrice) {
            console.log("Sending Mail to user : " + req.params.user);
            sendMail(req.params.user, data.title, url);
          }
          var newProduct = new Product({
            name: data.title,
            url: url,
            actualPrice: data.price,
            imageURL: data.image,
            expectedPrice: req.body.userPrice,
            website: optWebsite,
          });
          foundUser.products.push(newProduct);
          foundUser.save().then((err, user) => {
            console.log(
              foundUser.email + " Added a product " + newProduct.name
            );
          });
        }
        res.redirect("/users/dashboard");
      }
    }
  );
});

router.post("/delete/:user", ensureAuthenticated, function (req, res) {
  productName = req.body.delete;
  userEmail = req.user.email;
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
        res.redirect("/users/dashboard");
      }
    }
  );
});

module.exports = router;
