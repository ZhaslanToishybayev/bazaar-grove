
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./data";

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Получение корзины пользователя
export const getUserCart = async (): Promise<CartItemWithProduct[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.error('Пользователь не авторизован');
      return [];
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка получения корзины:', error);
      return [];
    }
    
    return data as CartItemWithProduct[];
  } catch (error) {
    console.error('Ошибка получения корзины:', error);
    return [];
  }
};

// Добавление товара в корзину
export const addToCart = async (productId: string, quantity: number = 1): Promise<{ success: boolean, message: string }> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      return { success: false, message: 'Необходимо авторизоваться, чтобы добавить товар в корзину' };
    }
    
    // Проверяем, есть ли уже такой товар в корзине
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existingItem) {
      // Если товар уже в корзине, увеличиваем количество
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);
      
      if (error) {
        console.error('Ошибка обновления корзины:', error);
        return { success: false, message: 'Не удалось обновить товар в корзине' };
      }
      
      return { success: true, message: 'Количество товара увеличено' };
    } else {
      // Если товара нет в корзине, добавляем его
      const { error } = await supabase
        .from('cart_items')
        .insert({
          product_id: productId,
          quantity: quantity,
          user_id: session.session.user.id
        });
      
      if (error) {
        console.error('Ошибка добавления в корзину:', error);
        return { success: false, message: 'Не удалось добавить товар в корзину' };
      }
      
      return { success: true, message: 'Товар добавлен в корзину' };
    }
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
    return { success: false, message: 'Произошла ошибка при добавлении товара в корзину' };
  }
};

// Обновление количества товара в корзине
export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<{ success: boolean, message: string }> => {
  try {
    if (quantity < 1) {
      return { success: false, message: 'Количество товара должно быть не менее 1' };
    }
    
    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Ошибка обновления количества товара:', error);
      return { success: false, message: 'Не удалось обновить количество товара' };
    }
    
    return { success: true, message: 'Количество товара обновлено' };
  } catch (error) {
    console.error('Ошибка обновления количества товара:', error);
    return { success: false, message: 'Произошла ошибка при обновлении количества товара' };
  }
};

// Удаление товара из корзины
export const removeFromCart = async (cartItemId: string): Promise<{ success: boolean, message: string }> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Ошибка удаления товара из корзины:', error);
      return { success: false, message: 'Не удалось удалить товар из корзины' };
    }
    
    return { success: true, message: 'Товар удален из корзины' };
  } catch (error) {
    console.error('Ошибка удаления товара из корзины:', error);
    return { success: false, message: 'Произошла ошибка при удалении товара из корзины' };
  }
};

// Очистка корзины
export const clearCart = async (): Promise<{ success: boolean, message: string }> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      return { success: false, message: 'Необходимо авторизоваться, чтобы очистить корзину' };
    }
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', session.session.user.id);
    
    if (error) {
      console.error('Ошибка очистки корзины:', error);
      return { success: false, message: 'Не удалось очистить корзину' };
    }
    
    return { success: true, message: 'Корзина очищена' };
  } catch (error) {
    console.error('Ошибка очистки корзины:', error);
    return { success: false, message: 'Произошла ошибка при очистке корзины' };
  }
};

// Расчет общей стоимости корзины
export const calculateCartTotal = (cartItems: CartItemWithProduct[]): number => {
  return cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
};
