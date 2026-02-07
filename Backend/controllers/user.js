
const User = require("../models/user.js");


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

      return res.status(201).json({
        message: "Signup successful",
        user: {
          _id: registeredUser._id,
          username: registeredUser.username,
          email: registeredUser.email
        }
      });
    });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};


// =======================
// LOGIN - FIXED
// =======================
// module.exports.login = async (req, res) => {
//   // Passport has already authenticated and set req.user
//   // We need to manually re-login after regeneration
  
//   const user = req.user;
  
//   req.session.regenerate((err) => {
//     if (err) {
//       return res.status(500).json({ error: "Session error" });
//     }

//     // CRITICAL: Must call req.login() again after regenerate
//     // This re-establishes the Passport session
//     req.login(user, (err) => {
//       if (err) {
//         return res.status(500).json({ error: "Login failed" });
//       }

//       res.json({
//         message: "Login successful",
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email
//         }
//       });
//     });
//   });
// };


// controllers/user.js
module.exports.login = async (req, res) => {
  // If passport.authenticate("local") succeeds, req.user is already populated
  const user = req.user;
  
  res.json({
    message: "Login successful",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email
    }
  });
};


// =======================
// LOGOUT
// =======================
module.exports.logout = (req, res, next)=>{

  req.logout((err)=>{
    if (err) return next(err);

    // Destroy session completely
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: true, // FIXED: Always true in production
        sameSite: 'none'
      });

      res.json({ message: "Logout successful" });
    });
  });
};


// =======================
// CHECK AUTH STATUS
// =======================
module.exports.checkAuth = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
};