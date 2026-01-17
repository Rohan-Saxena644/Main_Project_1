// const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema , reviewSchema} = require("./schema.js");

// module.exports.isLoggedIn = (req,res,next)=>{
//     if(!req.isAuthenticated()){
//         // original url save
//         req.session.redirectUrl = req.originalUrl;
//         req.flash("error" , "you must be logged in to create listing!");
//         return res.redirect("/login");
//     }
//     next();
// };

// module.exports.saveRedirectUrl = (req,res,next)=>{
//     if(req.session.redirectUrl){
//         res.locals.redirectUrl = req.session.redirectUrl ;
//     }
//     next();
// };

// module.exports.isOwner = async (req,res,next)=>{
//     let{id} = req.params;
//     let listing = await Listing.findById(id);
//     if(!listing.owner._id.equals(res.locals.currUser._id)){
//         req.flash("error","You are not the owner of this listing");
//         return res.redirect(`/listings/${id}`);
//     }

//     next();
// };


// // middleware for schema validations
// module.exports.validateListing = (req,res,next) =>{
//     let {error} = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };


// // middleware to validate reviews
// module.exports.validateReview = (req,res,next) =>{
//     let {error} = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };

// module.exports.isreviewAuthor = async (req,res,next)=>{
//     let{ id , reviewId} = req.params;
//     let review = await Review.findById(reviewId);
//     if(!review.author.equals(res.locals.currUser._id)){
//         req.flash("error","You are not the author of this review");
//         return res.redirect(`/listings/${id}`);
//     }

//     next();
// };




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
