const mongoose = require("mongoose");

// Page Schema
const OrderSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  qty: {
    type: Number,
    required: true
  }
});

const Order = (module.exports = mongoose.model("Order", OrderSchema));
