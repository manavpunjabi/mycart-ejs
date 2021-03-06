const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Category = require("../models/category");
const fs = require("fs-extra");

// get all products
router.get("/products", (req, res) => {
  Product.find((err, products) => {
    if (err) {
      console.log(err);
    }

    res.render("all_products", {
      title: "mycart - All Products",
      products: products
    });
  });
});

// get product by category

router.get("/:category", (req, res) => {
  let categorySlug = req.params.category;
  Category.findOne({ slug: categorySlug }, (err, c) => {
    Product.find({ category: categorySlug }, (err, products) => {
      if (err) {
        console.log(err);
      }

      res.render("cat_products", {
        title: "mycart - " + c.title,
        products: products
      });
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
