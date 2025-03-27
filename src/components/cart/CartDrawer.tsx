
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
import { ShoppingCart, ShoppingBag, X, RefreshCw } from 'lucide-react';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import CartItem from './CartItem';

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
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl flex items-center">
              <ShoppingBag className="mr-2" /> Корзина
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
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ваша корзина пуста</p>
              <Button 
                variant="link" 
                onClick={() => {
                  onOpenChange(false);
                  navigate('/products');
                }}
              >
                Перейти к покупкам
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(cart) && cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {Array.isArray(cart) && cart.length > 0 && (
          <DrawerFooter className="border-t">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Итого:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => clearCart()}>
                Очистить корзину
              </Button>
              <Button onClick={handleCheckout}>
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
