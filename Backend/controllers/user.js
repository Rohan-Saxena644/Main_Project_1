
const User = require("../models/user.js");
const isProduction = process.env.NODE_ENV === "production";


module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

  
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



module.exports.login = async (req, res) => {

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


module.exports.logout = (req, res, next) => {

  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }

      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
      });

      res.json({ message: "Logout successful" });
    });
  });
};



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



module.exports.getOwnProfile = async (req, res) => {
  const Listing = require("../models/listing.js");
  const listings = await Listing.find({ owner: req.user._id }).sort({ _id: -1 });
  res.json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
    listings,
  });
};


module.exports.getPublicProfile = async (req, res) => {
  const Listing = require("../models/listing.js");
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const listings = await Listing.find({ owner: user._id }).sort({ _id: -1 });
  res.json({
    user: {
      _id: user._id,
      username: user.username,
    },
    listings,
  });
};
