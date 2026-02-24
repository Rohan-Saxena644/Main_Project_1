// const Listing = require("../models/listing");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// module.exports.index = async (req,res)=>{

//     const { search } = req.query;

//     let query = {};
//     if (search) {
//         query = {
//         $or: [
//             { title: { $regex: search, $options: "i" } },
//             { location: { $regex: search, $options: "i" } },
//             { country: { $regex: search, $options: "i" } }
//         ]
//         };
//     }

//     const allListings = await Listing.find(query);
//     // res.render("listings/index.ejs" , {allListings}); REACTED IMPLEMENTATION THAT IS WHY COMMENTED OUT
//     res.json(allListings);
// }

// // module.exports.renderNewForm = async (req,res)=>{
// //     // console.log(req.user);
    
// //     // res.render("listings/new");
// // }  REACT IMPLEMENTATION


// module.exports.showListing = async (req,res)=>{
//     let {id} = req.params ;
//     const listing = await Listing.findById(id)
//     .populate({
//         path: "reviews",
//         populate: {
//             path: "author",
//         }
//     })
//     .populate("owner") ;
//     if(!listing){
//         // req.flash("error","Lisitng you requested for does not exist!");
//         // res.redirect("/listings");
//         return res.status(404).json({error: "Listing not found"});
//     }
//     console.log(listing);
//     // res.render("listings/show",{listing}) ; REACT IMPLERMENTATION
//     res.json({listing}) ;
// }


// module.exports.createListing = async (req,res,next)=>{

//     try{
//        const response = await geocodingClient.forwardGeocode({
//             query: req.body.listing.location,
//             limit: 1,
//         })
//         .send();
        
//         // console.log(response.body.features[0].geometry);
//         // res.send("done!");

//         let url = req.file ? req.file.path : "";
//         let filename = req.file ? req.file.filename : "";


//         // let url = req.file.path;
//         // let filename = req.file.filename;
//         // console.log(url,"..",filename);
//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id ;
//         newListing.image = {url,filename};

//         newListing.geometry = response.body.features[0].geometry;

//         const savedListing = await newListing.save();
//         // console.log(savedListing);
//         // req.flash("success","New listing created");
//         // res.redirect("/listings");
//         res.status(201).json({
//         message: "New listing created successfully",
//         listing: savedListing
//         }); 
//     } catch(err){
//         next(err);
//     }
// }


// module.exports.renderEditForm = async(req,res)=>{
//     let{id} = req.params;
//     const listing = await Listing.findById(id) ;
//     if(!listing){
//         // req.flash("error","Lisitng you requested for does not exist!");
//         // res.redirect("/listings");
//         return res.status(404).json({error: "Listing not found"});
//     }

//     let originalImageUrl = listing.image.url ;
//     originalImageUrl = originalImageUrl.replace("/upload" , "/upload/h_300,w_250");

//     // res.render("listings/edit.ejs",{listing , originalImageUrl}) ;
//     res.json({listing , originalImageUrl}) ;
// }


// module.exports.updateListing = async(req,res)=>{
//     let{id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

//     if(req.file){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url , filename};
//         await listing.save();
//     }

//     // req.flash("success","Listing Updated"); 
//     // res.redirect(`/listings/${id}`);
//     res.json({message:"Listing updated", listing});
// }


// module.exports.destroyListing = async (req,res)=>{
//     let{id} = req.params;
//     await Listing.findByIdAndDelete(id);
//     // req.flash("success","Listing Deleted!");
//     // res.redirect("/listings");
//     res.json({message:"Listing deleted"});
// }



const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig.js"); // ← add this line at the top

module.exports.index = async (req,res)=>{

    const { search } = req.query;

    let query = {};
    if (search) {
        query = {
        $or: [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ]
        };
    }

    const allListings = await Listing.find(query);
    res.json(allListings);
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params ;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner") ;
    if(!listing){
        return res.status(404).json({error: "Listing not found"});
    }
    console.log(listing);
    res.json({listing}) ;
}

module.exports.createListing = async (req, res, next) => {
  try {
    const response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    if (!response.body.features.length) {
      return res.status(400).json({ error: "Location not found. Please try a more specific location." });
    }

    // Must have at least 1 image (the main one)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.images = images;
    newListing.geometry = response.body.features[0].geometry;

    const savedListing = await newListing.save();
    res.status(201).json({
      message: "New listing created successfully",
      listing: savedListing
    });
  } catch (err) {
    next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ listing });
};

// ✅ FIXED: Now updates geometry when location changes
module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Update geometry if location changed
    if (req.body.listing.location && req.body.listing.location !== listing.location) {
      const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send();

      if (!response.body.features.length) {
        return res.status(400).json({ error: "Location not found." });
      }

      req.body.listing.geometry = response.body.features[0].geometry;
    }

    // Update basic fields
    const { title, description, location, country, price, geometry } = req.body.listing;
    listing = await Listing.findByIdAndUpdate(
      id,
      { title, description, location, country, price, geometry },
      { new: true }
    );

    // Delete images the user wants removed (but never delete the main/first image)
    if (req.body.deleteImages && req.body.deleteImages.length > 0) {
      const mainImageFilename = listing.images[0]?.filename;

      for (let filename of req.body.deleteImages) {
        if (filename === mainImageFilename) continue; // protect main photo
        await cloudinary.uploader.destroy(filename);
      }

      await listing.updateOne({
        $pull: {
          images: {
            filename: {
              $in: req.body.deleteImages.filter(f => f !== mainImageFilename)
            }
          }
        }
      });
    }

    // Add new images (enforce 5 max total)
    if (req.files && req.files.length > 0) {
      const currentCount = listing.images.length;
      const remainingSlots = 5 - currentCount;

      if (remainingSlots <= 0) {
        return res.status(400).json({ error: "Maximum 5 images allowed. Delete some first." });
      }

      const newImages = req.files
        .slice(0, remainingSlots) // only take what fits
        .map(f => ({ url: f.path, filename: f.filename }));

      await listing.updateOne({ $push: { images: { $each: newImages } } });
    }

    const updatedListing = await Listing.findById(id);
    res.json({ message: "Listing updated successfully", listing: updatedListing });

  } catch (err) {
    next(err);
  }
};

module.exports.destroyListing = async (req,res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.json({message:"Listing deleted"});
}