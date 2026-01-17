import { useEffect, useState } from "react";
import api from "../api/api";   // Axios instance

export default function Listings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    api.get("/listings")
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {listings.map(l => (
        <div key={l._id} className="border p-3 rounded">
          <img src={l.image.url} className="h-40 w-full object-cover"/>
          <h2 className="font-semibold">{l.title}</h2>
          <p>₹ {l.price}</p>
        </div>
      ))}
    </div>
  );
}
