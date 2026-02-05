

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // Add this
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart(); // Add this
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // TODO: Replace with actual cart count from cart context
  const cartItemCount = getCartCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/listings?search=${query.trim()}`);
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-black text-white">
      <div className="px-4 sm:px-6 py-4">
        
        {/* Desktop & Mobile Top Bar */}
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="text-xl font-bold" onClick={handleLinkClick}>
            Wanderlust
          </Link>

          {/* Desktop Search - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center mx-4">
            <form onSubmit={handleSearch} className="flex border rounded overflow-hidden w-full max-w-md">
              <input
                type="text"
                placeholder="Search places..."
                className="px-3 py-1 outline-none flex-1 text-white bg-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="bg-red-500 text-white px-4 hover:bg-red-600">
                Search
              </button>
            </form>
          </div>

          {/* Desktop Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/listings" className="hover:underline whitespace-nowrap">
              Listings
            </Link>

            {/* Cart Icon - Desktop */}
            <Link 
              to="/cart" 
              className="relative hover:text-gray-300 transition"
              onClick={handleLinkClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <>
                <Link to="/listings/new" className="hover:underline whitespace-nowrap">
                  Add Listing
                </Link>

                <span className="text-gray-300 whitespace-nowrap">
                  Hi, {user.username}
                </span>

                <button
                  onClick={logout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline whitespace-nowrap">
                  Login
                </Link>
                <Link to="/signup" className="hover:underline whitespace-nowrap">
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Mobile (Cart + Hamburger) */}
          <div className="lg:hidden flex items-center gap-4">
            
            {/* Cart Icon - Mobile */}
            <Link 
              to="/cart" 
              className="relative hover:text-gray-300 transition"
              onClick={handleLinkClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1 p-2"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Search - Below logo on mobile */}
        <div className="lg:hidden mt-3">
          <form onSubmit={handleSearch} className="flex border rounded overflow-hidden w-full">
            <input
              type="text"
              placeholder="Search places..."
              className="px-3 py-2 outline-none flex-1 text-white bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-red-500 text-white px-4 hover:bg-red-600">
              Search
            </button>
          </form>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
          <div className="flex flex-col gap-3 py-2">
            
            <Link 
              to="/listings" 
              className="hover:bg-gray-800 px-3 py-2 rounded"
              onClick={handleLinkClick}
            >
              Listings
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/listings/new" 
                  className="hover:bg-gray-800 px-3 py-2 rounded"
                  onClick={handleLinkClick}
                >
                  Add Listing
                </Link>

                <div className="px-3 py-2 text-gray-300">
                  Hi, {user.username}
                </div>

                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="bg-red-500 px-3 py-2 rounded hover:bg-red-600 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:bg-gray-800 px-3 py-2 rounded"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="hover:bg-gray-800 px-3 py-2 rounded"
                  onClick={handleLinkClick}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
