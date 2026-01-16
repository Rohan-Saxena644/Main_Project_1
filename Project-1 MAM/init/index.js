const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to db");
}).catch((err)=>{
    console.log(err);
}) ;

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initdb = async()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj , owner: '68fcf3abdb8bc4164c989135'}));
    await Listing.insertMany(initdata.data);
    console.log("data was initialized") ;
}

initdb() ;