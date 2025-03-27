
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cartContext';
import CartDrawer from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';

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
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
      
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
};

export default CartButton;
