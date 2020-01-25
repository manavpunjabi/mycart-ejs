const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const fs = require("fs-extra");
const Order = require("../models/order");

router.get("/orders", (req, res) => {
  let username = res.locals.user.username;

  Order.find({ username: username }, (err, orders) => {
    if (err) {
      console.log(err);
    }
    res.render("all_orders", {
      title: "mycart - All Orders",
      orders: orders
    });
  });
});

// get individual product details

router.get("/:category/:product", (req, res) => {
  let galleryImages = null;
  // passport exists
  let loggedIn = req.isAuthenticated() ? true : false;
  Product.findOne({ slug: req.params.product }, (err, product) => {
    if (err) {
      console.log(err);
    } else {
      let galleryDir = "public/product_images/" + product._id + "/gallery";
      fs.readdir(galleryDir, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;
          res.render("product", {
            title: product.title,
            p: product,
            galleryImages: galleryImages,
            loggedIn: loggedIn
          });
        }
      });
    }
  });
});

module.exports = router;
