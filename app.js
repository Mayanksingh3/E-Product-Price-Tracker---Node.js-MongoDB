const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
// const expressLayouts = require("express-ejs-layouts");
const app = express();
const mongoose = require("mongoose");

require("dotenv").config();
require("./config/passport")(passport);
require("./helper/midnightUpdater");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// app.use(expressLayouts);
app.use(
  session({
    secret: "this is a long format string!!!",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//MongoDB Connect
mongoose
  .connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("MongoDB could not connect " + err));

//Static Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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

//Routes
app.use("/users", require("./routes/userRoute"));
app.use("/product", require("./routes/productRoute"));

app.use(function (req, res) {
  res.sendFile(__dirname + "/pages/notFound.html");
});

//Server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server is running on port " + port + "!!!");
});
