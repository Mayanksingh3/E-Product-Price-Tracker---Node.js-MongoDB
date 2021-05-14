const router = require("express").Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { webScrapeOrder, webScrapper } = require("../helper/scrapper");

router.post("/:user", function (req, res) {
  User.findOne({ email: req.params.user }, async function (err, foundUser) {
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
        var newProduct = new Product({
          name: data.title,
          url: url,
          actualPrice: data.price,
          imageURL: data.image,
          expectedPrice: req.body.userPrice,
          website: optWebsite,
        });
        foundUser.products.push(newProduct);
        foundUser.save();
      }
      res.redirect("/user/dashboard/" + foundUser.email);
    }
  });
});

router.post("/delete/:user", function (req, res) {
  productID = req.body.delete;
  userEmail = req.params.user;
  console.log("User " + userEmail + " is deleting a product " + productID);
  User.findOneAndUpdate(
    { email: userEmail },
    {
      $pull: {
        products: { name: productID },
      },
    },
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        console.log(user);
        res.redirect("/user/dashboard/" + userEmail);
      }
    }
  );
});

module.exports = router;
