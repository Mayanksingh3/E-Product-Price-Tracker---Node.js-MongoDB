//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
var nodemailer = require('nodemailer');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/customerDB",{useNewUrlParser:true,useUnifiedTopology:true});

var defaultList = [];
var productTitle = ['#productTitle','._35KyD6'];
var productImage = ['#imgTagWrapperId > img','._1Nyybr'];
var productPrice = ['#priceblock_ourprice','.CEmiEU > div > div','#priceblock_dealprice','.CEmiEU > div > div'];

// const orderSchema = new mongoose.Schema({
//     productName:String,
//     url:String,
//     imageUrl:String,
//     price: Number,
//     expectedPrice:Number
// });





// Creating my new order schema.
const orderSchema = {
    emailID: String,
    URL: String,
    minPrice: Number
  };
  
// Creating the model for my userorders schema.
const Order = mongoose.model("userOrder", orderSchema);

// Rendering ejs file to localhost:3000 
app.get("/", function(req, res){
    res.render("orderList.ejs");
});


// Saving every object given as an input in the input form.
app.post("/", function(req, res){

    const addEmail = req.body.newEmail;
    const addUrl = req.body.newUrl;
    const price = req.body.priceLimit;

    const orderNew = new Order({
        emailID: addEmail,
        URL: addUrl,
        minPrice: price
    });

    orderNew.save();
    // res.send("Hello");
    res.redirect("/");
});





const customerSchema = new mongoose.Schema({
    name:String,
    _email:String,
    password:String,
    orders:[orderSchema]
});

const Customer = mongoose.model("Customer",customerSchema);
// const Order = mongoose.model("Order",orderSchema);


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

app.get("/signup",function (req, res){
    res.sendFile(__dirname+"/pages/signup.html")
});

app.get("/home",function(req,res){
    res.render("home",{pageTitle:"Welcome ! | E-Product Price Tracker"});
});

app.get("/about",function(req,res){
    res.render("about",{pageTitle:"About | E-Product Price Tracker"});
});

app.get("/contact",function(req,res){
    res.render("contact",{pageTitle:"Contact | E-Product Price Tracker"});
});

app.get("/team",function(req,res){
    res.render("team",{pageTitle:"Team | E-Product Price Tracker"});
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
    Customer.findOne({_email:req.params.user},async function(err,foundCustomer){
        if(!err){
            const optWebsite = parseInt(req.body.website);
            var url = req.body.URL.split("ref=")[0];
            url = url.split("?")[0];
            console.log(url);
            let data = await webScrapper(url,optWebsite);
            if(data != null){
                console.log(data);
                var newOrder = new Order({
                    productName: data.title,
                    url:url,
                    price:data.price,
                    imageUrl:data.image,
                    expectedPrice:req.body.userPrice
                });
                foundCustomer.orders.push(newOrder);
                foundCustomer.save();
            }
            //newOrder.save();
            res.redirect("/userdashboard/"+foundCustomer._email);
        }
    });
});

app.post("/delete/:user",function(req,res){
    productID = req.body.delete;
    userEmail = req.params.user;
    Customer.findOneAndUpdate({_email:userEmail},{$pull:{orders:{_id:productID}}},function(err,found){
        if(!err){
            res.redirect("/userdashboard/"+userEmail);
        }
    });
});


//Sending the mail.
// This function returns a transporter object.
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'priyamsrivastava9598@gmail.com',
      pass: 'Coding1@gla'
    }
  });
  
  var mailOptions = {
    from: 'priyamsrivastava9598@gmail.com',
    to: 'priyamsrivastava731@gmail.com',
    subject: 'Yuppy You It !!',
    text: `Hii `
  };
  
  // Function required to send the e-mail.
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
});





app.listen(3000, function(){
    console.log("Server is running on port 3000!!!");
});

async function webScrapper(url,optWebsite){
    try{
        const browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        await page.goto(url,{timeout:1200000,waitForSelector:productImage[optWebsite]});
        try{
            let data = await page.evaluate((optWebsite,productTitle,productImage,productPrice)=>{
                var title = document.querySelector(productTitle[optWebsite]).innerText;
                var image = document.querySelector(productImage[optWebsite]).src;
                var price;
                var subElement = optWebsite==0 ? 7 : 1;
                if(document.querySelector(productPrice[optWebsite]) != null){
                    price = parseFloat(document.querySelector(productPrice[optWebsite]).innerHTML.substring(subElement));
                }else{
                    price = parseFloat(document.querySelector(productPrice[optWebsite+2]).innerHTML,substring(subElement));
                }
                return{
                    title,
                    image,
                    price
                }
            }, optWebsite,productTitle,productImage,productPrice);
            return data;
        }catch(e){
            console.log(e);
            console.log("Error Happend ! Please check if you have opted the details correctly");
        }
        finally{
            browser.close();
        }
    }
    catch(e){
        console.log("Invalid URL Given");
    }
}