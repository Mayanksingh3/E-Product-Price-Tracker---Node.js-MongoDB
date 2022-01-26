const nodemailer = require("nodemailer");

exports.sendMail = function (userMail, titleGiven, urlGiven) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  var mailOptions = {
    from: process.env.email,
    to: userMail,
    subject: "Buy Now Its Cheaper !!",
    text:
      `Hi user,\n\n` +
      titleGiven +
      " is now cheaper and under your expected range. \n\nBUY NOW !!!!\n\n" +
      urlGiven +
      "\nFrom,\nProduct Ping",
  };

  // Function required to send the e-mail.
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
};
