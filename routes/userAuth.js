const router = require("express").Router();
const User = require("../models/userModel");

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  User.findOne({ email: email }, function (err, foundUser) {
    if (!err) {
      if (foundUser && password == foundUser.password) {
        console.log("User Loggedin with email: " + foundUser.email);
        res.redirect("/user/dashboard/" + foundUser.email);
      } else {
        res.redirect("/signup");
      }
    }
  });
});

router.post("/signup", function (req, res) {
  console.log(req.body);
  const { name, email, password } = req.body;

  User.findOne({ email: email }, function (err, foundUser) {
    if (!err) {
      if (!foundUser) {
        const newUser = new User({
          name,
          email,
          password,
        });
        newUser
          .save()
          .then(() => {
            res.redirect("/login");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });
});
router.get("/dashboard/:user", (req, res) => {
  User.findOne({ email: req.params.user }, function (err, foundUser) {
    if (!err) {
      if (foundUser) {
        res.render("dashboard", {
          pageTitle: "User Dashboard",
          userName: foundUser.name,
          email: foundUser.email,
          orders: foundUser.products,
        });
      }
    }
  });
});

module.exports = router;
