// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const [query, setQuery] = useState("");
//   const navigate = useNavigate();

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;
//     navigate(`/listings?search=${query.trim()}`);
//   };

//   return (
//     <nav className="flex justify-between items-center px-6 py-4 bg-black text-white">

//       {/* Logo */}
//       <div className="flex-1">
//         <Link to="/" className="text-xl font-bold flex-1">
//           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wanderlust
//         </Link>
//       </div>
      

//       {/* Links */}
      

//         <div className="flex flex-1 justify-center">
//           <form onSubmit={handleSearch} className="flex border rounded overflow-hidden">
//             <input
//               type="text"
//               placeholder="Search places..."
//               className="px-3 py-1 outline-none w-64 text-white"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//             <button className="bg-red-500 text-white px-4">
//               Search
//             </button>
//           </form>
//         </div>
  

//         <div className="flex items-center justify-end gap-6 flex-1">
//           <Link to="/listings" className="hover:underline">
//             Listings
//           </Link>
//           <div className="space-x-4">
//             {user ? (
//               <>
//                 <Link to="/listings/new" className="hover:underline">
//                   Add Listing
//                 </Link>

//                 <span className="text-gray-300">
//                   Hi, {user.username}
//                 </span>

//                 <button
//                   onClick={logout}
//                   className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login" className="hover:underline">
//                   Login
//                 </Link>
//                 <Link to="/signup" className="hover:underline">
//                   Signup
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
        
        
    
//     </nav>
//   );
// }


import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/listings?search=${query.trim()}`);
    setIsMobileMenuOpen(false); // Close menu after search
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false); // Close menu when link is clicked
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col gap-1 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
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
