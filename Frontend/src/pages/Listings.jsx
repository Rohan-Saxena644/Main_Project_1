import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loader";
import AISearchPanel from "../components/AISearchPanel";

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
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

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
      {/* ───── Category Filter Bar ───── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value || (cat.value === "all" && activeCategory === "all");
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border
                    transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700"
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

        {/* AI Search button row */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {(searchQuery || activeCategory !== "all") && (
              <>
                {searchQuery && <>Results for &ldquo;<strong className="text-gray-800">{searchQuery}</strong>&rdquo;</>}
                {searchQuery && activeCategory !== "all" && <span className="mx-1">·</span>}
                {activeCategory !== "all" && (
                  <>Category: <strong className="text-gray-800">{CATEGORIES.find(c => c.value === activeCategory)?.label}</strong></>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setAiPanelOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-violet-500/40 hover:scale-105 transition-all duration-200"
          >
            <span>✨</span>
            AI Search
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
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

      {/* AI Search Panel modal */}
      {aiPanelOpen && <AISearchPanel onClose={() => setAiPanelOpen(false)} />}

      {/* Hide scrollbar on category pills across browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
