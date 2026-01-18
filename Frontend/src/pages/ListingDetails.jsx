import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import mapboxgl from "mapbox-gl";
import { useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAP_TOKEN;


export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const mapContainer = useRef(null);

  // Fetch listing
  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data.listing))
      .catch(() => navigate("/notfound"));
  }, [id, navigate]);

//   useEffect(() => {
//   if (!listing) return;

//   const map = new mapboxgl.Map({
//     container: mapContainer.current,
//     style: "mapbox://styles/mapbox/streets-v11",
//     center: listing.geometry?.coordinates,
//     zoom: 9
//   });

//   new mapboxgl.Marker()
//     .setLngLat(listing.geometry?.coordinates)
//     .addTo(map);

//   return () => map.remove();
// }, [listing]);


useEffect(() => {
  // HARD GUARD — do nothing unless coordinates exist
  if (
    !listing ||
    !listing.geometry ||
    !listing.geometry.coordinates ||
    listing.geometry.coordinates.length !== 2
  ) {
    return;
  }

  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/streets-v11",
    center: listing.geometry.coordinates, // guaranteed valid now
    zoom: 9
  });

  new mapboxgl.Marker()
    .setLngLat(listing.geometry.coordinates)
    .addTo(map);

  return () => map.remove();
}, [listing]);



  // Add review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    await api.post(`/listings/${id}/reviews`, {
      review: { rating, comment: reviewText }
    });

    const res = await api.get(`/listings/${id}`);
    setListing(res.data.listing);

    setReviewText("");
    setRating(5);
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    await api.delete(`/listings/${id}/reviews/${reviewId}`);

    const res = await api.get(`/listings/${id}`);
    setListing(res.data.listing);
  };

  // Delete listing
  const handleDeleteListing = async () => {
    await api.delete(`/listings/${id}`);
    navigate("/listings");
  };

  if (!listing) return <p className="p-6">Loading...</p>;

  // Check ownership
  const isOwner = user && listing.owner?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto p-6">

      <img 
        src={listing.image?.url || "https://img.freepik.com/free-photo/beautiful_1203-2633.jpg?semt=ais_hybrid&w=740&q=80"} // BUG FIXING REQUIRED
        className="w-full h-80 object-cover rounded"
      />

      <h1 className="text-3xl font-bold mt-4">{listing.title}</h1>
      <p className="text-gray-600">{listing.location}, {listing.country}</p>
      <p className="italic">By {listing.owner?.username}</p>
      <p className="mt-2">{listing.description}</p>
      <p className="mt-2 font-semibold">₹ {listing.price}</p>

      {/* OWNER ACTIONS */}
      {isOwner && (
        <div className="flex gap-3 mt-4">
          {/* Edit page can be built later */}
          <Link 
            to={`/listings/${id}/edit`} 
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Edit
          </Link>

          <button 
            onClick={handleDeleteListing}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      )}

      {/* REVIEWS */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Reviews</h2>

        {listing.reviews?.length === 0 && (  // BUG FIXING REQUIRED
          <p className="text-gray-500 mt-2">No reviews yet.</p>
        )}

        {listing.reviews?.map(r => (   // BUG FIXING REQUIRED
          <div key={r._id} className="border p-3 mt-3 rounded">
            <p className="font-semibold">
              {r.author.username} ⭐ {r.rating}
            </p>
            <p>{r.comment}</p>

            {/* Review owner delete */}
            {user && r.author._id === user._id && (
              <button
                onClick={() => handleDeleteReview(r._id)}
                className="text-red-500 text-sm mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADD REVIEW FORM */}
      {user ? (
        <form onSubmit={handleReviewSubmit} className="mt-6 space-y-3">
          <h3 className="text-xl font-semibold">Add Review</h3>

          <select 
            value={rating}
            onChange={(e)=>setRating(Number(e.target.value))}
            className="border p-2"
          >
            {[1,2,3,4,5].map(num=>(
              <option key={num} value={num}>{num}</option>
            ))}
          </select>

          <textarea 
            className="border p-2 w-full"
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e)=>setReviewText(e.target.value)}
            required
          />

          <button className="bg-black text-white px-4 py-2">
            Submit Review
          </button>
        </form>
      ) : (
        <p className="mt-6 text-gray-500">Login to add a review.</p>
      )}

      {/* <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Location</h2>
        <div 
            ref={mapContainer} 
            className="w-full h-64 rounded"
        />
      </div> */}
      
      <br></br>
      <br></br>
      <div>
        <p className="text-xl text-bold text-center italic ">You will be here</p>
      </div>

      <br></br>

      {listing.geometry?.coordinates ? (
        <div ref={mapContainer} className="w-full h-64 rounded" />
        ) : (
        <p className="text-gray-500 mt-4">Location not available</p>
      )}

    </div>
  );
}
