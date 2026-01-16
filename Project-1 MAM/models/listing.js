const mongoose = require("mongoose") ;
const Schema = mongoose.Schema ;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String ,
        required: true ,
    },
    description: String,
    image:{
        url: String,
        filename: String,
    },

    //     // default:
    //     //     "https://i.pinimg.com/736x/b8/6b/17/b86b170e78a07c37e8001350c92123bb.jpg",
    //     // set: (v)=>
    //     //     v==="" 
    //     //     ? "https://i.pinimg.com/736x/b8/6b/17/b86b170e78a07c37e8001350c92123bb.jpg"
    //     //     : v ,

    
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    geometry: {
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }   
    },

    // category:{
    //     type: String,
    //     enum: ["mountains","arctic","farms","deserts"]
    // } If you ever wanna implement the filter option to the listing also during creating a new listing you will need to add a category there as well
}) ;

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: { $in: listing.reviews}}); // Explain this to yourself
    }
});

const Listing = mongoose.model("Listing",listingSchema) ;
module.exports = Listing ;