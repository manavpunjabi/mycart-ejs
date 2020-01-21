const express = require("express");
const router = express.Router();
const Product = require("../models/products");

// get product to cart
router.get("/add/:product", (req, res) => {
  const slug = req.params.product;
  Product.findOne({ slug: slug }, (err, p) => {
    if (err) {
      console.log(err);
    }
    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseInt(p.price),
        image: "/product_images" + p._id + "/" + p.image
      });
    } else {
      let cart = req.session.cart;
      let newItem = true;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }
      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseInt(p.price),
          image: "/product_images" + p._id + "/" + p.image
        });
      }
    }
    console.log(req.session.cart);
    req.flash("success", "Product added to cart");
    res.redirect("back");
  });
});

module.exports = router;
