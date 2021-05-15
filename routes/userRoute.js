const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.post("/signup", function (req, res) {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all the fields!" });
  }
  if (password != password2) {
    errors.push({ msg: "Passwords do not match!" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password must be greater than 6 characters!" });
  }
  if (errors.length == 0) {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email Already Registered" });
        res.render("register", { errors });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        bcrypt.genSalt(10, (err, salt) => {
          if (!err) {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              newUser.password = hash;
              newUser.save().then(() => {
                res.redirect("/users/login");
              });
            });
          }
        });
      }
    });
  } else {
    res.render("register", { errors });
  }
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }, function (err, foundUser) {
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
