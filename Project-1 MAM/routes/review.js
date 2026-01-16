// const express = require("express");
// const router = express.Router({mergeParams: true});
// const wrapAsync = require("../utils/wrapAsync.js");
// const Review = require("../models/review.js");
// const Listing = require("../models/listing.js");
// const {validateReview , isLoggedIn , isreviewAuthor} = require("../middleware.js") ;
// const reviewController = require("../controllers/review.js");


// // Post Route
// router.post("/" , isLoggedIn ,validateReview , wrapAsync(reviewController.createReview));


// //Delete Route
// router.delete("/:reviewId", isLoggedIn , isreviewAuthor ,wrapAsync(reviewController.destroyReview));

// module.exports = router;


const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// POST /api/listings/:id/reviews
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// DELETE /api/listings/:id/reviews/:reviewId
router.delete(
  "/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
