
import React from 'react';
import { CartContext, useCartContext } from './cartContext';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, CartItemWithProduct } from './types';
import { toast } from '@/hooks/use-toast';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = React.useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  
  // Fetch cart items when user is authenticated
  React.useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      // Clear cart if user is not authenticated
      setCart([]);
      setLoading(false);
    }
  }, [user]);
  
  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products:product_id (
            id,
            name,
            description,
            price,
            category_id,
            image_url
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Transform the data structure to match CartItemWithProduct
      const cartItems: CartItemWithProduct[] = data.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          category_id: item.products.category_id,
          image_url: item.products.image_url
        }
      }));
      
      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить корзину',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addItemToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Необходима авторизация',
        description: 'Войдите в аккаунт, чтобы добавить товар в корзину',
      });
      return false;
    }
    
    try {
      // Check if item already exists in cart
      const existingItem = cart.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update quantity if item exists
        return await updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Get product details
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (productError) throw productError;
        
        // Add new item to cart
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add new item to local state
        setCart([...cart, {
          id: data.id,
          quantity: data.quantity,
          product_id: data.product_id,
          product
        }]);
        
        toast({
          title: 'Товар добавлен',
          description: 'Товар успешно добавлен в корзину',
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить товар в корзину',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить количество товара',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Remove item from cart
  const removeItemFromCart = async (itemId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setCart(cart.filter(item => item.id !== itemId));
      
      toast({
        title: 'Товар удален',
        description: 'Товар успешно удален из корзины',
      });
      
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить товар из корзины',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setCart([]);
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось очистить корзину',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  // Calculate cart count
  const cartCount = cart.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
  
  const contextValue = {
    cart,
    loading,
    cartTotal,
    cartCount,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    refreshCart: fetchCartItems
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = useCartContext;
