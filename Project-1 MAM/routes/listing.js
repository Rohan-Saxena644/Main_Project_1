// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
// const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
// const listingController = require("../controllers/listing.js");
// const multer  = require('multer');
// const {storage} = require("../cloudConfig.js")
// const upload = multer({ storage });

// router
//     .route("/")
//     .get( wrapAsync(listingController.index))
//     .post(isLoggedIn , upload.single('listing[image]') ,validateListing, wrapAsync(listingController.createListing));


// //New Route
// router.get("/new" , isLoggedIn , wrapAsync(listingController.renderNewForm));//It is defined here as the router.route can interpret our new as a id    


// router.route("/:id")
//     .get(wrapAsync(listingController.showListing))
//     .put(isLoggedIn , isOwner , upload.single('listing[image]') ,validateListing , wrapAsync(listingController.updateListing))
//     .delete(isLoggedIn , isOwner , wrapAsync(listingController.destroyListing));


    
// //Edit route
// router.get("/:id/edit", isLoggedIn , isOwner , wrapAsync(listingController.renderEditForm));



// // //Index Route
// // router.get("/", wrapAsync(listingController.index));


// // //show route
// // router.get("/:id", wrapAsync(listingController.showListing));

// // //Create route
// // router.post("/", isLoggedIn ,validateListing, wrapAsync(listingController.createListing));

// // //Edit route
// // router.get("/:id/edit", isLoggedIn , isOwner , wrapAsync(listingController.renderEditForm));


// // //UPDATE ROUTE
// // router.put("/:id", isLoggedIn , isOwner , validateListing , wrapAsync(listingController.updateListing));                                                     



// // // DELETE ROUTE
// // router.delete("/:id", isLoggedIn , isOwner , wrapAsync(listingController.destroyListing));

// module.exports = router;

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// /api/listings
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// /api/listings/:id
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

module.exports = router;
