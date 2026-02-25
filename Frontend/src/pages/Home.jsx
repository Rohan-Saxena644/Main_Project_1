import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ""}`);
  };

  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      width: Math.random() * 5 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
    })),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      {/* Dark overlay (teal-tinted) */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/80 via-teal-900/70 to-black/80" />

      {/* Mouse-follow glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(20, 184, 166, 0.6) 0%, transparent 55%)`,
          transition: "background 0.4s ease",
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-teal-300 opacity-20"
          style={{
            width: p.width + "px",
            height: p.width + "px",
            top: p.top + "%",
            left: p.left + "%",
            animation: `float ${p.duration}s infinite ease-in-out`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4 text-center">

        {/* Eyebrow label */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          1000+ stays across 50 countries
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-extrabold mb-5 animate-fade-in leading-tight tracking-tight">
          Wander<span className="text-teal-400">lust</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-gray-300 animate-fade-in-delay max-w-xl font-light leading-relaxed">
          Discover extraordinary places to stay around the world.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="animate-fade-in-delay-2 flex w-full max-w-xl bg-white/10 border border-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-2xl focus-within:bg-white/15 focus-within:border-teal-400/50 transition-all"
        >
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 px-6 py-4 bg-transparent outline-none text-white placeholder-white/50 text-base truncate"
          />
          <button
            type="submit"
            className="flex-shrink-0 bg-teal-500 hover:bg-teal-400 transition-colors text-white font-bold px-7 flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </button>
        </form>

        {/* Quick category links */}
        <div className="animate-fade-in-delay-2 mt-6 flex flex-wrap justify-center gap-2">
          {["🏖️ Beaches", "🏔️ Mountains", "🏙️ Cities", "🌲 Forests"].map((cat) => {
            const value = cat.split(" ")[1].toLowerCase();
            return (
              <Link
                key={cat}
                to={`/listings?category=${value}`}
                className="px-4 py-1.5 rounded-full border border-white/20 text-white/75 text-sm hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-12 mt-16 animate-fade-in-delay-3">
          {[["1000+", "Destinations"], ["500+", "Happy Travelers"], ["50+", "Countries"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-teal-300">{num}</div>
              <div className="text-gray-400 text-sm mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-18px) translateX(8px); }
          66% { transform: translateY(-35px) translateX(-8px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in          { animation: fade-in 0.9s ease-out both; }
        .animate-fade-in-delay    { animation: fade-in 0.9s ease-out 0.25s both; }
        .animate-fade-in-delay-2  { animation: fade-in 0.9s ease-out 0.5s both; }
        .animate-fade-in-delay-3  { animation: fade-in 0.9s ease-out 0.75s both; }
      `}</style>
    </div>
  );
}