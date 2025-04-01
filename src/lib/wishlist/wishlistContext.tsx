import { createContext, useContext } from 'react';
import { WishlistContextType } from './types';

// Создаем контекст с начальным значением undefined
export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Хук для использования контекста списка желаний
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 