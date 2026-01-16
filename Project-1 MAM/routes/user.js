// const express = require("express");
// const router = express.Router();
// const User = require("../models/user.js");
// const wrapAsync = require("../utils/wrapAsync");
// const passport = require("passport");
// const { saveRedirectUrl } = require("../middleware.js");
// const userController = require("../controllers/user.js");


// router.route("/signup")
//     .get(userController.renderSignupForm)
//     .post(wrapAsync(userController.signup));
// // router.get("/signup" , userController.renderSignupForm);

// // router.post("/signup" , wrapAsync(userController.signup));

// router.route("/login")
//     .get(userController.renderLoginForm)
//     .post(saveRedirectUrl , passport.authenticate("local" , {failureRedirect: "/login" , failureFlash: true}) , userController.login);

// //passport.authenticate() is a function which is used as root middleware to authenticate requests
// // router.post("/login", saveRedirectUrl , passport.authenticate("local" , {failureRedirect: "/login" , failureFlash: true}) , userController.login);

// router.get("/logout" , userController.logout);

// module.exports = router;



const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");


// =======================
// SIGNUP
// =======================

// ===== MEN Stack =====
// router.route("/signup")
//   .get(userController.renderSignupForm)
//   .post(wrapAsync(userController.signup));

// ===== MERN / React =====
router.post("/signup", wrapAsync(userController.signup));


// =======================
// LOGIN
// =======================

// ===== MEN Stack =====
// router.route("/login")
//   .get(userController.renderLoginForm)
//   .post(
//      saveRedirectUrl,
//      passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
//      userController.login
//   );

// ===== MERN / React =====
router.post(
  "/login",
  passport.authenticate("local"),  // passport sets req.user
  userController.login             // controller returns JSON
);


// =======================
// LOGOUT
// =======================

// ===== MEN Stack =====
// router.get("/logout", userController.logout);

// ===== MERN / React =====
router.post("/logout", userController.logout);


module.exports = router;
