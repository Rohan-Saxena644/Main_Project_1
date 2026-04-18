import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../api/api";

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");
    setCheckoutSuccess("");

    const results = await Promise.allSettled(
      cartItems.map((item) =>
        api.post("/bookings", {
          listingId: item.id,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
        })
      )
    );

    const successfulItems = [];
    const failedMessages = [];

    results.forEach((result, index) => {
      const item = cartItems[index];

      if (result.status === "fulfilled") {
        successfulItems.push(item);
      } else {
        failedMessages.push(
          `${item.listing.title}: ${result.reason?.response?.data?.error || "Booking failed"}`
        );
      }
    });

    successfulItems.forEach((item) => {
      removeFromCart(item.id, item.checkInDate);
    });

    if (successfulItems.length > 0) {
      setCheckoutSuccess(
        successfulItems.length === 1
          ? "Your booking was confirmed."
          : `${successfulItems.length} bookings were confirmed.`
      );
    }

    if (failedMessages.length > 0) {
      setCheckoutError(failedMessages.join(" "));
    }

    setIsSubmitting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {checkoutSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
              {checkoutSuccess}
            </div>
          )}
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start adding amazing places to your travel plans!</p>
          <Link 
            to="/listings"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="mt-4 sm:mt-0 text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Clear Cart
          </button>
        </div>

        {checkoutSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            {checkoutSuccess}
          </div>
        )}

        {checkoutError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {checkoutError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.checkInDate}-${index}`} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="flex flex-col sm:flex-row">
                  
                  {/* Image */}
                  <div className="sm:w-48 h-48 sm:h-auto">
                    <img 
                      src={item.listing.images?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                      alt={item.listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Link 
                          to={`/listings/${item.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition"
                        >
                          {item.listing.title}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">
                          📍 {item.listing.location}, {item.listing.country}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.checkInDate)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span className="font-semibold">Check-in:</span> {formatDate(item.checkInDate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span className="font-semibold">Check-out:</span> {formatDate(item.checkOutDate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                        <span className="font-semibold">{item.nights}</span> {item.nights === 1 ? 'night' : 'nights'}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">₹{item.pricePerNight} × {item.nights} nights</span>
                        <span className="text-2xl font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold">₹{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-bold text-blue-600">₹{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl mb-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Confirming Bookings..." : "Confirm Booking"}
              </button>

              <Link 
                to="/listings"
                className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>

              {!user && (
                <p className="text-sm text-gray-600 text-center mt-4">
                  Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to complete your booking
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
