const fs = require("fs");
const path = require("path");

// Load your dataset
const sampleListings = require("./data.js").data;

// Convert image object -> just the url string
const updatedListings = sampleListings.map(listing => {
  return {
    ...listing,
    image: listing.image.url, // take only the url
  };
});

// Save to a new file
fs.writeFileSync(
  path.join(__dirname, "data_converted.js"),
  "module.exports = { data: " + JSON.stringify(updatedListings, null, 2) + " };"
);

console.log("✅ Converted data saved to data_converted.js");
