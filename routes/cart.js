const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const User = require("../models/user");
const nodemailer = require("nodemailer");

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
        image: "/product_images/" + p._id + "/" + p.image
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
          image: "/product_images/" + p._id + "/" + p.image
        });
      }
    }
    //console.log(req.session.cart);
    req.flash("success", "Product added to cart");
    res.redirect("back");
  });
});

// get checkout page

router.get("/checkout", (req, res) => {
  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect("/cart/checkout");
  } else {
    res.render("checkout", {
      title: "mycart - Checkout",
      cart: req.session.cart
    });
  }
});

// add delete and clear buttons (/update/product)

router.get("/update/:product", (req, res) => {
  let slug = req.params.product;
  let cart = req.session.cart;
  let action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) {
            cart.splice(i, 1);
          }
          break;

        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) {
            delete req.session.cart;
          }
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }
  req.flash("success", "Cart updated");
  res.redirect("/cart/checkout");
});

// get clear cart

router.get("/clear", (req, res) => {
  delete req.session.cart;
  req.flash("success", "Cart cleared");
  res.redirect("/cart/checkout");
});

// get place order

router.get("/buynow", (req, res) => {
  //res.sendStatus(200);
  delete req.session.cart;
  let userEmail = res.locals.user.email;
  const output = `
  <h1>Hi, ${res.locals.user.name}</h1>
  <h3>Thank you for choosing mycart</h3>
  <h2>Your order is confirmed</h2>
  
  <h2>Order Details:</h2>
  `;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "manavtestemail@gmail.com", // generated ethereal user
      pass: "manavpunjabi" // generated ethereal password
    }
  });
  // send mail with defined transport object
  let info = transporter.sendMail({
    from: '"mycart" <manavtestemail@gmail.com>', // sender address
    to: `manavpunjabi26@gmail.com,${userEmail}`, // list of receivers
    subject: "Order Confirmation - mycart", // Subject line
    text: "Hello world?", // plain text body
    html: output // html body
  });

  //console.log("Message sent: %s", info.messageId);

  //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  //main().catch(console.error);

  //

  res.render("orderplaced", {
    title: "mycart - Order Confirmed"
  });
});

module.exports = router;
