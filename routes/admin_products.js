const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;

// get product and category model
const Product = require("../models/products");
const Category = require("../models/category");

// default route is /admin/products

// get products index
router.get("/", isAdmin, (req, res) => {
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
router.get("/add-product", isAdmin, (req, res) => {
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
            //return console.log("1" + err);
          });
          mkdirp("public/product_images/" + product._id + "/gallery", err => {
            // return console.log("2" + err);
          });
          mkdirp(
            "public/product_images/" + product._id + "/gallery/thumbs",
            err => {
              // return console.log("3" + err);
            }
          );

          if (imageFile != "") {
            let productImage = req.files.image;
            let path = "public/product_images/" + product._id + "/" + imageFile;
            //console.log("PATHHHHHH" + path);

            // save
            productImage.mv(path, err => {
              return console.log("4" + err);
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
router.get("/edit-product/:id", isAdmin, (req, res) => {
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

// post edit product
router.post("/edit-product/:id", (req, res) => {
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
  let pimage = req.body.pimage;
  let id = req.params.id;

  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/products/edit-product/" + id);
  } else {
    Product.findOne({ slug: slug, _id: { $ne: id } }, (err, p) => {
      if (err) {
        return console.log(err);
      }
      if (p) {
        req.flash("danger", "Product title exists, choose another");
        res.redirect("/admin/products/edit-product/" + id);
      } else {
        Product.findById(id, (err, p) => {
          if (err) {
            return console.log(err);
          }
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          p.price = parseInt(price);
          p.category = category;
          if (imageFile !== "") {
            p.image = imageFile;
          }
          p.save(err => {
            if (err) {
              console.log(err);
            }
            if (imageFile !== "") {
              if (pimage !== "") {
                fs.remove("public/product_images/" + id + "/" + pimage, err => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
              let productImage = req.files.image;
              let path = "public/product_images/" + id + "/" + imageFile;

              // save
              productImage.mv(path, err => {
                return console.log(err);
              });
            }
            req.flash("success", "Product edited");
            res.redirect("/admin/products/edit-product/" + id);
          });
        });
      }
    });
  }
});

//post product gallery
router.post("/product-gallery/:id", (req, res) => {
  let productImage = req.files.file;
  let id = req.params.id;
  let path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
  let thumbsPath =
    "public/product_images/" + id + "/gallery/thumbs/" + req.files.file.name;

  productImage.mv(path, err => {
    if (err) {
      console.log(err);
    }
    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(buf => {
      fs.writeFileSync(thumbsPath, buf);
    });
  });
  // ajax request
  res.sendStatus(200);
});

//get delete image
router.get("/delete-image/:image", isAdmin, (req, res) => {
  let originalImage =
    "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
  let thumbImage =
    "public/product_images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fs.remove(originalImage, err => {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, err => {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Image deleted");
          res.redirect("/admin/products/edit-product/" + req.query.id);
        }
      });
    }
  });
});

//get delete product
router.get("/delete-product/:id", isAdmin, (req, res) => {
  let id = req.params.id;
  let path = "public/product_images/" + id;
  fs.remove(path, err => {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, err => {
        console.log(err);
      });

      req.flash("success", "Product deleted");
      res.redirect("/admin/products");
    }
  });
});

module.exports = router;
