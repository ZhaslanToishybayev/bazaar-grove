
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cartContext';
import CartDrawer from './CartDrawer';

const CartButton: React.FC = () => {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setOpen(true)}
        aria-label="Корзина"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
      
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
};

export default CartButton;
