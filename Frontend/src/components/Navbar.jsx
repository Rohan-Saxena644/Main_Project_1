import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/listings?search=${query}`);
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-black text-white">

      {/* Logo */}
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold flex-1">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wanderlust
        </Link>
      </div>
      

      {/* Links */}
      

        <div className="flex flex-1 justify-center">
          <form onSubmit={handleSearch} className="flex border rounded overflow-hidden">
            <input
              type="text"
              placeholder="Search places..."
              className="px-3 py-1 outline-none w-64 text-black"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-red-500 text-white px-4">
              Search
            </button>
          </form>
        </div>
  

        <div className="flex items-center justify-end gap-6 flex-1">
          <Link to="/listings" className="hover:underline">
            Listings
          </Link>
          <div className="space-x-4">
            {user ? (
              <>
                <Link to="/listings/new" className="hover:underline">
                  Add Listing
                </Link>

                <span className="text-gray-300">
                  Hi, {user.username}
                </span>

                <button
                  onClick={logout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/signup" className="hover:underline">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
        
        
    
    </nav>
  );
}
