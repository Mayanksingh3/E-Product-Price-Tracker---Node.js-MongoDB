//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

var items = [];
var pass = [];
var names = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
    res.render('newItems', 
    {users : items, hisPass:pass, personName:names});
});


//Pass data from our webpage to our server(laptop).
app.post("/", function(req, res){
    var item =  req.body.newItem;
    var password = req.body.newPassword;
    var userName = req.body.newName;
    items.push(item);
    pass.push(password);
    names.push(userName);

    res.redirect("/");
});


app.listen(3000, function(){
    console.log("Server is running on port 3000!!!");
});