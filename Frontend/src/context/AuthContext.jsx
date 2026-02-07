

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial auth check on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Periodic session check every 5 minutes
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/check');
        
        if (!response.data.authenticated && user) {
          // Session expired while user was logged in
          setUser(null);
          alert('Your session has expired. Please login again.');
        } else if (response.data.authenticated && !user) {
          // Session exists but context is out of sync
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('Session check failed:', error);
        if (user) {
          setUser(null);
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Check auth status
  const checkAuthStatus = async () => {
    try {
      const res = await api.get("/current-user");
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // // Login with error handling
  // const login = async (credentials) => {
  //   try {
  //     await api.post("/login", credentials);
  //     const res = await api.get("/current-user");
  //     setUser(res.data);
  //     return { success: true };
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.error || "Login failed";
  //     return { success: false, error: errorMessage };
  //   }
  // };

  // Inside AuthContext.js
  // const login = async (credentials) => {
  //   try {
  //     await api.post("/login", credentials);
  //     const res = await api.get("/current-user");
  //     setUser(res.data);
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.error || "Login failed";
  //     // CRITICAL: You must throw so the component knows it failed
  //     throw new Error(errorMessage); 
  //   }
  // };


  const login = async (credentials) => {
    try {
      const response = await api.post("/login", credentials);
      // Use the data returned from the login call directly to save a network request
      const userData = response.data.user; 
      setUser(userData);
      return { success: true }; // MUST return this for your Login.js logic
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      return { success: false, error: errorMessage };
    }
  };



  // Logout with error handling
  const logout = async () => {
    try {
      await api.post("/logout");
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      return { success: false, error: "Logout may have failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
