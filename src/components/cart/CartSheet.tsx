import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cartContext";
import { ShoppingCart, CreditCard, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CartItem from "./CartItem";
import { cn } from "@/lib/utils";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
  stripeAvailable: boolean;
}

const CartSheet: React.FC<CartSheetProps> = ({ 
  open, 
  onOpenChange,
  onCheckout,
  stripeAvailable = false 
}) => {
  const { cart, cartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (typeof onCheckout === 'function') {
      onCheckout();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col pr-0 sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Корзина
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Ваша корзина пуста</h3>
              <p className="text-muted-foreground mt-1">
                Добавьте товары в корзину, чтобы оформить заказ
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 py-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pr-4">
                <div className="py-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Итого</span>
                    <span className="font-medium">{cartTotal.toLocaleString()} ₽</span>
                  </div>
                  
                  {!stripeAvailable && (
                    <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-md text-sm flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Stripe не настроен. Функция оплаты недоступна.</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pb-4">
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full"
                    disabled={!stripeAvailable}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Оформить заказ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => clearCart()} 
                    className="w-full"
                  >
                    Очистить корзину
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet; 