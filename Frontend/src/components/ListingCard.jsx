import { Link } from "react-router-dom";

const CATEGORY_LABELS = {
  mountains: "🏔️ Mountains",
  arctic: "🌨️ Arctic",
  farms: "🌾 Farms",
  deserts: "🏜️ Deserts",
  beaches: "🏖️ Beaches",
  cities: "🏙️ Cities",
  forests: "🌲 Forests",
  lakes: "🏞️ Lakes",
};

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="border rounded overflow-hidden hover:shadow-lg transition group">

        <div className="relative">
          <img
            src={listing.images?.[0]?.url || "https://img.freepik.com/free-photo/beautiful_1203-2633.jpg?semt=ais_hybrid&w=740&q=80"}
            alt={listing.title}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.category && (
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {CATEGORY_LABELS[listing.category] || listing.category}
            </span>
          )}
        </div>

        <div className="p-3">
          <h2 className="font-semibold text-lg">{listing.title}</h2>
          <p className="text-gray-600 text-sm">
            {listing.location}, {listing.country}
          </p>
          <p className="font-bold mt-1">₹ {listing.price}</p>
        </div>

      </div>
    </Link>
  );
}
