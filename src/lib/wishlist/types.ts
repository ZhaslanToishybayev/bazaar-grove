import { Product } from '@/lib/data';

export interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Product;
}

export interface WishlistContextType {
  wishlist: WishlistItemWithProduct[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
} 