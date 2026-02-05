
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext"; // Add this

import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import NewListing from "./pages/NewListing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import EditListing from "./pages/EditListing";
import Cart from "./pages/Cart"; // Add this

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [isServerAwake, setIsServerAwake] = useState(false);
  const [wakingTime, setWakingTime] = useState(0);

  useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          credentials: 'include'
        });
        setIsServerAwake(true);
      } catch (error) {
        console.log('Server ping failed:', error);
      }
    };

    const startTime = Date.now();
    const wakeTimer = setInterval(() => {
      setWakingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    pingServer().then(() => {
      clearInterval(wakeTimer);
    });

    const keepAliveInterval = setInterval(() => {
      pingServer();
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(keepAliveInterval);
      clearInterval(wakeTimer);
    };
  }, []);

  if (!isServerAwake) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          animation: 'pulse 2s ease-in-out infinite',
          marginBottom: '20px'
        }}>
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>
          Waking up the server...
        </h2>
        <p style={{ color: '#666', marginBottom: '5px' }}>
          This may take up to 50 seconds on first load (free tier)
        </p>
        <p style={{ color: '#999', fontSize: '14px' }}>
          Time elapsed: {wakingTime}s
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.95); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <CartProvider> {/* Wrap everything in CartProvider */}
      <BrowserRouter>
        
        <Navbar/>

        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/listings" element={<Listings/>}/>
          <Route path="/listings/:id" element={<ListingDetails/>}/>
          <Route path="/cart" element={<Cart/>}/> {/* Add cart route */}

          <Route 
            path="/listings/new" 
            element={
              <ProtectedRoute>
                <NewListing/>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/listings/:id/edit" 
            element={
              <ProtectedRoute>
                <EditListing/>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
        </Routes>

      </BrowserRouter>
    </CartProvider>
  );
}

