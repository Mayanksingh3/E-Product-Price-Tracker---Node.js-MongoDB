const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/user", require("./routes/userAuth"));
app.use("/product", require("./routes/productRoute"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_LOCAL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("MongoDB could not connect" + err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/pages/login.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/pages/signup.html");
});

app.use(function (req, res) {
  res.send("404");
});

app.listen(PORT, function () {
  console.log("Server is running on port 3000!!!");
});

// repeat();
