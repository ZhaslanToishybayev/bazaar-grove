
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { 
  CartItemWithProduct, 
  getUserCart, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  calculateCartTotal 
} from '@/lib/cart';

interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addItemToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItemFromCart: (cartItemId: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = calculateCartTotal(cartItems);
  
  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const items = await getUserCart();
      setCartItems(items);
    } catch (error) {
      console.error('Ошибка при обновлении корзины:', error);
      toast.error('Не удалось загрузить корзину');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [user]);
  
  const addItemToCart = async (productId: string, quantity = 1) => {
    const result = await addToCart(productId, quantity);
    
    if (result.success) {
      toast.success(result.message);
      refreshCart();
    } else {
      toast.error(result.message);
    }
  };
  
  const updateItemQuantity = async (cartItemId: string, quantity: number) => {
    const result = await updateCartItemQuantity(cartItemId, quantity);
    
    if (result.success) {
      refreshCart();
    } else {
      toast.error(result.message);
    }
  };
  
  const removeItemFromCart = async (cartItemId: string) => {
    const result = await removeFromCart(cartItemId);
    
    if (result.success) {
      toast.success(result.message);
      refreshCart();
    } else {
      toast.error(result.message);
    }
  };
  
  const clearCartItems = async () => {
    const result = await clearCart();
    
    if (result.success) {
      toast.success(result.message);
      refreshCart();
    } else {
      toast.error(result.message);
    }
  };
  
  const value: CartContextType = {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCartItems,
    refreshCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
