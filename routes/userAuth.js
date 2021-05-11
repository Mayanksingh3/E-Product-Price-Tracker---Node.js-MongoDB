const router = require("express").Router();
const User = require("../models/userModel");

router.get("/login", (req, res) => {
  res.sendFile(__dirname + "/pages/login.html");
});

router.post("/login", (req, res) => {
  userEmail = req.body.email;
  userPassword = req.body.password;
  User.findOne({ _email: userEmail }, function (err, foundCustomer) {
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
router.post("/signup", function (req, res) {
  console.log(req.body);
  const email = req.body.email;
  User.findOne({ _email: email }, function (err, foundCustomer) {
    if (!err) {
      if (!foundCustomer) {
        const newCustomer = new User({
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

module.exports = router;
