const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  url: {
    required: true,
    type: String,
  },
  imageURL: {
    default: "",
    type: String,
  },
  actualPrice: {
    type: String,
    required: true,
  },
  expectedPrice: {
    type: String,
    required: true,
  },
  website: {
    required: true,
    type: Number,
  },
});

module.exports = new mongoose.model("product", productSchema);
