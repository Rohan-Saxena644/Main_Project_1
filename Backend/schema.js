const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    images: Joi.array().items(Joi.string().allow("", null)).optional(),
    category: Joi.string().valid("mountains", "arctic", "farms", "deserts", "beaches", "cities", "forests", "lakes").optional(),
  }).required(),
  deleteImages: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  imageOrder: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});

module.exports.bookingSchema = Joi.object({
  listingId: Joi.string().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required(),
});

module.exports.bookingQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid("all", "upcoming", "past", "active", "cancelled", "confirmed").default("all"),
});

module.exports.cancelBookingSchema = Joi.object({
  cancellationReason: Joi.string().trim().max(300).allow("", null),
});

module.exports.bookingAvailabilitySchema = Joi.object({
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required(),
});
