
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerClose 
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, X, RefreshCw, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import CartItem from './CartItem';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const { cart = [], cartTotal = 0, cartCount = 0, loading = false, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };
  
  const handleLogin = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  // Вычисляем, насколько близки к бесплатной доставке (пример - от 100$)
  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = freeShippingThreshold - cartTotal;
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl flex items-center">
              <ShoppingBag className="mr-2" /> Корзина
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-2">{cartCount}</Badge>
              )}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>
            {cartCount === 0 
              ? 'Ваша корзина пуста' 
              : `В корзине ${cartCount} ${cartCount === 1 ? 'товар' : cartCount > 1 && cartCount < 5 ? 'товара' : 'товаров'}`
            }
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="mb-4 text-muted-foreground">Необходимо войти в систему, чтобы использовать корзину</p>
              <Button onClick={handleLogin}>Войти / Зарегистрироваться</Button>
            </div>
          ) : Array.isArray(cart) && cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center animate-fade-in">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ваша корзина пуста</p>
              <Button 
                variant="link" 
                className="mt-4 flex items-center"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/products');
                }}
              >
                Перейти к покупкам <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {Array.isArray(cart) && cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {Array.isArray(cart) && cart.length > 0 && (
          <DrawerFooter className="border-t">
            {cartTotal < freeShippingThreshold && (
              <div className="mb-4 bg-secondary/30 p-3 rounded-lg animate-fade-in">
                <p className="text-sm mb-2">
                  До бесплатной доставки осталось <span className="font-semibold">${remainingForFreeShipping.toFixed(2)}</span>
                </p>
                <Progress value={progressToFreeShipping} className="h-2" />
              </div>
            )}
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Стоимость товаров:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка:</span>
                <span>{cartTotal >= freeShippingThreshold ? 'Бесплатно' : '$9.99'}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого:</span>
                <span>${(cartTotal >= freeShippingThreshold ? cartTotal : cartTotal + 9.99).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => clearCart()}>
                Очистить корзину
              </Button>
              <Button onClick={handleCheckout} className="hover:scale-105 transition-transform">
                Оформить заказ
              </Button>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
