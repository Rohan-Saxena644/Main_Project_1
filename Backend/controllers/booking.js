
const mongoose = require("mongoose");
const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

const {
  cacheGet,
  cacheSet,
  TTL,
  availKey,
  invalidateAllForListing,
} = require("../utils/cache");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeDate(value) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function startOfTodayUtc() {
  return normalizeDate(new Date());
}

function buildBookingCode() {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BK-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
}


function buildHistoryFilter(baseQuery, status) {
  const now = new Date();

  switch (status) {
    case "upcoming":
      return { ...baseQuery, status: "confirmed", checkInDate: { $gt: now } };
    case "past":
      return { ...baseQuery, status: "confirmed", checkOutDate: { $lt: now } };
    case "active":
      return {
        ...baseQuery,
        status: "confirmed",
        checkInDate: { $lte: now },
        checkOutDate: { $gt: now },
      };
    case "cancelled":
      return { ...baseQuery, status: "cancelled" };
    case "confirmed":
      return { ...baseQuery, status: "confirmed" };
    default:
      return baseQuery;
  }
}

async function refreshListingBookingSummary(listingId, session) {
  const now = new Date();

  const activeBookings = await Booking.find({
    listing: listingId,
    status: "confirmed",
    checkOutDate: { $gt: now },
  })
    .sort({ checkOutDate: -1 })
    .session(session);

  await Listing.findByIdAndUpdate(
    listingId,
    {
      bookedTill: activeBookings.length > 0 ? activeBookings[0].checkOutDate : null,
      bookingStatus: activeBookings.length > 0 ? "booked" : "available",
      activeBookingCount: activeBookings.length,
    },
    { session }
  );
}


async function invalidateListingCaches(listingId) {
  await invalidateAllForListing(listingId);
}


module.exports.createBooking = async (req, res) => {
  const { listingId, checkInDate, checkOutDate } = req.body;
  const normalizedCheckIn = normalizeDate(checkInDate);
  const normalizedCheckOut = normalizeDate(checkOutDate);
  const today = startOfTodayUtc();
  const nights = Math.ceil((normalizedCheckOut - normalizedCheckIn) / MS_PER_DAY);

  if (nights < 1) {
    throw new ExpressError(400, "Check-out date must be after check-in date");
  }
  if (normalizedCheckIn < today) {
    throw new ExpressError(400, "Check-in date cannot be in the past");
  }

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      const listing = await Listing.findById(listingId).session(session);
      if (!listing) throw new ExpressError(404, "Listing not found");

      if (listing.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You cannot book your own listing");
      }

      const overlap = await Booking.findOne({
        listing: listingId,
        status: "confirmed",
        checkInDate: { $lt: normalizedCheckOut },
        checkOutDate: { $gt: normalizedCheckIn },
      }).session(session);

      if (overlap) {
        throw new ExpressError(
          409,
          "This listing is already booked for the selected dates"
        );
      }

      const [created] = await Booking.create(
        [
          {
            listing: listing._id,
            guest: req.user._id,
            host: listing.owner,
            checkInDate: normalizedCheckIn,
            checkOutDate: normalizedCheckOut,
            nights,
            pricePerNight: listing.price,
            totalPrice: listing.price * nights,
            status: "confirmed",
            bookingCode: buildBookingCode(),
            bookedAt: new Date(),
          },
        ],
        { session }
      );

      booking = created;
      await refreshListingBookingSummary(listing._id, session);
    });
  } finally {
    await session.endSession();
  }

  await invalidateListingCaches(listingId);

  res.status(201).json({ message: "Booking confirmed", booking });
};


module.exports.getMyBookings = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status || "all";
  const skip = (page - 1) * limit;
  const filter = buildHistoryFilter({ guest: req.user._id }, status);

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.find(filter)
      .sort({ bookedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("listing", "title location country images bookedTill bookingStatus")
      .populate("host", "username email"),
  ]);

  res.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

module.exports.getHostBookings = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status || "all";
  const skip = (page - 1) * limit;
  const filter = buildHistoryFilter({ host: req.user._id }, status);

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.find(filter)
      .sort({ bookedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("listing", "title location country images bookedTill bookingStatus")
      .populate("guest", "username email"),
  ]);

  res.json({
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

module.exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate("listing", "title location country images bookedTill bookingStatus")
    .populate("guest", "username email")
    .populate("host", "username email");

  if (!booking) throw new ExpressError(404, "Booking not found");

  const isGuest = booking.guest?._id.equals(req.user._id);
  const isHost = booking.host?._id.equals(req.user._id);
  if (!isGuest && !isHost) throw new ExpressError(403, "Not authorized to view this booking");

  res.json({ booking });
};


module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      booking = await Booking.findById(id).session(session);
      if (!booking) throw new ExpressError(404, "Booking not found");

      const isGuest = booking.guest.equals(req.user._id);
      const isHost = booking.host.equals(req.user._id);
      if (!isGuest && !isHost) throw new ExpressError(403, "Not authorized to cancel this booking");

      if (booking.status === "cancelled") {
        throw new ExpressError(400, "Booking is already cancelled");
      }

      booking.status = "cancelled";
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || "";
      await booking.save({ session });

      await refreshListingBookingSummary(booking.listing, session);
    });
  } finally {
    await session.endSession();
  }

  await invalidateListingCaches(booking.listing);

  res.json({ message: "Booking cancelled successfully", booking });
};


module.exports.getListingAvailability = async (req, res) => {
  const { listingId } = req.params;
  const { checkInDate, checkOutDate } = req.query;
  const normalizedCheckIn = normalizeDate(checkInDate);
  const normalizedCheckOut = normalizeDate(checkOutDate);

  
  const key = availKey(listingId);
  const cached = await cacheGet(key);
  if (cached) {
    
    const isAvailable = !cached.bookedRanges?.some(
      (range) =>
        normalizedCheckIn < new Date(range.checkOutDate) &&
        normalizedCheckOut > new Date(range.checkInDate)
    );
    return res.json({
      available: isAvailable,
      bookedTill: cached.bookedTill,
      bookingStatus: cached.bookingStatus,
      fromCache: true,
    });
  }


  const listing = await Listing.findById(listingId).select(
    "_id bookedTill bookingStatus"
  );
  if (!listing) throw new ExpressError(404, "Listing not found");

  
  const now = new Date();
  const bookedRanges = await Booking.find({
    listing: listingId,
    status: "confirmed",
    checkOutDate: { $gt: now },
  }).select("checkInDate checkOutDate");


  await cacheSet(
    key,
    {
      bookedRanges,
      bookedTill: listing.bookedTill,
      bookingStatus: listing.bookingStatus,
    },
    TTL.availability
  );

  const overlap = bookedRanges.find(
    (range) =>
      normalizedCheckIn < range.checkOutDate &&
      normalizedCheckOut > range.checkInDate
  );

  res.json({
    available: !overlap,
    bookedTill: listing.bookedTill,
    bookingStatus: listing.bookingStatus,
    overlappingBooking: overlap
      ? { checkInDate: overlap.checkInDate, checkOutDate: overlap.checkOutDate }
      : null,
  });
};
