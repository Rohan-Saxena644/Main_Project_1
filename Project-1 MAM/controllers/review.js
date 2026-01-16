// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js");

// module.exports.createReview = async (req,res) =>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     newReview.author = req.user._id ;
//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     // console.log("new review saved");
//     // res.send("new review saved");

//     req.flash("success","New Review Created!");
//     res.redirect(`/listings/${listing._id}`);
// }


// module.exports.destroyReview = async (req,res)=>{
//     let {id , reviewId} = req.params;

//     await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     req.flash("success","Review Deleted");
//     res.redirect(`/listings/${id}`);
// }


const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


// =======================
// CREATE REVIEW
// =======================
module.exports.createReview = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // ===== MEN Stack (EJS) Implementation =====
    // req.flash("success","New Review Created!");
    // res.redirect(`/listings/${listing._id}`);

    // ===== MERN / React Implementation =====
    res.status(201).json({
      message: "New review created successfully",
      review: newReview
    });

  } catch (err) {
    next(err);
  }
};


// =======================
// DELETE REVIEW
// =======================
module.exports.destroyReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $pull: { reviews: reviewId } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    await Review.findByIdAndDelete(reviewId);

    // ===== MEN Stack (EJS) Implementation =====
    // req.flash("success","Review Deleted");
    // res.redirect(`/listings/${id}`);

    // ===== MERN / React Implementation =====
    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    next(err);
  }
};
