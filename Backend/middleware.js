
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


// =======================
// AUTH CHECK
// =======================
module.exports.isLoggedIn = (req, res, next) => {

  // ===== MEN Stack =====
  // if(!req.isAuthenticated()){
  //     req.session.redirectUrl = req.originalUrl;
  //     req.flash("error" , "you must be logged in to create listing!");
  //     return res.redirect("/login");
  // }

  // ===== MERN / React =====
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  next();
};


// =======================
// SAVE REDIRECT URL (MEN only)
// =======================

module.exports.saveRedirectUrl = (req, res, next) => {

  // ===== MEN Stack =====
  // if(req.session.redirectUrl){
  //     res.locals.redirectUrl = req.session.redirectUrl ;
  // }

  // ===== MERN =====
  // React handles redirects → no need to save redirectUrl

  next();
};


// =======================
// CHECK LISTING OWNER
// =======================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // ===== MEN Stack =====
  // if(!listing.owner._id.equals(res.locals.currUser._id)){
  //     req.flash("error","You are not the owner of this listing");
  //     return res.redirect(`/listings/${id}`);
  // }

  // ===== MERN / React =====
  if (!listing || !listing.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "Not authorized as listing owner" });
  }

  next();
};


// =======================
// VALIDATE LISTING
// =======================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// =======================
// VALIDATE REVIEW
// =======================
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// =======================
// CHECK REVIEW AUTHOR
// =======================
module.exports.isreviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);

  // ===== MEN Stack =====
  // if(!review.author.equals(res.locals.currUser._id)){
  //     req.flash("error","You are not the author of this review");
  //     return res.redirect(`/listings/${id}`);
  // }

  // ===== MERN / React =====
  if (!review || !review.author.equals(req.user._id)) {
    return res.status(403).json({ error: "Not authorized as review author" });
  }

  next();
};


// module.exports.sessionTimeout = (req, res, next) => {
//   if (req.session && req.user) {
//     const now = Date.now();
//     const lastActivity = req.session.lastActivity || now;
//     const timeout = 30 * 60 * 1000; // 30 minutes of inactivity

//     if (now - lastActivity > timeout) {
//       // Session expired due to inactivity
//       req.logout((err) => {
//         if (err) return next(err);
//         req.session.destroy(() => {
//           return res.status(401).json({ 
//             error: "Session expired due to inactivity",
//             sessionExpired: true 
//           });
//         });
//       });
//     } else {
//       // Update last activity time
//       req.session.lastActivity = now;
//       next();
//     }
//   } else {
//     next();
//   }
// };


module.exports.sessionTimeout = (req, res, next) => {
  if (req.session && req.user) {
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    const timeout = 30 * 60 * 1000; 

    if (now - lastActivity > timeout) {
      return req.logout((err) => { // Use 'return' to stop execution
        req.session.destroy(() => {
          res.status(401).json({ error: "Session expired", sessionExpired: true });
        });
      });
    }
    req.session.lastActivity = now;
  }
  next();
};
