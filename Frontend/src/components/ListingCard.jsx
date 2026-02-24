import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="border rounded overflow-hidden hover:shadow-lg transition">

        <img
          src={listing.images?.[0]?.url || "https://img.freepik.com/free-photo/beautiful_1203-2633.jpg?semt=ais_hybrid&w=740&q=80"}
          alt={listing.title}
          className="h-48 w-full object-cover"
        />

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
