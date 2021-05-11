const router = require("express").Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");

app.post("/item/:user", function (req, res) {
  User.findOne(
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
  User.findOneAndUpdate(
    { _email: userEmail },
    { $pull: { orders: { _id: productID } } },
    function (err, found) {
      if (!err) {
        res.redirect("/userdashboard/" + userEmail);
      }
    }
  );
});

module.exports = router;
