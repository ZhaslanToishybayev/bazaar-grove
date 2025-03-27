
import React from 'react';
import { CartContext, useCart } from './cartContext';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, CartItemWithProduct } from './types';
import { toast } from '@/hooks/use-toast';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = React.useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
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
            image_url,
            created_at,
            updated_at,
            rating,
            reviews_count,
            featured
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
          image_url: item.products.image_url,
          created_at: item.products.created_at,
          updated_at: item.products.updated_at,
          rating: item.products.rating,
          reviews_count: item.products.reviews_count,
          featured: item.products.featured
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
  
  const addItemToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: 'Необходима авторизация',
        description: 'Войдите в аккаунт, чтобы добавить товар в корзину',
      });
      return false;
    }
    
    try {
      const existingItem = cart.find(item => item.product_id === productId);
      
      if (existingItem) {
        return await updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (productError) throw productError;
        
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
  
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
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
  
  const removeItemFromCart = async (itemId: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
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
  
  const clearCart = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
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
  
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
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

export { useCart };
