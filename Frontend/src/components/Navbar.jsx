import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-black text-white">

      {/* Logo */}
      <Link to="/" className="text-xl font-bold">
        Wanderlust
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4">

        <Link to="/listings" className="hover:underline">
          Listings
        </Link>

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
    </nav>
  );
}
