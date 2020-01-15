const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const conifg = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");

// connect to mongodb
mongoose.connect(conifg.database);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// init app
const app = express();

// Setting EJS as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set public folder
app.use(express.static(path.join(__dirname, "public")));

// set global error variable
app.locals.errors = null;

// express file upload middleware
app.use(fileUpload());

// body parser middleware

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Express Session middleware

app.use(
  session({
    secret: "woot",
    resave: true,
    saveUninitialized: true
  })
);

// express validator middleware (using v5 as v6 has some changes)

app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: (value, filename) => {
        let extension = path.extname(filename).toLowerCase();
        console.log(extension);
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      }
    }
  })
);

// express messages middleware

app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// set routes

const pages = require("./routes/pages");
const adminPages = require("./routes/admin_pages");
const adminCategories = require("./routes/admin_categories");
const adminProducts = require("./routes/admin_products");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/", pages);

// start sv
const port = 3000;
app.listen(port, () => {
  console.log("___________________________");
  console.log("Server started on Port " + port);
});
