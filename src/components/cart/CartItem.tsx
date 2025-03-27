
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItemWithProduct } from '@/lib/cart';
import { useCart } from '@/lib/cart/cartContext';

interface CartItemProps {
  item: CartItemWithProduct;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItemQuantity, removeItemFromCart } = useCart();
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity >= 1) {
      updateItemQuantity(item.id, newQuantity);
    }
  };
  
  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Link to={`/products/${item.product.id}`}>
          <img
            src={item.product.image_url || ''}
            alt={item.product.name}
            className="h-full w-full object-cover object-center"
          />
        </Link>
      </div>
      
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium">
          <h3>
            <Link to={`/products/${item.product.id}`} className="hover:text-primary transition-colors">
              {item.product.name}
            </Link>
          </h3>
          <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
        </div>
        
        <p className="mt-1 text-sm text-muted-foreground">
          Цена: ${item.product.price.toFixed(2)}
        </p>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none" 
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="px-3">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none" 
              onClick={() => handleQuantityChange(1)}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 transition-colors" 
            onClick={() => removeItemFromCart(item.id)}
          >
            <X size={16} className="mr-1" /> Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
