import { useState, useRef, useEffect } from "react";
import api from "../api/api";
import ListingCard from "./ListingCard";

const SUGGESTIONS = [
    "Peaceful mountain cabin with snow views under ₹8000",
    "Luxury beachfront villa in India",
    "Cozy forest treehouse for a weekend getaway",
    "Budget desert camping experience",
    "Romantic lakeside cottage under ₹4000 per night",
    "Urban loft in a major city for business travel",
];

const CATEGORY_LABELS = {
    mountains: "🏔️ Mountains", arctic: "🌨️ Arctic", farms: "🌾 Farms",
    deserts: "🏜️ Deserts", beaches: "🏖️ Beaches", cities: "🏙️ Cities",
    forests: "🌲 Forests", lakes: "🏞️ Lakes",
};

export default function AISearchPanel({ onClose }) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);   // null = not searched yet
    const [filters, setFilters] = useState(null);
    const [error, setError] = useState("");
    const textareaRef = useRef(null);

    // Autofocus on open
    useEffect(() => { textareaRef.current?.focus(); }, []);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleSearch = async (q = query) => {
        if (!q.trim()) return;
        setQuery(q);
        setLoading(true);
        setError("");
        setResults(null);
        setFilters(null);

        try {
            const res = await api.post("/ai/search", { query: q.trim() });
            setResults(res.data.listings);
            setFilters(res.data.filters);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "AI search failed.";
            const details = err.response?.data?.details || "";
            setError(details ? `${errorMsg} (${details})` : errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Panel */}
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <h2 className="text-white text-xl font-bold">AI-Powered Search</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-violet-200 text-sm">
                        Describe your perfect stay in plain English — the AI will find matching listings for you.
                    </p>
                </div>

                {/* Input area */}
                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            rows={3}
                            placeholder="e.g. I want a cozy mountain cabin under ₹8000 per night with snow views..."
                            className="w-full border border-gray-200 rounded-xl p-4 pr-14 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm leading-relaxed"
                        />
                        <button
                            onClick={() => handleSearch()}
                            disabled={loading || !query.trim()}
                            className="absolute bottom-3 right-3 bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Quick suggestions */}
                    {!results && !loading && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSearch(s)}
                                        className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results area */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">

                    {/* Loading state */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <svg className="animate-spin w-10 h-10 mb-4 text-violet-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">AI is understanding your preferences…</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* What AI understood */}
                    {filters && !loading && (
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-5">
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">AI understood:</p>
                            <p className="text-sm text-violet-800 mb-3">{filters.reason}</p>
                            <div className="flex flex-wrap gap-2">
                                {filters.category && (
                                    <span className="bg-violet-100 text-violet-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        {CATEGORY_LABELS[filters.category] || filters.category}
                                    </span>
                                )}
                                {filters.maxPrice && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        Max ₹{filters.maxPrice.toLocaleString()}/night
                                    </span>
                                )}
                                {filters.minPrice && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        Min ₹{filters.minPrice.toLocaleString()}/night
                                    </span>
                                )}
                                {filters.locationKeyword && (
                                    <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        📍 {filters.locationKeyword}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Listings grid */}
                    {results && !loading && (
                        results.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    Found <strong className="text-gray-800">{results.length}</strong> matching listing{results.length !== 1 ? "s" : ""}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {results.map(l => (
                                        <div key={l._id} onClick={onClose}>
                                            <ListingCard listing={l} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-4">🤔</div>
                                <p className="text-gray-600 font-medium">No listings matched your preferences</p>
                                <p className="text-gray-400 text-sm mt-1">Try being more general or adjust the price range</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out forwards; }
      `}</style>
        </div>
    );
}
