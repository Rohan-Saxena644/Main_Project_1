
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


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

    res.status(201).json({
      message: "New review created successfully",
      review: newReview
    });

  } catch (err) {
    next(err);
  }
};


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

    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    next(err);
  }
};
