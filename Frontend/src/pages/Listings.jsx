import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loader";
import AISearchPanel from "../components/AISearchPanel";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "mountains", label: "Mountains" },
  { value: "arctic", label: "Arctic" },
  { value: "farms", label: "Farms" },
  { value: "deserts", label: "Deserts" },
  { value: "beaches", label: "Beaches" },
  { value: "cities", label: "Cities" },
  { value: "forests", label: "Forests" },
  { value: "lakes", label: "Lakes" },
];

const PAGE_SIZE = 28;

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 1) return [1];

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  pages.add(currentPage - 1);
  pages.add(currentPage + 1);

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  sortedPages.forEach((page, index) => {
    const previous = sortedPages[index - 1];
    if (index > 0 && page - previous > 1) {
      items.push(`ellipsis-${previous}-${page}`);
    }
    items.push(page);
  });

  return items;
}

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "all";
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
        };

        if (searchQuery) params.search = searchQuery;
        if (activeCategory && activeCategory !== "all") params.category = activeCategory;

        const res = await api.get("/listings", { params });
        const data = res.data;
        const isLegacyArray = Array.isArray(data);
        const isLegacyObjectArray = !isLegacyArray && Array.isArray(data.allListings);
        const rawListingsData = isLegacyArray
          ? data
          : Array.isArray(data.listings)
          ? data.listings
          : isLegacyObjectArray
          ? data.allListings
          : [];

        const nextPagination =
          isLegacyArray || isLegacyObjectArray
            ? {
                page: currentPage,
                limit: PAGE_SIZE,
                total: rawListingsData.length,
                totalPages: Math.max(1, Math.ceil(rawListingsData.length / PAGE_SIZE)),
              }
            : data.pagination || {
                page: currentPage,
                limit: PAGE_SIZE,
                total: rawListingsData.length,
                totalPages: Math.max(1, Math.ceil(rawListingsData.length / PAGE_SIZE)),
              };

        const listingsData =
          isLegacyArray || isLegacyObjectArray
            ? rawListingsData.slice(
                (currentPage - 1) * PAGE_SIZE,
                currentPage * PAGE_SIZE
              )
            : rawListingsData;

        if (
          nextPagination.total > 0 &&
          listingsData.length === 0 &&
          currentPage > nextPagination.totalPages
        ) {
          updateParams((nextParams) => {
            nextParams.set("page", String(nextPagination.totalPages || 1));
          });
          return;
        }

        setListings(listingsData);
        setPagination(nextPagination);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setListings([]);
        setPagination({
          page: currentPage,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery, activeCategory, currentPage]);

  const updateParams = (mutator) => {
    const nextParams = new URLSearchParams(searchParams);
    mutator(nextParams);
    setSearchParams(nextParams);
  };

  const handleCategoryClick = (categoryValue) => {
    updateParams((params) => {
      if (categoryValue === "all") {
        params.delete("category");
      } else {
        params.set("category", categoryValue);
      }
      params.set("page", "1");
    });
  };

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > pagination.totalPages) {
      return;
    }

    updateParams((params) => {
      params.set("page", String(page));
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, pagination.totalPages),
    [currentPage, pagination.totalPages]
  );

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive =
                activeCategory === cat.value || (cat.value === "all" && activeCategory === "all");
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            {(searchQuery || activeCategory !== "all") && (
              <>
                {searchQuery && (
                  <>
                    Results for <strong className="text-gray-800">&ldquo;{searchQuery}&rdquo;</strong>
                  </>
                )}
                {searchQuery && activeCategory !== "all" && <span className="mx-1">-</span>}
                {activeCategory !== "all" && (
                  <>
                    Category: <strong className="text-gray-800">{CATEGORIES.find((c) => c.value === activeCategory)?.label}</strong>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {pagination.total > 0
                ? `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )} of ${pagination.total}`
                : "No listings yet"}
            </span>
            <button
              onClick={() => setAiPanelOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-violet-500/40 hover:scale-105 transition-all duration-200"
            >
              <span>AI</span>
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === "string" ? (
                      <span key={item} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`min-w-10 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          item === currentPage
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">No Results</div>
            <p className="text-lg font-medium">No listings found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </div>

      {aiPanelOpen && <AISearchPanel onClose={() => setAiPanelOpen(false)} />}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
