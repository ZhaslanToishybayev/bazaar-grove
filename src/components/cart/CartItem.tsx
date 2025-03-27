
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItemWithProduct } from '@/lib/cart/types';
import { useCart } from '@/lib/cart/cartContext';
import { motion } from 'framer-motion';

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
    <div className="flex items-center py-4 border-b group hover:bg-secondary/10 transition-colors rounded-lg p-2">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary/20 group-hover:shadow-md transition-all">
        <Link to={`/products/${item.product.id}`}>
          <img
            src={item.product.image_url || ''}
            alt={item.product.name}
            className="h-full w-full object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
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
          <p className="ml-4 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
        </div>
        
        <p className="mt-1 text-sm text-muted-foreground">
          Цена: ${item.product.price.toFixed(2)}
        </p>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border rounded-full overflow-hidden shadow-sm bg-secondary/10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </Button>
            <span className="px-3 font-medium">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={() => handleQuantityChange(1)}
            >
              <Plus size={14} />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-full" 
            onClick={() => removeItemFromCart(item.id)}
          >
            <Trash2 size={16} className="mr-1" /> Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
