//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/customerDB",{useNewUrlParser:true,useUnifiedTopology:true});

var defaultList = [];

const orderSchema = new mongoose.Schema({
    productName:String,
    price: Number,
    expectedPrice:Number
});
const customerSchema = new mongoose.Schema({
    name:String,
    _email:String,
    password:String,
    orders:[orderSchema]
});

const Customer = mongoose.model("Customer",customerSchema);
const Order = mongoose.model("Order",orderSchema);


app.get("/",(req, res) => {
    res.sendFile(__dirname+"/index.html");
});

app.get("/login",function(req, res){
    res.sendFile(__dirname+"/pages/login.html");
});

app.get("/userdashboard/:user",(req,res) => {
    Customer.findOne({_email:req.params.user},function(err,foundCustomer){
        if(!err){
            if(foundCustomer){
                res.render("dashboard",{pageTitle:"User Dashboard",userName:foundCustomer.name,email:foundCustomer._email,orders:foundCustomer.orders});
            }
        }
    });
});

app.post("/login",(req,res) => {
    userEmail = req.body.email;
    userPassword = req.body.password;
    Customer.findOne({_email:userEmail},function(err,foundCustomer){
        if(!err){
            if(foundCustomer){
                if(userPassword == foundCustomer.password){
                    res.redirect("userdashboard/"+foundCustomer._email);
                }else{
                    res.redirect("/login");
                }
            }else{
                res.redirect("/login")
            }
        }
    });
    
});



app.get("/signup",function (req, res){
    res.sendFile(__dirname+"/pages/signup.html")
});

app.post("/signup",function(req,res){
    console.log(req.body);
    const email =req.body.email;
    Customer.findOne({_email:email},function(err,foundCustomer){
        if(!err){
            if(!foundCustomer){
                const newCustomer = new Customer({
                    name:req.body.name,
                    _email:req.body.email,
                    password:req.body.password,
                    orders:defaultList
                });
                newCustomer.save(function(err){
                    if(!err){
                        res.redirect("/login");
                    }
                });
            }else{
                res.redirect("/login");
            }
        }
    });
})

app.post("/item/:user",function(req,res){
    Customer.findOne({_email:req.params.user},function(err,foundCustomer){
        if(!err){
            var newOrder = new Order({
                productName:"Trimmer PHILIPPS-2",
                price:200,
                expectedPrice:180
            });
            foundCustomer.orders.push(newOrder);
            foundCustomer.save();
            newOrder.save();
            res.redirect("/userdashboard/"+foundCustomer._email);
        }
    });
});

app.listen(3000, function(){
    console.log("Server is running on port 3000!!!");
});