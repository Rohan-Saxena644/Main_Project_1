import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem("wanderlust-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("wanderlust-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (listing, checkInDate, checkOutDate, nights) => {
    const cartItem = {
      id: listing._id,
      listing: listing,
      checkInDate,
      checkOutDate,
      nights,
      pricePerNight: listing.price,
      totalPrice: listing.price * nights,
      addedAt: new Date().toISOString()
    };

    // Check if item already exists
    const existingIndex = cartItems.findIndex(
      item => item.id === listing._id && 
               item.checkInDate === checkInDate && 
               item.checkOutDate === checkOutDate
    );

    if (existingIndex >= 0) {
      // Update existing item
      const updatedCart = [...cartItems];
      updatedCart[existingIndex] = cartItem;
      setCartItems(updatedCart);
    } else {
      // Add new item
      setCartItems([...cartItems, cartItem]);
    }
  };

  const removeFromCart = (itemId, checkInDate) => {
    setCartItems(cartItems.filter(
      item => !(item.id === itemId && item.checkInDate === checkInDate)
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};