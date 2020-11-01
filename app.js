//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27107/customerDB");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/",(req, res) => {
    res.sendFile(__dirname+"/index.html");
});

app.get("/login",function(req, res){
    res.sendFile(__dirname+"/pages/login.html");
});

app.post("/login",(req,res) => {
    res.render("dashboard")
});

app.get("/signup",function (req, res){
    res.sendFile(__dirname+"/pages/signup.html")
});

app.listen(3000, function(){
    console.log("Server is running on port 3000!!!");
});