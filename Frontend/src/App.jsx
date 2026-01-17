import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import NewListing from "./pages/NewListing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import EditListing from "./pages/EditListing";


export default function App() {
  return (
    <BrowserRouter>
      
      {/* Navbar always visible */}
      <Navbar/>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/listings" element={<Listings/>}/>
        <Route path="/listings/:id" element={<ListingDetails/>}/>

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
  );
}

