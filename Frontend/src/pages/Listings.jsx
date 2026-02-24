import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loader";

const CATEGORIES = [
  { value: "all", label: "🌍 All" },
  { value: "mountains", label: "🏔️ Mountains" },
  { value: "arctic", label: "🌨️ Arctic" },
  { value: "farms", label: "🌾 Farms" },
  { value: "deserts", label: "🏜️ Deserts" },
  { value: "beaches", label: "🏖️ Beaches" },
  { value: "cities", label: "🏙️ Cities" },
  { value: "forests", label: "🌲 Forests" },
  { value: "lakes", label: "🏞️ Lakes" },
];

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (activeCategory && activeCategory !== "all") params.append("category", activeCategory);

        const res = await api.get(`/listings?${params.toString()}`);
        const data = res.data.allListings || res.data;
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery, activeCategory]);

  const handleCategoryClick = (categoryValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryValue === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryValue);
    }
    setSearchParams(newParams);
  };

  return (
    <div>
      {/* ───── Category Filter Bar ─────
          NOT sticky — sits right below the Navbar, scrolls away with the page.
          The bar is intentionally understated: smaller text, lighter weight
          than the Navbar so the Navbar remains dominant.
      */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value || (cat.value === "all" && activeCategory === "all");
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`
                    flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── Listings Grid ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Context label */}
        {(searchQuery || activeCategory !== "all") && (
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery && <>Results for &ldquo;<strong>{searchQuery}</strong>&rdquo;</>}
            {searchQuery && activeCategory !== "all" && <span className="mx-1">·</span>}
            {activeCategory !== "all" && (
              <>Category: <strong>{CATEGORIES.find(c => c.value === activeCategory)?.label}</strong></>
            )}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(l => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">No listings found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* Hide scrollbar on category pills across browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
