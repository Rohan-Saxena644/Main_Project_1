

// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useCart } from "../context/CartContext"; // Add this
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const { getCartCount } = useCart(); // Add this
//   const [query, setQuery] = useState("");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   // TODO: Replace with actual cart count from cart context
//   const cartItemCount = getCartCount();

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;
//     navigate(`/listings?search=${query.trim()}`);
//     setIsMobileMenuOpen(false);
//   };

//   const handleLinkClick = () => {
//     setIsMobileMenuOpen(false);
//   };

//   return (
//     <nav className="bg-black text-white">
//       <div className="px-4 sm:px-6 py-4">
        
//         {/* Desktop & Mobile Top Bar */}
//         <div className="flex justify-between items-center">
          
//           {/* Logo */}
//           <Link to="/" className="text-xl font-bold" onClick={handleLinkClick}>
//             Wanderlust
//           </Link>

//           {/* Desktop Search - Hidden on mobile */}
//           <div className="hidden lg:flex flex-1 justify-center mx-4">
//             <form onSubmit={handleSearch} className="flex border rounded overflow-hidden w-full max-w-md">
//               <input
//                 type="text"
//                 placeholder="Search places..."
//                 className="px-3 py-1 outline-none flex-1 text-white bg-transparent"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//               <button className="bg-red-500 text-white px-4 hover:bg-red-600">
//                 Search
//               </button>
//             </form>
//           </div>

//           {/* Desktop Links - Hidden on mobile */}
//           <div className="hidden lg:flex items-center gap-6">
//             <Link to="/listings" className="hover:underline whitespace-nowrap">
//               Listings
//             </Link>

//             {/* Cart Icon - Desktop */}
//             <Link 
//               to="/cart" 
//               className="relative hover:text-gray-300 transition"
//               onClick={handleLinkClick}
//             >
//               <svg 
//                 xmlns="http://www.w3.org/2000/svg" 
//                 fill="none" 
//                 viewBox="0 0 24 24" 
//                 strokeWidth={1.5} 
//                 stroke="currentColor" 
//                 className="w-6 h-6"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
//                 />
//               </svg>
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Link>
            
//             {user ? (
//               <>
//                 <Link to="/listings/new" className="hover:underline whitespace-nowrap">
//                   Add Listing
//                 </Link>

//                 <span className="text-gray-300 whitespace-nowrap">
//                   Hi, {user.username}
//                 </span>

//                 <button
//                   onClick={logout}
//                   className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 whitespace-nowrap"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link to="/login" className="hover:underline whitespace-nowrap">
//                   Login
//                 </Link>
//                 <Link to="/signup" className="hover:underline whitespace-nowrap">
//                   Signup
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Right Side - Mobile (Cart + Hamburger) */}
//           <div className="lg:hidden flex items-center gap-4">
            
//             {/* Cart Icon - Mobile */}
//             <Link 
//               to="/cart" 
//               className="relative hover:text-gray-300 transition"
//               onClick={handleLinkClick}
//             >
//               <svg 
//                 xmlns="http://www.w3.org/2000/svg" 
//                 fill="none" 
//                 viewBox="0 0 24 24" 
//                 strokeWidth={1.5} 
//                 stroke="currentColor" 
//                 className="w-6 h-6"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
//                 />
//               </svg>
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Link>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="flex flex-col gap-1 p-2"
//               aria-label="Toggle menu"
//             >
//               <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
//               <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
//               <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Search - Below logo on mobile */}
//         <div className="lg:hidden mt-3">
//           <form onSubmit={handleSearch} className="flex border rounded overflow-hidden w-full">
//             <input
//               type="text"
//               placeholder="Search places..."
//               className="px-3 py-2 outline-none flex-1 text-white bg-transparent"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//             <button className="bg-red-500 text-white px-4 hover:bg-red-600">
//               Search
//             </button>
//           </form>
//         </div>

//         {/* Mobile Menu Dropdown */}
//         <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
//           <div className="flex flex-col gap-3 py-2">
            
//             <Link 
//               to="/listings" 
//               className="hover:bg-gray-800 px-3 py-2 rounded"
//               onClick={handleLinkClick}
//             >
//               Listings
//             </Link>
            
//             {user ? (
//               <>
//                 <Link 
//                   to="/listings/new" 
//                   className="hover:bg-gray-800 px-3 py-2 rounded"
//                   onClick={handleLinkClick}
//                 >
//                   Add Listing
//                 </Link>

//                 <div className="px-3 py-2 text-gray-300">
//                   Hi, {user.username}
//                 </div>

//                 <button
//                   onClick={() => {
//                     logout();
//                     handleLinkClick();
//                   }}
//                   className="bg-red-500 px-3 py-2 rounded hover:bg-red-600 text-left"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link 
//                   to="/login" 
//                   className="hover:bg-gray-800 px-3 py-2 rounded"
//                   onClick={handleLinkClick}
//                 >
//                   Login
//                 </Link>
//                 <Link 
//                   to="/signup" 
//                   className="hover:bg-gray-800 px-3 py-2 rounded"
//                   onClick={handleLinkClick}
//                 >
//                   Signup
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>

//       </div>
//     </nav>
//   );
// }



import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
      {/* Max-w-7xl and mx-auto pulls the content slightly away from the extreme edges */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        
        {/* Desktop & Mobile Top Bar */}
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-extrabold tracking-tight hover:text-red-500 transition-colors" 
            onClick={handleLinkClick}
          >
            Wanderlust
          </Link>

          {/* Desktop Search - Centered */}
          <div className="hidden lg:flex flex-1 justify-center mx-8">
            <form onSubmit={handleSearch} className="flex border border-gray-700 rounded-full overflow-hidden w-full max-w-md focus-within:border-red-500 transition-colors">
              <input
                type="text"
                placeholder="Search places..."
                className="px-5 py-2 outline-none flex-1 text-sm text-white bg-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="bg-red-500 text-white px-5 text-sm font-semibold hover:bg-red-600 transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Desktop Links - Polished Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link 
              to="/listings" 
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Listings
            </Link>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-full hover:bg-white/10 transition-all mr-2"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/listings/new" 
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-all whitespace-nowrap border border-gray-700 hover:border-gray-500"
                >
                  Add Listing
                </Link>

                <span className="text-gray-400 text-sm hidden xl:block">
                  Hi, <span className="text-white font-semibold">{user.username}</span>
                </span>

                <button
                  onClick={logout}
                  className="bg-white text-black px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-red-500 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-600 transition-colors whitespace-nowrap shadow-lg shadow-red-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile UI Buttons */}
          <div className="lg:hidden flex items-center gap-4">
            <Link to="/cart" className="relative p-1" onClick={handleLinkClick}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1.5 p-1"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Search - Redesigned */}
        <div className="lg:hidden mt-4">
          <form onSubmit={handleSearch} className="flex border border-gray-700 rounded-lg overflow-hidden w-full bg-white/5">
            <input
              type="text"
              placeholder="Search places..."
              className="px-4 py-2.5 outline-none flex-1 text-white bg-transparent text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-red-500 text-white px-5 hover:bg-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-2 py-4 border-t border-gray-800">
            <Link to="/listings" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={handleLinkClick}>Listings</Link>
            
            {user ? (
              <>
                <Link to="/listings/new" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-colors" onClick={handleLinkClick}>Add Listing</Link>
                <div className="px-4 py-2 text-gray-400 text-sm italic">Hi, {user.username}</div>
                <button
                  onClick={() => { logout(); handleLinkClick(); }}
                  className="bg-red-500 mx-4 mt-2 px-4 py-3 rounded-lg font-bold text-center active:scale-95 transition-transform"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-4 mt-2">
                <Link to="/login" className="border border-gray-700 text-center py-3 rounded-lg font-medium" onClick={handleLinkClick}>Login</Link>
                <Link to="/signup" className="bg-red-500 text-center py-3 rounded-lg font-bold" onClick={handleLinkClick}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
