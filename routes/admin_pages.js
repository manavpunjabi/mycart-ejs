const express = require("express");
const router = express.Router();

// get page model
const Page = require("../models/page");

// get pages index

// default route is /admin/pages
router.get("/", (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec((err, pages) => {
      res.render("admin/pages", {
        pages: pages
      });
    });
});

// get add page
router.get("/add-page", (req, res) => {
  const title = "";
  const slug = "";
  const content = "";

  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content
  });
});

// post add page
router.post("/add-page", (req, res) => {
  req.checkBody("title", "Title must have value").notEmpty();
  req.checkBody("content", "Content must have value").notEmpty();

  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  // making title the slug if slug is empty as its not set to REQUIRED
  if (slug == "") {
    slug = title.replace(/\s+/g, "-").toLowerCase();
  }
  let content = req.body.content;

  let errors = req.validationErrors();
  if (errors) {
    console.log("errors in validation");
    res.render("admin/add_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({ slug: slug }, (err, page) => {
      if (page) {
        req.flash("danger", "Page slug exists, choose another");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        let page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(err => {
          if (err) {
            return console.log(err);
          }
          req.flash("success", "Page added");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

//post reorder pages
router.post("/reorder-pages", (req, res) => {
  // console.log(req.body);
  let ids = req.body["id[]"];
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    count++;

    (function(count) {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save(err => {
          if (err) {
            return console.log(err);
          }
        });
      });
    })(count);
  }
});

// get edit page
router.get("/edit-page/:slug", (req, res) => {
  Page.findOne({ slug: req.params.slug }, (err, page) => {
    if (err) {
      return console.log(err);
    }
    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});

// post edit page
router.post("/edit-page/:slug", (req, res) => {
  req.checkBody("title", "Title must have value").notEmpty();
  req.checkBody("content", "Content must have value").notEmpty();

  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  // making title the slug if slug is empty as its not set to REQUIRED
  if (slug == "") {
    slug = title.replace(/\s+/g, "-").toLowerCase();
  }
  let content = req.body.content;
  let id = req.body.id;

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
            res.redirect("/admin/pages/edit-page/" + page.slug);
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
