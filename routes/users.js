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

// post register
router.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  req.checkBody("name", "Name is mandatory").notEmpty();
  req.checkBody("email", "Email is mandatory").isEmail();
  req.checkBody("username", "Username is mandatory").notEmpty();
  req.checkBody("password", "Password is mandatory").notEmpty();
  req.checkBody("password2", "Passwords do not match").equals(password);

  let errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors,
      title: "mycart - Sign Up"
    });
  } else {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        console.log(err);
      }
      if (user) {
        req.flash("danger", "Username exists");
        res.redirect("/users/register");
      } else {
        let user = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          // put 1 to make admins
          admin: 0
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
              console.log(err);
            }
            user.password = hash;
            user.save(err => {
              if (err) {
                console.log(err);
              } else {
                req.flash("success", "Sign up successful");
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

// get login
router.get("/login", (req, res) => {
  if (res.locals.user) {
    res.redirect("/");
  }
  res.render("login", {
    title: "mycart - Login"
  });
});

module.exports = router;