const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    required: true,
    tyre: String,
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
    default: [],
  },
});

module.exports = new mongoose.model("user", userSchema);
