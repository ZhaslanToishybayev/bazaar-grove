import React, { useState, useEffect } from 'react';
import { WishlistContext } from './wishlistContext';
import { WishlistItemWithProduct } from './types';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);
  
  const fetchWishlistItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          user_id,
          created_at,
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
      
      const wishlistItems: WishlistItemWithProduct[] = data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        user_id: item.user_id,
        created_at: item.created_at,
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          category_id: item.products.category_id,
          image_url: item.products.image_url,
          created_at: item.products.created_at,
          rating: item.products.rating,
          reviews_count: item.products.reviews_count,
          featured: item.products.featured
        }
      }));
      
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast('Не удалось загрузить список желаний');
    } finally {
      setLoading(false);
    }
  };
  
  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  };
  
  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast('Необходимо войти в систему, чтобы добавить товар в список желаний');
      return false;
    }
    
    // Если товар уже в списке желаний, ничего не делаем
    if (isInWishlist(productId)) {
      toast('Товар уже в списке желаний');
      return true;
    }
    
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (productError) throw productError;
      
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setWishlist([...wishlist, {
        id: data.id,
        product_id: data.product_id,
        user_id: data.user_id,
        created_at: data.created_at,
        product
      }]);
      
      toast('Товар добавлен в список желаний');
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast('Не удалось добавить товар в список желаний');
      return false;
    }
  };
  
  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;
    
    const item = wishlist.find(item => item.product_id === productId);
    if (!item) return false;
    
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setWishlist(wishlist.filter(item => item.product_id !== productId));
      toast('Товар удален из списка желаний');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast('Не удалось удалить товар из списка желаний');
      return false;
    }
  };
  
  const clearWishlist = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setWishlist([]);
      toast('Список желаний очищен');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast('Не удалось очистить список желаний');
      return false;
    }
  };
  
  const contextValue = {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist: fetchWishlistItems
  };
  
  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}; 