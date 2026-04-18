const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

bookingSchema.index({
  listing: 1,
  checkInDate: 1,
  checkOutDate: 1,
  status: 1,
});

bookingSchema.index({
  guest: 1,
  createdAt: -1,
});

bookingSchema.index({
  host: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Booking", bookingSchema);
