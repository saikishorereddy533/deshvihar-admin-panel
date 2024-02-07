const { check, validationResult } = require("express-validator");
const User = require("../models/User")
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
    res.render("auth/login");
};

exports.postLogin = [
  // Validate email and password
  check("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address"),
  check("password").notEmpty().withMessage("Password is required")
  .matches(/^[\w@\$]*$/).withMessage("Something Went Wrong")
  .isLength({ min: 6 }).withMessage("Something Went Wrong"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are validation errors
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        isAdmin: false,
        error: errors.array()[0].msg,
      });
    }

    const email = req.body.email;
    const password = req.body.password;
    
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Invalid Credentials");
          return res.redirect("/auth/login");
        }

        bcrypt.compare(password, user.password).then((booleanRes) => {
          if (booleanRes) {
            // Password Match
            req.session.isLoggedIn = true;
            const { name, email, _id } = user;
            const filteredUser = { name, email, _id };
            req.session.user = filteredUser;
            req.session.isAdmin = user.superUser;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }

          req.flash("error", "Invalid Credentials");
          res.redirect("/auth/login");
        });
      })
      .catch(() => {
        console.log("Invalid Email");
        req.flash("error", "Invalid Credentials");
        res.redirect("/auth/login");
      });
  }
];

exports.getLogout = (req, res, next) => {
  // Clear the session data
  req.session.destroy((err) => {
    if (err) {
      console.log("Error while logging out: ", err);
    }
    res.redirect("/auth/login");
  });
};


exports.postSignup = [
  // Validate name, email, password, confirm password, and phone number
  check("name").notEmpty().withMessage("Name is required")
  .matches(/^[a-zA-Z\s]*$/).withMessage("Name should only contain alphabetic characters")
  .isLength({ min: 6 }).withMessage("UserName must be at least 6 characters long"),

  check("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address"),
  check("password")
    .notEmpty().withMessage("Password is required")
    .matches(/^[\w@\$]*$/).withMessage("Password should only contain alphabetic characters, digits, @, or $")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  check("confirmPassword")
    .notEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match"),
  check("mobileno")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("en-IN").withMessage("Invalid phone number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are validation errors
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        isAuthenticated: false,
        isAdmin: false,
        error: errors.array()[0].msg,
      });
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
      .then((userFetch) => {
        if (userFetch) {
          req.flash("error", "User Already Exists!");
          return res.redirect("/auth/signup");
        }

        bcrypt.hash(password, 10)
          .then( async (hashedPassword) => {
            const user = new User({
              email: email,
              password: hashedPassword,
              cart: { items: [] },
              superUser: false,
              mobileno: req.body.mobileno,
              name: req.body.name,
            });
            await user.save();
            req.session.user = user;
            return res.json(user)
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/auth/signup");
          });
      })
      .catch((err) => console.log(err));
  }
];