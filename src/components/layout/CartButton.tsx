import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cartContext";
import { Button } from "../ui/button";
import CartSheet from "../cart/CartSheet";
import { useNavigate } from "react-router-dom";
import { isStripeConfigured } from "@/integrations/stripe/client";

const CartButton: React.FC = () => {
  const { cart, cartCount } = useCart();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [stripeAvailable, setStripeAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Проверяем доступность Stripe при монтировании компонента
  useEffect(() => {
    setStripeAvailable(isStripeConfigured());
  }, []);

  const handleCheckout = () => {
    setIsSheetOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsSheetOpen(true)}
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
      
      <CartSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        onCheckout={handleCheckout}
        stripeAvailable={stripeAvailable || false}
      />
    </>
  );
};

export default CartButton; 