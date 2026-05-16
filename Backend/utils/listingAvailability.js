const Booking = require("../models/booking");
const Listing = require("../models/listing");

function isExpiredBookedStatus(listingLike) {
  if (!listingLike?.bookedTill) return false;
  return (
    listingLike.bookingStatus === "booked" &&
    new Date(listingLike.bookedTill) <= new Date()
  );
}

function normalizeListingAvailabilityData(listingLike) {
  if (!listingLike) return listingLike;

  if (isExpiredBookedStatus(listingLike)) {
    listingLike.bookedTill = null;
    listingLike.bookingStatus = "available";
    listingLike.activeBookingCount = 0;
  }

  return listingLike;
}

function normalizeListingCollection(listings = []) {
  return listings.map((listing) => normalizeListingAvailabilityData(listing));
}

async function clearExpiredBookedStatuses() {
  await Listing.updateMany(
    {
      bookingStatus: "booked",
      bookedTill: { $lte: new Date() },
    },
    {
      $set: {
        bookedTill: null,
        bookingStatus: "available",
        activeBookingCount: 0,
      },
    }
  );
}

async function refreshListingBookingSummary(listingId, session) {
  const now = new Date();

  const currentBooking = await Booking.findOne({
    listing: listingId,
    status: "confirmed",
    checkInDate: { $lte: now },
    checkOutDate: { $gt: now },
  })
    .sort({ checkOutDate: -1 })
    .session(session);

  await Listing.findByIdAndUpdate(
    listingId,
    {
      bookedTill: currentBooking ? currentBooking.checkOutDate : null,
      bookingStatus: currentBooking ? "booked" : "available",
      activeBookingCount: currentBooking ? 1 : 0,
    },
    { session }
  );

  return currentBooking;
}

module.exports = {
  clearExpiredBookedStatuses,
  normalizeListingAvailabilityData,
  normalizeListingCollection,
  refreshListingBookingSummary,
};
