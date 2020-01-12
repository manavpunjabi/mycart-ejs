const express = require("express");
const router = express.Router();

// get pages index

// default route is /admin/pages
router.get("/", (req, res) => {
  res.send("admin area");
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
    console.log("Success");
  }
});

module.exports = router;
