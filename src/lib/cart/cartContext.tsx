
import React, { createContext, useContext } from 'react';
import { CartContextType } from './types';

// Create the context with a default undefined value
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
