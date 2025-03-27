
import { Product } from '@/integrations/supabase/types';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartContextType {
  cart: CartItemWithProduct[];
  loading: boolean;
  cartTotal: number;
  cartCount: number;
  addItemToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItemFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}
