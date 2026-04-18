import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loader";

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

export default function Profile() {
    const { username } = useParams();         // undefined  = own profile
    const { user: authUser } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [error, setError] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const isOwnProfile = !username || (authUser && authUser.username === username);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const endpoint = username ? `/profile/${username}` : "/profile";
                const res = await api.get(endpoint);
                setProfileData(res.data);

                if (!username) {
                    setBookingsLoading(true);
                    const bookingsRes = await api.get("/bookings/me", {
                        params: { page: 1, limit: 20, status: "all" }
                    });
                    setBookings(bookingsRes.data.bookings || []);
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate("/login");
                } else {
                    setError(err.response?.data?.error || "Profile not found");
                }
            } finally {
                setBookingsLoading(false);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, navigate]);

    const handleCancelBooking = async (bookingId) => {
        const confirmed = window.confirm("Do you want to cancel this booking?");
        if (!confirmed) return;

        try {
            setBookingError("");
            const res = await api.patch(`/bookings/${bookingId}/cancel`, {
                cancellationReason: "Cancelled by guest from profile",
            });

            setBookings((prev) =>
                prev.map((booking) =>
                    booking._id === bookingId ? res.data.booking : booking
                )
            );
        } catch (err) {
            setBookingError(err.response?.data?.error || "Unable to cancel booking right now");
        }
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
                    <Link to="/listings" className="text-blue-600 hover:underline">
                        Browse listings instead
                    </Link>
                </div>
            </div>
        );
    }

    const { user, listings } = profileData;

    // Category breakdown for stats
    const catCounts = listings.reduce((acc, l) => {
        acc[l.category] = (acc[l.category] || 0) + 1;
        return acc;
    }, {});

    // Filtered listings
    const visibleListings = activeFilter === "all"
        ? listings
        : listings.filter(l => l.category === activeFilter);

    // Initials avatar
    const initials = user.username.slice(0, 2).toUpperCase();

    // Random pastel gradient per user (deterministic from username)
    const gradients = [
        "from-violet-500 to-purple-700",
        "from-blue-500 to-cyan-600",
        "from-pink-500 to-rose-600",
        "from-amber-500 to-orange-600",
        "from-emerald-500 to-teal-600",
    ];
    const gradientClass = gradients[user.username.charCodeAt(0) % gradients.length];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero Banner ── */}
            <div className={`bg-gradient-to-r ${gradientClass} text-white`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm flex-shrink-0">
                            {initials}
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold mb-1">@{user.username}</h1>
                            {isOwnProfile && user.email && (
                                <p className="text-white/70 text-sm">{user.email}</p>
                            )}
                            <p className="text-white/80 text-sm mt-1">
                                {listings.length} listing{listings.length !== 1 ? "s" : ""} · Member of Wanderlust
                            </p>
                        </div>

                        {/* Edit / Add Listing CTA (own profile only) */}
                        {isOwnProfile && (
                            <div className="sm:ml-auto flex gap-3">
                                <Link
                                    to="/listings/new"
                                    className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition shadow-md"
                                >
                                    + Add Listing
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {isOwnProfile && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Your Bookings</h2>
                        </div>

                        {bookingError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                {bookingError}
                            </div>
                        )}

                        {bookingsLoading ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-gray-500">
                                Loading your bookings...
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="space-y-4 mb-8">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking._id}
                                        className="relative bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                                    >
                                        {booking.status === "confirmed" && (
                                            <button
                                                onClick={() => handleCancelBooking(booking._id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-2xl leading-none"
                                                aria-label="Cancel booking"
                                                title="Cancel booking"
                                            >
                                                ×
                                            </button>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            <img
                                                src={booking.listing?.images?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
                                                alt={booking.listing?.title || "Booked listing"}
                                                className="w-full sm:w-40 h-28 object-cover rounded-lg"
                                            />

                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {booking.listing?.title || "Listing"}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {booking.listing?.location}, {booking.listing?.country}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-700">
                                                    <p><span className="font-semibold">Check-in:</span> {formatDate(booking.checkInDate)}</p>
                                                    <p><span className="font-semibold">Check-out:</span> {formatDate(booking.checkOutDate)}</p>
                                                    <p><span className="font-semibold">Nights:</span> {booking.nights}</p>
                                                    <p><span className="font-semibold">Total:</span> ₹{booking.totalPrice?.toLocaleString("en-IN")}</p>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 font-medium ${
                                                            booking.status === "cancelled"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-emerald-100 text-emerald-700"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        Booking Code: {booking.bookingCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-gray-500 mb-8">
                                You have not booked any listings yet.
                            </div>
                        )}
                    </div>
                )}

                {/* ── Stats Row ── */}
                {listings.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                            <div className="text-3xl font-bold text-gray-900">{listings.length}</div>
                            <div className="text-sm text-gray-500 mt-1">Total Listings</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                            <div className="text-3xl font-bold text-gray-900">
                                ₹{Math.round(listings.reduce((s, l) => s + l.price, 0) / listings.length).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">Avg. Price / Night</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                            <div className="text-3xl font-bold text-gray-900">
                                {Object.keys(catCounts).length}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">Categories</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                            <div className="text-3xl font-bold text-gray-900">
                                {listings.reduce((s, l) => s + (l.reviews?.length || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">Total Reviews</div>
                        </div>
                    </div>
                )}

                {/* ── Listings Section ── */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isOwnProfile ? "My Listings" : `${user.username}'s Listings`}
                    </h2>
                </div>

                {/* Category filter pills (only show if there are listings in multiple categories) */}
                {listings.length > 0 && Object.keys(catCounts).length > 1 && (
                    <div className="flex gap-2 flex-wrap mb-6">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === "all"
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            All ({listings.length})
                        </button>
                        {Object.entries(catCounts).map(([cat, count]) => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === cat
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {CATEGORY_LABELS[cat] || cat} ({count})
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {visibleListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                        {visibleListings.map(l => (
                            <ListingCard key={l._id} listing={l} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-4">🏠</div>
                        <p className="text-lg font-medium text-gray-600">No listings yet</p>
                        {isOwnProfile && (
                            <Link
                                to="/listings/new"
                                className="mt-4 inline-block bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition"
                            >
                                Create your first listing
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
