

const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig.js");
const { timeQuery } = require("../utils/queryMetrics");
const {
  clearExpiredBookedStatuses,
  normalizeListingAvailabilityData,
  normalizeListingCollection,
} = require("../utils/listingAvailability");

const {
  cacheGet,
  cacheSet,
  TTL,
  detailKey,
  listKey,
  invalidateListingDetail,
  invalidateListingList,
} = require("../utils/cache");


module.exports.index = async (req, res) => {
  const { search, category } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 28));
  const skip = (page - 1) * limit;

  await clearExpiredBookedStatuses();

  const key = await listKey({ search, category, page, limit });
  const cached = await cacheGet(key);
  if (cached) {
    cached.listings = normalizeListingCollection(cached.listings || []);
    return res.json(cached);
  }

  const normalizedSearch = search?.trim();
  const baseQuery = {};
  if (category && category !== "all") {
    baseQuery.category = category;
  }

  let listings = [];
  let total = 0;

  if (normalizedSearch) {
    const textSearchQuery = {
      ...baseQuery,
      $text: { $search: normalizedSearch },
    };

    total = await timeQuery("listings.index.textSearchCount", () =>
      Listing.countDocuments(textSearchQuery)
    );

    listings = await timeQuery("listings.index.textSearch", () =>
      Listing.find(textSearchQuery, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
    );

    if (total === 0) {
      const regexQuery = {
        ...baseQuery,
        $or: [
          { title: { $regex: normalizedSearch, $options: "i" } },
          { location: { $regex: normalizedSearch, $options: "i" } },
          { country: { $regex: normalizedSearch, $options: "i" } },
        ],
      };

      total = await timeQuery("listings.index.regexFallbackCount", () =>
        Listing.countDocuments(regexQuery)
      );

      listings = await timeQuery("listings.index.regexFallback", () =>
        Listing.find(regexQuery).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit)
      );
    }
  } else {
    total = await timeQuery("listings.index.defaultCount", () =>
      Listing.countDocuments(baseQuery)
    );

    listings = await timeQuery("listings.index.default", () =>
      Listing.find(baseQuery).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit)
    );
  }

  const normalizedListings = normalizeListingCollection(listings);
  const payload = {
    listings: normalizedListings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };

  await cacheSet(key, payload, TTL.list);
  res.json(payload);
};


module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const key = detailKey(id);
  const cached = await cacheGet(key);
  if (cached) {
    if (cached.listing) {
      normalizeListingAvailabilityData(cached.listing);
    }
    return res.json(cached);
  }

  const listing = await timeQuery("listings.showListing", () =>
    Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner")
  );

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  normalizeListingAvailabilityData(listing);
  await cacheSet(key, { listing }, TTL.detail);
  res.json({ listing });
};


module.exports.createListing = async (req, res, next) => {
  try {
    const response = await geocodingClient
      .forwardGeocode({ query: req.body.listing.location, limit: 1 })
      .send();

    if (!response.body.features.length) {
      return res
        .status(400)
        .json({ error: "Location not found. Please try a more specific location." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const images = req.files.map((f) => ({ url: f.path, filename: f.filename }));

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.images = images;
    newListing.geometry = response.body.features[0].geometry;
    if (req.body.listing.category) {
      newListing.category = req.body.listing.category;
    }

    const savedListing = await newListing.save();


    await invalidateListingList();

    res.status(201).json({
      message: "New listing created successfully",
      listing: savedListing,
    });
  } catch (err) {
    next(err);
  }
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json({ listing });
};


module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (
      req.body.listing.location &&
      req.body.listing.location !== listing.location
    ) {
      const response = await geocodingClient
        .forwardGeocode({ query: req.body.listing.location, limit: 1 })
        .send();

      if (!response.body.features.length) {
        return res.status(400).json({ error: "Location not found." });
      }

      req.body.listing.geometry = response.body.features[0].geometry;
    }

    const { title, description, location, country, price, geometry, category } =
      req.body.listing;

    listing = await Listing.findByIdAndUpdate(
      id,
      {
        title,
        description,
        location,
        country,
        price,
        geometry,
        ...(category && { category }),
      },
      { new: true }
    );


    if (req.body.deleteImages && req.body.deleteImages.length > 0) {
      const mainFilename = listing.images[0]?.filename;

      for (const filename of req.body.deleteImages) {
        if (filename === mainFilename) continue;
        await cloudinary.uploader.destroy(filename);
      }

      await listing.updateOne({
        $pull: {
          images: {
            filename: {
              $in: req.body.deleteImages.filter((f) => f !== mainFilename),
            },
          },
        },
      });
    }


    if (req.body.imageOrder) {
      const order = Array.isArray(req.body.imageOrder)
        ? req.body.imageOrder
        : [req.body.imageOrder];

      const current = await Listing.findById(id);
      const reordered = order
        .map((filename) => current.images.find((img) => img.filename === filename))
        .filter(Boolean);

      await Listing.findByIdAndUpdate(id, { images: reordered });
    }


    if (req.files && req.files.length > 0) {
      const currentCount = listing.images.length;
      const slots = 5 - currentCount;

      if (slots <= 0) {
        return res
          .status(400)
          .json({ error: "Maximum 5 images allowed. Delete some first." });
      }

      const newImages = req.files
        .slice(0, slots)
        .map((f) => ({ url: f.path, filename: f.filename }));

      await listing.updateOne({ $push: { images: { $each: newImages } } });
    }

    const updatedListing = await Listing.findById(id);


    await Promise.all([
      invalidateListingDetail(id),
      invalidateListingList(),
    ]);

    res.json({ message: "Listing updated successfully", listing: updatedListing });
  } catch (err) {
    next(err);
  }
};


module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  await Promise.all([
    invalidateListingDetail(id),
    invalidateListingList(),
  ]);

  res.json({ message: "Listing deleted" });
};
