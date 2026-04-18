/**
 * controllers/listing.js
 *
 * Cache changes from Phase 3:
 *   - import new named helpers instead of raw cacheDel
 *   - index() uses versioned listKey() — no more hardcoded string + no KEYS scan
 *   - showListing() uses detailKey()
 *   - createListing() calls invalidateListingList()
 *   - updateListing() calls invalidateListingDetail + invalidateListingList
 *   - destroyListing() calls invalidateListingDetail + invalidateListingList
 *   - all TTLs come from the TTL config object in cache.js
 */

const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig.js");

const {
  cacheGet,
  cacheSet,
  TTL,
  detailKey,
  listKey,
  invalidateListingDetail,
  invalidateListingList,
} = require("../utils/cache");

// -----------------------------------------------------------------
// GET /api/listings
// -----------------------------------------------------------------
module.exports.index = async (req, res) => {
  const { search, category } = req.query;

  // listKey() reads the current version from Redis and hashes the filter.
  // If another listing is created/updated/deleted while this is cached,
  // invalidateListingList() increments the version and this key is
  // never read again. No KEYS scan, no DEL needed.
  const key = await listKey({ search, category });
  const cached = await cacheGet(key);
  if (cached) {
    return res.json(cached);
  }

  let query = {};
  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country:  { $regex: search, $options: "i" } },
    ];
  }
  if (category && category !== "all") {
    query.category = category;
  }

  const allListings = await Listing.find(query);
  await cacheSet(key, allListings, TTL.list);
  res.json(allListings);
};

// -----------------------------------------------------------------
// GET /api/listings/:id
// -----------------------------------------------------------------
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const key = detailKey(id);
  const cached = await cacheGet(key);
  if (cached) {
    return res.json(cached);
  }

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  await cacheSet(key, { listing }, TTL.detail);
  res.json({ listing });
};

// -----------------------------------------------------------------
// POST /api/listings
// -----------------------------------------------------------------
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

    // A new listing means the list view is stale.
    // Bump the version — no KEYS scan needed.
    await invalidateListingList();

    res.status(201).json({
      message: "New listing created successfully",
      listing: savedListing,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------
// GET /api/listings/:id/edit  (returns current data for the edit form)
// -----------------------------------------------------------------
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json({ listing });
};

// -----------------------------------------------------------------
// PUT /api/listings/:id
// -----------------------------------------------------------------
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Re-geocode only if location string changed
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

    // Delete images the user flagged for removal (never remove the first image)
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

    // Reorder images if a new order was sent
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

    // Add new images (max 5 total)
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

    // Bust the detail cache for this listing AND bump the list version.
    // Both run in parallel — no KEYS scan involved in either.
    await Promise.all([
      invalidateListingDetail(id),
      invalidateListingList(),
    ]);

    res.json({ message: "Listing updated successfully", listing: updatedListing });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------
// DELETE /api/listings/:id
// -----------------------------------------------------------------
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  // Same pattern — bust the specific detail key and bump list version.
  await Promise.all([
    invalidateListingDetail(id),
    invalidateListingList(),
  ]);

  res.json({ message: "Listing deleted" });
};