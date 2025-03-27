
import React, { createContext, useContext } from 'react';
import { CartContextType } from './types';

// Create the context with a default undefined value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a hook to use the cart context
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

// Export the CartContext for the provider to use
export default CartContext;
