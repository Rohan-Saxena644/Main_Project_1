// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/api";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // On app load → ask backend who is logged in
//   useEffect(() => {
//     api.get("/current-user")
//       .then(res => setUser(res.data))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   // Called after login/signup
//   const login = (userData) => setUser(userData);

//   // Called after logout
//   const logout = async () => {
//     await api.post("/logout");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Custom hook for easy access
// export function useAuth() {
//   return useContext(AuthContext);
// }


import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load → check if session already exists
  useEffect(() => {
    api.get("/current-user")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ✅ FIXED LOGIN FUNCTION
  const login = async (credentials) => {
    // Step 1: perform login (creates session)
    await api.post("/login", credentials);

    // Step 2: immediately ask backend who is logged in
    const res = await api.get("/current-user");

    // Step 3: update context user instantly
    setUser(res.data);
  };

  // Logout
  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
