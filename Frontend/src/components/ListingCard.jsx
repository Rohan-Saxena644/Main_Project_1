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
    <Link to={`/listings/${listing._id}`} className="block group h-full">
      {/* 
        Key fix: the outer div uses flex + flex-col + h-full so all cards in a 
        grid row stretch to the same height. The bottom price section is always 
        pinned at the bottom with mt-auto.
      */}
      <div className="h-full flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white">

        {/* Fixed-ratio image – always the same height, never distorted */}
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] w-full">
            <img
              src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          {/* Category badge */}
          {listing.category && (
            <span className="absolute top-3 left-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {CATEGORY_LABELS[listing.category] || listing.category}
            </span>
          )}
        </div>

        {/* Card body – flex-grow so it fills remaining space */}
        <div className="flex flex-col flex-grow p-4">
          {/* Title – clamp to 2 lines so long titles don't push content down */}
          <h2 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
            {listing.title}
          </h2>
          {/* Location */}
          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
            {listing.location}, {listing.country}
          </p>

          {/* Price pinned to bottom */}
          <p className="font-bold text-gray-900 mt-auto pt-3">
            ₹{listing.price.toLocaleString("en-IN")}
            <span className="font-normal text-gray-500 text-sm"> / night</span>
          </p>
        </div>

      </div>
    </Link>
  );
}
