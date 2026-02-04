// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import api from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import mapboxgl from "mapbox-gl";
// import { useRef } from "react";
// import "mapbox-gl/dist/mapbox-gl.css";

// mapboxgl.accessToken = import.meta.env.VITE_MAP_TOKEN;


// export default function ListingDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user , loading } = useAuth();

//   const [listing, setListing] = useState(null);
//   const [reviewText, setReviewText] = useState("");
//   const [rating, setRating] = useState(5);

//   const mapContainer = useRef(null);

//   // Fetch listing
//   useEffect(() => {
//     api.get(`/listings/${id}`)
//       .then(res => setListing(res.data.listing))
//       .catch(() => navigate("/notfound"));
//   }, [id, navigate]);

// //   useEffect(() => {
// //   if (!listing) return;

// //   const map = new mapboxgl.Map({
// //     container: mapContainer.current,
// //     style: "mapbox://styles/mapbox/streets-v11",
// //     center: listing.geometry?.coordinates,
// //     zoom: 9
// //   });

// //   new mapboxgl.Marker()
// //     .setLngLat(listing.geometry?.coordinates)
// //     .addTo(map);

// //   return () => map.remove();
// // }, [listing]);


// useEffect(() => {
//   // HARD GUARD — do nothing unless coordinates exist
//   if (
//     !listing ||
//     !listing.geometry ||
//     !listing.geometry.coordinates ||
//     listing.geometry.coordinates.length !== 2
//   ) {
//     return;
//   }

//   const map = new mapboxgl.Map({
//     container: mapContainer.current,
//     style: "mapbox://styles/mapbox/streets-v11",
//     center: listing.geometry.coordinates, // guaranteed valid now
//     zoom: 9
//   });

//   new mapboxgl.Marker()
//     .setLngLat(listing.geometry.coordinates)
//     .addTo(map);

//   return () => map.remove();
// }, [listing]);



//   // Add review
//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();

//     await api.post(`/listings/${id}/reviews`, {
//       review: { rating, comment: reviewText }
//     });

//     const res = await api.get(`/listings/${id}`);
//     setListing(res.data.listing);

//     setReviewText("");
//     setRating(5);
//   };

//   // Delete review
//   const handleDeleteReview = async (reviewId) => {
//     await api.delete(`/listings/${id}/reviews/${reviewId}`);

//     const res = await api.get(`/listings/${id}`);
//     setListing(res.data.listing);
//   };

//   // Delete listing
//   const handleDeleteListing = async () => {
//     await api.delete(`/listings/${id}`);
//     navigate("/listings");
//   };

//   if (loading) {
//     return <p className="p-6">Loading user...</p>;
//   }

//   if (!listing) return <p className="p-6">Loading...</p>;

//   // Check ownership
//   const isOwner = user && listing.owner?._id === user._id;

//   return (
//     <div className="max-w-4xl mx-auto p-6">

//       <img 
//         src={listing.image?.url || "https://img.freepik.com/free-photo/beautiful_1203-2633.jpg?semt=ais_hybrid&w=740&q=80"} // BUG FIXING REQUIRED
//         className="w-full h-80 object-cover rounded"
//       />

//       <h1 className="text-3xl font-bold mt-4">{listing.title}</h1>
//       <p className="text-gray-600">{listing.location}, {listing.country}</p>
//       <p className="italic">By {listing.owner?.username}</p>
//       <p className="mt-2">{listing.description}</p>
//       <p className="mt-2 font-semibold">₹ {listing.price}</p>

//       {/* OWNER ACTIONS */}
//       {isOwner && (
//         <div className="flex gap-3 mt-4">
//           {/* Edit page can be built later */}
//           <Link 
//             to={`/listings/${id}/edit`} 
//             className="bg-blue-500 text-white px-3 py-1 rounded"
//           >
//             Edit
//           </Link>

//           <button 
//             onClick={handleDeleteListing}
//             className="bg-red-500 text-white px-3 py-1 rounded"
//           >
//             Delete
//           </button>
//         </div>
//       )}

//       {/* REVIEWS */}
//       <div className="mt-8">
//         <h2 className="text-2xl font-semibold">Reviews</h2>

//         {listing.reviews?.length === 0 && (  // BUG FIXING REQUIRED
//           <p className="text-gray-500 mt-2">No reviews yet.</p>
//         )}

//         {listing.reviews?.map(r => (   // BUG FIXING REQUIRED
//           <div key={r._id} className="border p-3 mt-3 rounded">
//             <p className="font-semibold">
//               {r.author.username} ⭐ {r.rating}
//             </p>
//             <p>{r.comment}</p>

//             {/* Review owner delete */}
//             {user && r.author._id === user._id && (
//               <button
//                 onClick={() => handleDeleteReview(r._id)}
//                 className="text-red-500 text-sm mt-1"
//               >
//                 Delete
//               </button>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* ADD REVIEW FORM */}
//       {user ? (
//         <form onSubmit={handleReviewSubmit} className="mt-6 space-y-3">
//           <h3 className="text-xl font-semibold">Add Review</h3>

//           <select 
//             value={rating}
//             onChange={(e)=>setRating(Number(e.target.value))}
//             className="border p-2"
//           >
//             {[1,2,3,4,5].map(num=>(
//               <option key={num} value={num}>{num}</option>
//             ))}
//           </select>

//           <textarea 
//             className="border p-2 w-full"
//             placeholder="Write your review..."
//             value={reviewText}
//             onChange={(e)=>setReviewText(e.target.value)}
//             required
//           />

//           <button className="bg-black text-white px-4 py-2">
//             Submit Review
//           </button>
//         </form>
//       ) : (
//         <p className="mt-6 text-gray-500">Login to add a review.</p>
//       )}

//       {/* <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-2">Location</h2>
//         <div 
//             ref={mapContainer} 
//             className="w-full h-64 rounded"
//         />
//       </div> */}
      
//       <br></br>
//       <br></br>
//       <div>
//         <p className="text-xl text-bold text-center italic ">You will be here</p>
//       </div>

//       <br></br>

//       {listing.geometry?.coordinates ? (
//         <div ref={mapContainer} className="w-full h-64 rounded" />
//         ) : (
//         <p className="text-gray-500 mt-4">Location not available</p>
//       )}

//     </div>
//   );
// }


// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import api from "../api/api";
// import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

// mapboxgl.accessToken = import.meta.env.VITE_MAP_TOKEN;

// export default function ListingDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, loading } = useAuth();
//   const { addToCart } = useCart();

//   const [listing, setListing] = useState(null);
//   const [reviewText, setReviewText] = useState("");
//   const [rating, setRating] = useState(5);
//   const [hoveredStar, setHoveredStar] = useState(0);
//   const [checkInDate, setCheckInDate] = useState("");
//   const [checkOutDate, setCheckOutDate] = useState("");

//   const mapContainer = useRef(null);
//   const mapInstance = useRef(null);

//   const calculateNights = () => {
//     if (!checkInDate || !checkOutDate) return 0;
//     const diffTime = new Date(checkOutDate) - new Date(checkInDate);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays > 0 ? diffDays : 0;
//   };

//   const handleAddToCart = () => {
//     if (!checkInDate || !checkOutDate) {
//       alert("Please select check-in and check-out dates");
//       return;
//     }
    
//     const nights = calculateNights();
//     if (nights <= 0) {
//       alert("Check-out date must be after check-in date");
//       return;
//     }

//     addToCart(listing, checkInDate, checkOutDate, nights);
//     alert("Added to cart! 🎉");
//   };

//   // Fetch listing
//   useEffect(() => {
//     api.get(`/listings/${id}`)
//       .then(res => setListing(res.data.listing))
//       .catch(() => navigate("/notfound"));
//   }, [id, navigate]);

//   // Map initialization
//   useEffect(() => {
//     if (
//       !listing ||
//       !listing.geometry ||
//       !listing.geometry.coordinates ||
//       listing.geometry.coordinates.length !== 2
//     ) {
//       return;
//     }

//     if (mapInstance.current) {
//       mapInstance.current.remove();
//     }

//     const map = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v12",
//       center: listing.geometry.coordinates,
//       zoom: 12
//     });

//     new mapboxgl.Marker({ color: "#ef4444" })
//       .setLngLat(listing.geometry.coordinates)
//       .setPopup(
//         new mapboxgl.Popup({ offset: 25 })
//           .setHTML(`<h3 class="font-bold">${listing.title}</h3><p>${listing.location}</p>`)
//       )
//       .addTo(map);

//     map.addControl(new mapboxgl.NavigationControl());

//     mapInstance.current = map;

//     return () => {
//       if (mapInstance.current) {
//         mapInstance.current.remove();
//       }
//     };
//   }, [listing?.geometry?.coordinates, listing?.title, listing?.location]);

//   // Add review
//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();

//     await api.post(`/listings/${id}/reviews`, {
//       review: { rating, comment: reviewText }
//     });

//     const res = await api.get(`/listings/${id}`);
//     setListing(res.data.listing);

//     setReviewText("");
//     setRating(5);
//   };

//   // Delete review
//   const handleDeleteReview = async (reviewId) => {
//     await api.delete(`/listings/${id}/reviews/${reviewId}`);

//     const res = await api.get(`/listings/${id}`);
//     setListing(res.data.listing);
//   };

//   // Delete listing
//   const handleDeleteListing = async () => {
//     if (window.confirm("Are you sure you want to delete this listing?")) {
//       await api.delete(`/listings/${id}`);
//       navigate("/listings");
//     }
//   };

//   // Star rating component
//   const StarRating = ({ value, onChange, readonly = false }) => {
//     return (
//       <div className="flex gap-1">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <button
//             key={star}
//             type="button"
//             disabled={readonly}
//             onClick={() => !readonly && onChange(star)}
//             onMouseEnter={() => !readonly && setHoveredStar(star)}
//             onMouseLeave={() => !readonly && setHoveredStar(0)}
//             className={`text-2xl transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
//           >
//             {star <= (hoveredStar || value) ? '⭐' : '☆'}
//           </button>
//         ))}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl">Loading...</div>
//       </div>
//     );
//   }

//   if (!listing) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl">Loading listing...</div>
//       </div>
//     );
//   }

//   const isOwner = user && listing.owner?._id === user._id;

//   // Calculate average rating
//   const avgRating = listing.reviews?.length > 0
//     ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
//     : 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
//         {/* Image Section */}
//         <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
//           <img 
//             src={listing.image?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"}
//             alt={listing.title}
//             className="w-full h-[400px] sm:h-[500px] object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
//           {/* Title Overlay */}
//           <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
//             <h1 className="text-3xl sm:text-5xl font-bold mb-2">{listing.title}</h1>
//             <div className="flex items-center gap-4 text-sm sm:text-base">
//               <span className="flex items-center gap-1">
//                 📍 {listing.location}, {listing.country}
//               </span>
//               {listing.reviews?.length > 0 && (
//                 <span className="flex items-center gap-1">
//                   ⭐ {avgRating} ({listing.reviews.length} reviews)
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
          
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Info Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <p className="text-gray-600 text-sm">Hosted by</p>
//                   <p className="text-lg font-semibold">{listing.owner?.username}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-3xl font-bold text-gray-900">₹{listing.price}</p>
//                   <p className="text-sm text-gray-500">per night</p>
//                 </div>
//               </div>
              
//               <div className="border-t pt-4">
//                 <h2 className="text-xl font-semibold mb-3">About this place</h2>
//                 <p className="text-gray-700 leading-relaxed">{listing.description}</p>
//               </div>

//               {/* Owner Actions */}
//               {isOwner && (
//                 <div className="flex gap-3 mt-6 pt-6 border-t">
//                   <Link 
//                     to={`/listings/${id}/edit`} 
//                     className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
//                   >
//                     ✏️ Edit Listing
//                   </Link>
//                   <button 
//                     onClick={handleDeleteListing}
//                     className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Map Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-2xl font-semibold mb-4">📍 Where you'll be</h2>
//               {listing.geometry?.coordinates ? (
//                 <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
//               ) : (
//                 <p className="text-gray-500 text-center py-8">Location not available</p>
//               )}
//             </div>

//             {/* Reviews Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-semibold">
//                   ⭐ Reviews {listing.reviews?.length > 0 && `(${listing.reviews.length})`}
//                 </h2>
//                 {listing.reviews?.length > 0 && (
//                   <div className="text-right">
//                     <div className="text-3xl font-bold">{avgRating}</div>
//                     <div className="text-sm text-gray-500">Average rating</div>
//                   </div>
//                 )}
//               </div>

//               {listing.reviews?.length === 0 ? (
//                 <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
//               ) : (
//                 <div className="space-y-4">
//                   {listing.reviews.map(r => (
//                     <div key={r._id} className="border-b pb-4 last:border-b-0">
//                       <div className="flex items-start justify-between mb-2">
//                         <div>
//                           <p className="font-semibold text-lg">{r.author.username}</p>
//                           <StarRating value={r.rating} readonly={true} />
//                         </div>
//                         {user && r.author._id === user._id && (
//                           <button
//                             onClick={() => handleDeleteReview(r._id)}
//                             className="text-red-500 hover:text-red-700 text-sm font-medium"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                       <p className="text-gray-700 mt-2">{r.comment}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Add Review Form - Now in Main Content (Mobile Responsive) */}
//             <div className="bg-white rounded-xl shadow-lg p-6 lg:hidden">
//               {user ? (
//                 <form onSubmit={handleReviewSubmit} className="space-y-4">
//                   <h3 className="text-xl font-semibold">Leave a Review</h3>
                  
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Your Rating</label>
//                     <StarRating 
//                       value={rating}
//                       onChange={setRating}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">Your Review</label>
//                     <textarea 
//                       className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                       placeholder="Share your experience..."
//                       rows="5"
//                       value={reviewText}
//                       onChange={(e) => setReviewText(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <button 
//                     type="submit"
//                     className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
//                   >
//                     Submit Review
//                   </button>
//                 </form>
//               ) : (
//                 <div className="text-center py-8">
//                   <p className="text-gray-600 mb-4">Login to leave a review</p>
//                   <Link 
//                     to="/login"
//                     className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
//                   >
//                     Login
//                   </Link>
//                 </div>
//               )}
//             </div>

//           </div>

//           {/* Sidebar - Only Booking Card (Sticky) */}
//           <div className="lg:col-span-1">
            
//             {/* Booking Card - Sticky */}
//             <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <span className="text-3xl font-bold text-gray-900">₹{listing.price}</span>
//                   <span className="text-gray-600"> / night</span>
//                 </div>
//                 {avgRating > 0 && (
//                   <div className="text-right">
//                     <div className="flex items-center gap-1">
//                       <span className="text-xl font-bold">⭐ {avgRating}</span>
//                     </div>
//                     <div className="text-xs text-gray-500">{listing.reviews?.length} reviews</div>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-gray-700">Check-in</label>
//                   <input
//                     type="date"
//                     value={checkInDate}
//                     onChange={(e) => setCheckInDate(e.target.value)}
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-gray-700">Check-out</label>
//                   <input
//                     type="date"
//                     value={checkOutDate}
//                     onChange={(e) => setCheckOutDate(e.target.value)}
//                     min={checkInDate || new Date().toISOString().split('T')[0]}
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                   />
//                 </div>

//                 {calculateNights() > 0 && (
//                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
//                     <div className="flex justify-between text-sm text-gray-700">
//                       <span>₹{listing.price} × {calculateNights()} nights</span>
//                       <span className="font-semibold">₹{(listing.price * calculateNights()).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between text-sm text-gray-700 border-t pt-2">
//                       <span className="font-semibold">Total</span>
//                       <span className="font-bold text-lg">₹{(listing.price * calculateNights()).toLocaleString()}</span>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={handleAddToCart}
//                   disabled={!user}
//                   className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//                 >
//                   {user ? '🛒 Add to Cart' : 'Login to Book'}
//                 </button>

//                 {!user && (
//                   <p className="text-center text-sm text-gray-600">
//                     <Link to="/login" className="text-blue-600 hover:underline font-medium">
//                       Sign in
//                     </Link> to book this listing
//                   </p>
//                 )}

//                 {user && (
//                   <Link 
//                     to="/cart"
//                     className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
//                   >
//                     View Cart
//                   </Link>
//                 )}
//               </div>

//               {/* Divider */}
//               <div className="border-t my-6"></div>

//               {/* Review Form - Desktop Only (Non-Sticky, below booking) */}
//               <div className="hidden lg:block">
//                 {user ? (
//                   <form onSubmit={handleReviewSubmit} className="space-y-4">
//                     <h3 className="text-xl font-semibold">Leave a Review</h3>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2">Your Rating</label>
//                       <StarRating 
//                         value={rating}
//                         onChange={setRating}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2">Your Review</label>
//                       <textarea 
//                         className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="Share your experience..."
//                         rows="5"
//                         value={reviewText}
//                         onChange={(e) => setReviewText(e.target.value)}
//                         required
//                       />
//                     </div>

//                     <button 
//                       type="submit"
//                       className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
//                     >
//                       Submit Review
//                     </button>
//                   </form>
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-600 mb-4">Login to leave a review</p>
//                     <Link 
//                       to="/login"
//                       className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
//                     >
//                       Login
//                     </Link>
//                   </div>
//                 )}
//               </div>

//             </div>

//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAP_TOKEN;

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { addToCart } = useCart();

  const [listing, setListing] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = new Date(checkOutDate) - new Date(checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleAddToCart = () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }
    
    const nights = calculateNights();
    if (nights <= 0) {
      alert("Check-out date must be after check-in date");
      return;
    }

    addToCart(listing, checkInDate, checkOutDate, nights);
    alert("Added to cart! 🎉");
  };

  // Fetch listing
  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data.listing))
      .catch(() => navigate("/notfound"));
  }, [id, navigate]);

  // Map initialization - FIXED
  useEffect(() => {
    // Guard clauses
    if (
      !listing ||
      !listing.geometry ||
      !listing.geometry.coordinates ||
      listing.geometry.coordinates.length !== 2 ||
      !mapContainer.current
    ) {
      return;
    }

    // Remove existing map safely
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
        mapInstance.current = null;
      } catch (error) {
        console.log('Map cleanup error:', error);
        mapInstance.current = null;
      }
    }

    // Small delay to ensure container is ready
    const timeoutId = setTimeout(() => {
      if (!mapContainer.current) return;

      try {
        // Create new map with updated coordinates
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: listing.geometry.coordinates,
          zoom: 12
        });

        // Add marker
        new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat(listing.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3 class="font-bold">${listing.title}</h3><p>${listing.location}</p>`)
          )
          .addTo(map);

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());

        mapInstance.current = map;
      } catch (error) {
        console.log('Map initialization error:', error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (error) {
          console.log('Map cleanup error:', error);
          mapInstance.current = null;
        }
      }
    };
  }, [listing?.geometry?.coordinates, listing?.title, listing?.location]);

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
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await api.delete(`/listings/${id}`);
      navigate("/listings");
    }
  };

  // Star rating component
  const StarRating = ({ value, onChange, readonly = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHoveredStar(star)}
            onMouseLeave={() => !readonly && setHoveredStar(0)}
            className={`text-2xl transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            {star <= (hoveredStar || value) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading listing...</div>
      </div>
    );
  }

  const isOwner = user && listing.owner?._id === user._id;

  // Calculate average rating
  const avgRating = listing.reviews?.length > 0
    ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Image Section */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8">
          <img 
            src={listing.image?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"}
            alt={listing.title}
            className="w-full h-[400px] sm:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <h1 className="text-3xl sm:text-5xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center gap-4 text-sm sm:text-base">
              <span className="flex items-center gap-1">
                📍 {listing.location}, {listing.country}
              </span>
              {listing.reviews?.length > 0 && (
                <span className="flex items-center gap-1">
                  ⭐ {avgRating} ({listing.reviews.length} reviews)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Hosted by</p>
                  <p className="text-lg font-semibold">{listing.owner?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">₹{listing.price}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-3">About this place</h2>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Link 
                    to={`/listings/${id}/edit`} 
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
                  >
                    ✏️ Edit Listing
                  </Link>
                  <button 
                    onClick={handleDeleteListing}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">📍 Where you'll be</h2>
              {listing.geometry?.coordinates ? (
                <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
              ) : (
                <p className="text-gray-500 text-center py-8">Location not available</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  ⭐ Reviews {listing.reviews?.length > 0 && `(${listing.reviews.length})`}
                </h2>
                {listing.reviews?.length > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-bold">{avgRating}</div>
                    <div className="text-sm text-gray-500">Average rating</div>
                  </div>
                )}
              </div>

              {listing.reviews?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {listing.reviews.map(r => (
                    <div key={r._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg">{r.author.username}</p>
                          <StarRating value={r.rating} readonly={true} />
                        </div>
                        {user && r.author._id === user._id && (
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Review Form - Mobile Only */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:hidden">
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-xl font-semibold">Leave a Review</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <StarRating 
                      value={rating}
                      onChange={setRating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Share your experience..."
                      rows="5"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Login to leave a review</p>
                  <Link 
                    to="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            
            {/* Booking Card - Sticky */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-3xl font-bold text-gray-900">₹{listing.price}</span>
                  <span className="text-gray-600"> / night</span>
                </div>
                {avgRating > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold">⭐ {avgRating}</span>
                    </div>
                    <div className="text-xs text-gray-500">{listing.reviews?.length} reviews</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Check-in</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Check-out</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {calculateNights() > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>₹{listing.price} × {calculateNights()} nights</span>
                      <span className="font-semibold">₹{(listing.price * calculateNights()).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 border-t pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">₹{(listing.price * calculateNights()).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!user}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {user ? '🛒 Add to Cart' : 'Login to Book'}
                </button>

                {!user && (
                  <p className="text-center text-sm text-gray-600">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                      Sign in
                    </Link> to book this listing
                  </p>
                )}

                {user && (
                  <Link 
                    to="/cart"
                    className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    View Cart
                  </Link>
                )}
              </div>

              {/* Divider */}
              <div className="border-t my-6"></div>

              {/* Review Form - Desktop Only */}
              <div className="hidden lg:block">
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <h3 className="text-xl font-semibold">Leave a Review</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Rating</label>
                      <StarRating 
                        value={rating}
                        onChange={setRating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Share your experience..."
                        rows="5"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Login to leave a review</p>
                    <Link 
                      to="/login"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}