const { webScrapeOrder } = require("../helper/scrapper");
const User = require("../models/userModel");

function repeat() {
  var date = new Date();
  date.setHours(00);
  console.log(date.getHours());
  if (date.getHours() == 0) {
    console.log("Updating the price List Now!!");
    updatePrice2();
  } else {
    console.log("Not Updating right Now!! " + date.getHours());
  }
  setInterval(repeat, 3600000);
}

repeat();

function updatePrice2() {
  User.find(async function (err, found) {
    if (!err && found) {
      for (let i = 0; i < found.length; i++) {
        var user = found[i];
        console.log(user.name);
        for (let j = 0; j < user.products.length; j++) {
          var prod = user.products[j];
          console.log(prod.name);
          var currPrice = await webScrapeOrder(prod.url, prod.website);
          User.findOneAndUpdate(
            { email: user.email },
            {
              $set: {
                products: {
                  _id: prod._id,
                  actualPrice: currPrice.price,
                  name: prod.name,
                  url: prod.url,
                  imageURL: prod.imageURL,
                  expectedPrice: prod.expectedPrice,
                  website: prod.website,
                },
              },
            }
          ).then(() => {
            console.log("Updated Price Successfully ! ");
          });
          if (currPrice.price < prod.expectedPrice) {
            console.log(
              "Cheaper : Current Price " +
                currPrice.price +
                " User Expected Price " +
                order.expectedPrice
            );
            sendMail(user.email, prod.name, prod.url);
          } else {
            console.log(
              "Expensive : Current Price " +
                currPrice.price +
                " User Expected Price " +
                prod.expectedPrice
            );
          }
        }
      }
    }
  });
}

// function updatePrice() {
//   User.find(async function (err, found) {
//     if (!err && found) {
//       await found.forEach(async (element) => {
//         console.log(element.name);
//         await element.products.forEach(async (order) => {
//           var currPrice = await webScrapeOrder(order.url, order.websiteNumber);
//           User.findOneAndUpdate(
//             { email: element.email },
//             {
//               $set: {
//                 orders: {
//                   _id: order._id,
//                   price: currPrice.price,
//                   productName: order.productName,
//                   url: order.url,
//                   imageUrl: order.imageUrl,
//                   expectedPrice: order.expectedPrice,
//                   websiteNumber: order.websiteNumber,
//                 },
//               },
//             }
//           ).then(() => {
//             console.log("Updated Price Successfully ! ");
//           });
//           if (currPrice.price <= order.expectedPrice) {
//             console.log(
//               "Cheaper : Current Price " +
//                 currPrice.price +
//                 " User Expected Price " +
//                 order.expectedPrice
//             );
//             User.updateOne(
//               { _email: element._email },
//               { $set: { "order.price": currPrice.price } }
//             );
//             sendMail(element._email, order.title, order.url);
//           } else {
//             console.log(
//               "Expensive : Current Price " +
//                 currPrice.price +
//                 " User Expected Price " +
//                 order.expectedPrice
//             );
//           }
//         });
//       });
//     }
//   });
// }
