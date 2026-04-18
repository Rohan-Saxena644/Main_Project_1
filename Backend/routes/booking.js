const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const bookingController = require("../controllers/booking");
const {
  isLoggedIn,
  validateBooking,
  validateBookingQuery,
  validateBookingCancellation,
} = require("../middleware");

router.get(
  "/me",
  isLoggedIn,
  validateBookingQuery,
  wrapAsync(bookingController.getMyBookings)
);

router.get(
  "/host",
  isLoggedIn,
  validateBookingQuery,
  wrapAsync(bookingController.getHostBookings)
);

router.get(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.getBookingById)
);

router.post(
  "/",
  isLoggedIn,
  validateBooking,
  wrapAsync(bookingController.createBooking)
);

router.patch(
  "/:id/cancel",
  isLoggedIn,
  validateBookingCancellation,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
