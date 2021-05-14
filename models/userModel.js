const mongoose = require("mongoose");
const Product = require("./productModel");

const userSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  products: {
    type: Array,
    default: [Product],
  },
});

module.exports = new mongoose.model("user", userSchema);
