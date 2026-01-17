// const User = require("../models/user.js");

// module.exports.renderSignupForm = (req,res)=>{
//     res.render("users/signup.ejs");
// };


// module.exports.signup = async (req,res,next)=>{

//     try{
//         let {username , email , password } = req.body ;
//         const newUser = new User({email,username});
//         const registeredUser = await User.register(newUser,password) ;
//         console.log(registeredUser);
//         console.log("SESSION BEFORE LOGIN:", req.session);
//         req.login(registeredUser , (err)=>{
//             if(err){
//                 return next(err);
//             }
//             req.flash("success" ,  "Welcome to Wanderlust");
//             return res.redirect("/listings");
//         })
//     }catch(e){
//         req.flash("error",e.message);
//         res.redirect("/signup");
//     }
    
// };


// module.exports.renderLoginForm = (req,res)=>{
//     res.render("users/login.ejs");
// };

// module.exports.login = async (req,res)=>{
//     req.flash("success","Welcome back to Wanderlust!");
//     let redirectUrl = res.locals.redirectUrl || "/listings";
//     res.redirect(redirectUrl);
// };

// module.exports.logout = (req , res , next)=>{
//     req.logout((err)=>{
//         if(err){
//             return next(err); // why is it that that we are return ing this see difference between returning it or not
//         }
//         req.flash("success" , "you are logged out!");
//         res.redirect("/listings");
//     })
// };

const User = require("../models/user.js");


// =======================
// SIGNUP PAGE (MEN only)
// =======================

// module.exports.renderSignupForm = (req,res)=>{
//     res.render("users/signup.ejs");
// };
// 👉 React handles signup page now


// =======================
// SIGNUP
// =======================
module.exports.signup = async (req,res,next)=>{
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // Auto login after signup (passport session)
    req.login(registeredUser, (err) => {
      if (err) return next(err);

      // ===== MEN Stack =====
      // req.flash("success","Welcome to Wanderlust");
      // return res.redirect("/listings");

      // ===== MERN / React =====
      return res.status(201).json({
        message: "Signup successful",
        user: {
          id: registeredUser._id,
          username: registeredUser.username,
          email: registeredUser.email
        }
      });
    });

  } catch (e) {

    // ===== MEN Stack =====
    // req.flash("error", e.message);
    // res.redirect("/signup");

    // ===== MERN / React =====
    res.status(400).json({ error: e.message });
  }
};


// =======================
// LOGIN PAGE (MEN only)
// =======================

// module.exports.renderLoginForm = (req,res)=>{
//     res.render("users/login.ejs");
// };
// 👉 React handles login page now


// =======================
// LOGIN
// =======================
module.exports.login = async (req,res)=>{
  
  // At this point passport has authenticated user

  // ===== MEN Stack =====
  // req.flash("success","Welcome back to Wanderlust!");
  // let redirectUrl = res.locals.redirectUrl || "/listings";
  // res.redirect(redirectUrl);

  // ===== MERN / React =====
  res.json({
    message: "Login successful",
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
};


// =======================
// LOGOUT
// =======================
module.exports.logout = (req, res, next)=>{

  req.logout((err)=>{
    if (err) return next(err);

    // ===== MEN Stack =====
    // req.flash("success","you are logged out!");
    // res.redirect("/listings");

    // ===== MERN / React =====
    res.json({ message: "Logout successful" });
  });
};
