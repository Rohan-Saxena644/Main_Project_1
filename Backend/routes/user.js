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


//-------------------------------------------------------------------------------


// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync");
// const passport = require("passport");
// const { saveRedirectUrl } = require("../middleware.js");
// const userController = require("../controllers/user.js");


// // =======================
// // SIGNUP
// // =======================

// // ===== MEN Stack =====
// // router.route("/signup")
// //   .get(userController.renderSignupForm)
// //   .post(wrapAsync(userController.signup));

// // ===== MERN / React =====
// router.post("/signup", wrapAsync(userController.signup));


// // =======================
// // LOGIN
// // =======================

// // ===== MEN Stack =====
// // router.route("/login")
// //   .get(userController.renderLoginForm)
// //   .post(
// //      saveRedirectUrl,
// //      passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
// //      userController.login
// //   );

// // ===== MERN / React =====
// // router.post(
// //   "/login",
// //   passport.authenticate("local"),  // passport sets req.user
// //   userController.login             // controller returns JSON
// // );


// // routes/user.js
// router.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     if (!user) {
//       // info.message usually contains "Password or username is incorrect"
//       return res.status(401).json({ error: info.message || "Invalid credentials" });
//     }
//     req.logIn(user, (err) => {
//       if (err) return next(err);
//       // Call your controller logic if successful
//       return userController.login(req, res);
//     });
//   })(req, res, next);
// });


// // =======================
// // LOGOUT
// // =======================

// // ===== MEN Stack =====
// // router.get("/logout", userController.logout);

// // ===== MERN / React =====
// router.post("/logout", userController.logout);

// router.get("/current-user", (req, res) => {
//   res.json(req.user || null);
// });

// router.get("/auth/check", userController.checkAuth);

// module.exports = router;

//------------------------------------------------------------------------------------------------



const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");

// =======================
// SIGNUP
// =======================
router.post("/signup", wrapAsync(userController.signup));

// =======================
// LOGIN - WITH PROPER ERROR HANDLING
// =======================
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      
      if (!user) {
        return res.status(401).json({ 
          error: info?.message || "Invalid username or password" 
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        
        return userController.login(req, res);
      });
    })(req, res, next);
  }
);

// =======================
// LOGOUT
// =======================
router.post("/logout", userController.logout);

// =======================
// CURRENT USER - FIXED
// =======================
router.get("/current-user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      _id: req.user._id,  // ✅ Changed from "id" to "_id"
      username: req.user.username,
      email: req.user.email
    });
  } else {
    res.json(null);
  }
});

// =======================
// AUTH CHECK
// =======================
router.get("/auth/check", userController.checkAuth);

module.exports = router;
