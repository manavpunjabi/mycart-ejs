const express = require("express");
const router = express.Router();

// get page model
const Category = require("../models/category");

// default route is /admin/categories

// get categories index
router.get("/", (req, res) => {
  Category.find((err, categories) => {
    if (err) return console.log(err);
    res.render("admin/categories", {
      categories
    });
  });
});

// get add page
router.get("/add-category", (req, res) => {
  const title = "";

  res.render("admin/add_category", {
    title: title
  });
});

// post add category
router.post("/add-category", (req, res) => {
  req.checkBody("title", "Title must have value").notEmpty();

  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  // making title the slug if slug is empty as its not set to REQUIRED

  let errors = req.validationErrors();
  if (errors) {
    console.log("errors in validation");
    res.render("admin/add_category", {
      errors: errors,
      title: title
    });
  } else {
    Category.findOne({ slug: slug }, (err, category) => {
      if (category) {
        req.flash("danger", "Category title exists, choose another");
        res.render("admin/add_category", {
          title: title
        });
      } else {
        let category = new Category({
          title: title,
          slug: slug
        });
        category.save(err => {
          if (err) {
            return console.log(err);
          }
          req.flash("success", "Category added");
          res.redirect("/admin/categories");
        });
      }
    });
  }
});

// get edit category
router.get("/edit-category/:id", (req, res) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) {
      return console.log(err);
    }
    res.render("admin/edit_category", {
      title: category.title,
      id: category._id
    });
  });
});

// post edit category
router.post("/edit-category/:id", (req, res) => {
  req.checkBody("title", "Title must have value").notEmpty();

  let title = req.body.title;
  let slug = title.replace(/\s+/g, "-").toLowerCase();

  let id = req.params.id;

  let errors = req.validationErrors();
  if (errors) {
    console.log("errors in validation");
    res.render("admin/edit_category", {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Category.findOne({ slug: slug, _id: { $ne: id } }, (err, category) => {
      if (category) {
        req.flash("danger", "Category title exists, choose another");
        res.render("admin/edit_category", {
          title: title,
          id: id
        });
      } else {
        Category.findById(id, (err, category) => {
          if (err) {
            return console.log(err);
          }
          category.title = title;
          category.slug = slug;

          category.save(err => {
            if (err) {
              return console.log(err);
            }
            req.flash("success", "Category edited");
            res.redirect("/admin/categories/edit-category/" + id);
          });
        });
      }
    });
  }
});

//get delete category
router.get("/delete-category/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id, err => {
    if (err) {
      return console.log(err);
    }
    req.flash("success", "Category deleted");
    res.redirect("/admin/categories/");
  });
});

module.exports = router;
