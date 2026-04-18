/**
 * routes/booking.js — with rate limiting
 *
 * writeLimiter on POST (create booking) and PATCH (cancel booking).
 * GET routes use the baseline generalLimiter from app.js.
 * The availability endpoint gets no extra limiter — it's cheap to serve
 * from cache and the frontend calls it on every date picker change.
 */

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const bookingController = require("../controllers/booking");
const {
  isLoggedIn,
  validateBooking,
  validateBookingQuery,
  validateBookingCancellation,
  validateBookingAvailability,
} = require("../middleware");
const { writeLimiter } = require("../utils/rateLimiter");

// GET /api/bookings/me
router.get(
  "/me",
  isLoggedIn,
  validateBookingQuery,
  wrapAsync(bookingController.getMyBookings)
);

// GET /api/bookings/host
router.get(
  "/host",
  isLoggedIn,
  validateBookingQuery,
  wrapAsync(bookingController.getHostBookings)
);

// GET /api/bookings/availability/:listingId
// No extra limiter — served from Redis cache, very cheap
router.get(
  "/availability/:listingId",
  validateBookingAvailability,
  wrapAsync(bookingController.getListingAvailability)
);

// GET /api/bookings/:id
router.get(
  "/:id",
  isLoggedIn,
  wrapAsync(bookingController.getBookingById)
);

// POST /api/bookings — create booking
// writeLimiter: 30/min per user — prevents booking spam
router.post(
  "/",
  isLoggedIn,
  writeLimiter,
  validateBooking,
  wrapAsync(bookingController.createBooking)
);

// PATCH /api/bookings/:id/cancel
// writeLimiter: someone shouldn't be able to spam cancel requests
router.patch(
  "/:id/cancel",
  isLoggedIn,
  writeLimiter,
  validateBookingCancellation,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
