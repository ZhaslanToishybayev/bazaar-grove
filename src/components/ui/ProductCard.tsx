import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/data';
import { toast } from "sonner";
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import { useWishlist } from '@/lib/wishlist/wishlistContext';

interface ProductCardProps {
  product: Product;
  className?: string;
  imageSize?: 'default' | 'large';
}

const ProductCard = ({ 
  product, 
  className,
  imageSize = 'default' 
}: ProductCardProps) => {
  const { addItemToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы добавить товар в корзину');
      return;
    }
    
    addItemToCart(product.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Необходимо войти в систему, чтобы добавить товар в избранное');
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 hover:shadow-product",
        className
      )}
    >
      <Link 
        to={`/products/${product.id}`}
        className="aspect-square overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        <img
          src={product.image_url}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            imageSize === 'large' ? 'aspect-[4/5]' : 'aspect-square'
          )}
          loading="lazy"
        />
      </Link>
      
      <div className="flex flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{product.category}</span>
          <div className="flex items-center">
            <Star size={12} className="fill-amber-400 stroke-amber-400" />
            <span className="ml-1 text-xs font-medium">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/products/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-medium leading-tight truncate">{product.name}</h3>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <Button 
            variant={isWishlisted ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all z-20",
              isWishlisted ? "opacity-100" : "opacity-70 hover:opacity-100"
            )}
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <Heart size={16} className={isWishlisted ? "fill-primary text-primary" : ""} />
          </Button>
        </div>
      </div>
      
      <div className="absolute right-3 top-3 z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <Button 
          variant="default" 
          size="sm"
          className="shadow-md rounded-full py-1 px-3 text-xs h-auto"
          onClick={handleAddToCart}
        >
          В корзину
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
