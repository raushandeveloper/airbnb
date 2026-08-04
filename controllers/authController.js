const { check, validationResult } = require('express-validator');
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user:{},
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: { firstName: "", lastName: "", email: "", userType: "" },
    user:{},
  });
};

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters long.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name must contain only letters and spaces."),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last name must contain only letters and spaces."),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  check("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[!@&]/)
    .withMessage("Password must contain at least one special character."),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type.")
    .isIn(['guest', 'host'])
    .withMessage("Invalid user type selected."),

  check("terms")
    .custom((value, { req }) => {
      if (!value) {
        throw new Error("You must accept the terms and conditions.");
      }
      return true;
    }),

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Sign Up",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user:{},
      });
    }


    bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({firstName, lastName, email, password: hashedPassword, userType});
      return user.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch(err => {
      return res.status(422).render("auth/signup", {
        pageTitle: "Sign Up",
        currentPage: "signup",
        isLoggedIn: false,
        errors:[err.message],
        oldInput: { firstName, lastName, email, password, userType },
        user:{},
      });
    });
} 
];

exports.postLogin = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Please enter your password."),

  async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { email },
        user:{},
      });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          currentPage: "login",
          isLoggedIn: false,
          errors: ["User does not exist."],
          oldInput: { email }
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          currentPage: "login",
          isLoggedIn: false,
          errors: ["Invalid password."],
          oldInput: { email }
        });
      }

      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save(); // Ensure session is saved before redirecting
      req.session.save(err => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      }); 
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["An error occurred while logging in. Please try again."],
        oldInput: { email }
      });
    }
  }
];

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
};