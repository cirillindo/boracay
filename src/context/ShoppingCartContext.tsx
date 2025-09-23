import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the shape of a single item in the cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedDate?: Date; // Activities might have a selected date
  hero_image?: string; // For displaying in the cart
  price_type?: string; // To correctly calculate price if needed
  min_pax?: number; // For activities with minimum participants
  type?: 'activity' | 'package'; // To distinguish item type
  min_nights?: number; // For packages
  addons_summary?: string; // For packages with selected addons
}

// 2. Define the shape of the context value
interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// 3. Create the context with a default (null) value
const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

// 4. Create the provider component
interface ShoppingCartProviderProps {
  children: ReactNode;
}

export const ShoppingCartProvider: React.FC<ShoppingCartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage on first load
    try {
      const localData = localStorage.getItem('shoppingCart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Failed to parse shopping cart from localStorage", error);
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        // If item exists, update its quantity
        return currentItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        );
      } else {
        // If item doesn't exist, add it to the cart
        return [...currentItems, { ...item, quantity: quantityToAdd }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(currentItems => {
      if (quantity <= 0) {
        return currentItems.filter(item => item.id !== id);
      }
      return currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

// 5. Custom hook to use the shopping cart context
export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};