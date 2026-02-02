// import { useEffect, useState } from "react";
// import api from "../api/api";   // Axios instance

// export default function Listings() {
//   const [listings, setListings] = useState([]);

//   useEffect(() => {
//     api.get("/listings")
//       .then(res => setListings(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
//       {listings.map(l => (
//         <div key={l._id} className="border p-3 rounded">
//           <img src={l.image.url} className="h-40 w-full object-cover"/>
//           <h2 className="font-semibold">{l.title}</h2>
//           <p>₹ {l.price}</p>
//         </div>
//       ))}
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import ListingCard from "../components/ListingCard"; // Keep your components!
import Loader from "../components/Loader";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Professional tip: Use URLSearchParams for cleaner URL building
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);

        const res = await api.get(`/listings?${params.toString()}`);
        
        // Handle different API response structures safely
        const data = res.data.allListings || res.data;
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery]); // Re-runs whenever the URL search param changes

  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {searchQuery && (
        <p className="col-span-full text-center text-gray-500">
          Showing results for “{searchQuery}”
        </p>
      )}
      {listings.length > 0 ? (
        listings.map(l => (
          <ListingCard key={l._id} listing={l} />
        ))
      ) : (
        <p className="col-span-full text-center py-10">No listings found.</p>
      )}
    </div>
  );
}

