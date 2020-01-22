const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcryptjs");

// get register
router.get("/register", (req, res) => {
  res.render("register", {
    title: "mycart - Sign Up"
  });
});

//get a page

router.get("/:slug", (req, res) => {
  let slug = req.params.slug;
  Page.findOne({ slug: slug }, (err, page) => {
    if (err) {
      console.log(err);
    }
    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content
      });
    }
  });
});

module.exports = router;
