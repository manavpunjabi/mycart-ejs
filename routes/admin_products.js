const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

// get product and category model
const Product = require("../models/products");
const Category = require("../models/category");

// default route is /admin/products

// get products index
router.get("/", (req, res) => {
  let count;
  Product.count((err, c) => {
    count = c;
  });
  Product.find((err, products) => {
    res.render("admin/products", {
      products: products,
      count: count
    });
  });
});

// get add product page
router.get("/add-product", (req, res) => {
  const title = "";
  const desc = "";
  const price = "";

  Category.find((err, categories) => {
    res.render("admin/add_product", {
      title: title,
      desc: desc,
      categories: categories,
      price: price
    });
  });
});

// post add product
router.post("/add-product", (req, res) => {
  let imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";
  // let imageFile = req.files;

  req.checkBody("title", "Title must have value").notEmpty();
  req.checkBody("desc", "Description must have value").notEmpty();
  req.checkBody("price", "Price must have value").notEmpty();
  req
    .checkBody("image", "Only JPG and PNG images are allowed")
    .isImage(imageFile);

  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  let price = req.body.price;
  let desc = req.body.desc;
  let category = req.body.category;

  let errors = req.validationErrors();

  if (errors) {
    console.log("errors in validation");
    Category.find((err, categories) => {
      res.render("admin/add_product", {
        errors: errors,
        title: title,
        desc: desc,
        categories: categories,
        price: price
      });
    });
  } else {
    Product.findOne({ slug: slug }, (err, product) => {
      if (product) {
        req.flash("danger", "Product title exists, choose another");
        Category.find((err, categories) => {
          res.render("admin/add_product", {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          });
        });
      } else {
        let price2 = parseInt(price);
        let product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile
        });
        product.save(err => {
          if (err) {
            return console.log(err);
          }
          // creating folders
          mkdirp("public/product_images/" + product._id, err => {
            return console.log(err);
          });
          mkdirp("public/product_images/" + product._id + "/gallery", err => {
            return console.log(err);
          });
          mkdirp(
            "public/product_images/" + product._id + "/gallery/thumbs",
            err => {
              return console.log(err);
            }
          );

          if (imageFile != "") {
            let productImage = req.files.image;
            let path = "public/product_images/" + product._id + "/" + imageFile;
            //console.log("PATHHHHHH" + path);

            // save
            productImage.mv(path, err => {
              return console.log(err);
            });
          }

          req.flash("success", "Product added");
          res.redirect("/admin/products");
        });
      }
    });
  }
});

// get edit page
router.get("/edit-product/:id", (req, res) => {
  var errors;
  if (req.session.errors) {
    errors = req.session.errors;
  }
  req.session.errors = null;

  Category.find((err, categories) => {
    Product.findById(req.params.id, (err, p) => {
      if (err) {
        console.log(err);
        res.redirect("/admin/products");
      } else {
        let galleryDir = "public/product_images/" + p._id + "/gallery";
        let galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render("admin/edit_product", {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, "-").toLowerCase(),
              price: parseInt(p.price),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id
            });
          }
        });
      }
    });
  });
});

// post edit page
router.post("/edit-page/:id", (req, res) => {
  req.checkBody("title", "Title must have value").notEmpty();
  req.checkBody("content", "Content must have value").notEmpty();

  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  // making title the slug if slug is empty as its not set to REQUIRED
  if (slug == "") {
    slug = title.replace(/\s+/g, "-").toLowerCase();
  }
  let content = req.body.content;
  let id = req.params.id;

  let errors = req.validationErrors();
  if (errors) {
    console.log("errors in validation");
    res.render("admin/edit_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exists, choose another");
        res.render("admin/edit_page", {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, (err, page) => {
          if (err) {
            return console.log(err);
          }
          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save(err => {
            if (err) {
              return console.log(err);
            }
            req.flash("success", "Page edited");
            res.redirect("/admin/pages/edit-page/" + id);
          });
        });
      }
    });
  }
});

//get delete page
router.get("/delete-page/:id", (req, res) => {
  Page.findByIdAndRemove(req.params.id, err => {
    if (err) {
      return console.log(err);
    }
    req.flash("success", "Page deleted");
    res.redirect("/admin/pages/");
  });
});

module.exports = router;
