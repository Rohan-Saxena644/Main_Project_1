
import { useEffect, useState, useMemo} from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.random() * 4 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    })), 
  [] // ← empty array means calculate once on mount, never again
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)`,
          transition: 'background 0.3s ease'
        }}
      />

      {/* Floating Particles
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div> */}

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            width: p.width + 'px',
            height: p.width + 'px',
            top: p.top + '%',
            left: p.left + '%',
            animation: `float ${p.duration}s infinite ease-in-out`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
          Wanderlust
        </h1>
        <p className="text-xl md:text-3xl mb-8 text-gray-300 animate-fade-in-delay">
          Find your next stay
        </p>
        
        <Link 
          to="/listings"
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 animate-fade-in-delay-2"
        >
          Explore Destinations
        </Link>

        {/* Stats */}
        <div className="flex gap-12 mt-16 animate-fade-in-delay-3">
          <div className="text-center">
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-gray-400">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-gray-400">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">50+</div>
            <div className="text-gray-400">Countries</div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s backwards;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s backwards;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 1s ease-out 0.9s backwards;
        }
      `}</style>
    </div>
  );
}