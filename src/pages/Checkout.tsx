
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Truck, Info } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import CartItem from '@/components/cart/CartItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const Checkout = () => {
  const { cartItems, cartTotal, clearCartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // В реальном проекте здесь была бы отправка заказа в базу данных
    // и интеграция с платежной системой
    
    toast.success('Заказ успешно оформлен!');
    clearCartItems();
    navigate('/');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Необходима авторизация</h1>
              <p className="text-muted-foreground mb-8">
                Для оформления заказа необходимо войти в систему.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Войти / Зарегистрироваться
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <Container>
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
              <p className="text-muted-foreground mb-8">
                Добавьте товары в корзину, чтобы оформить заказ.
              </p>
              <Button onClick={() => navigate('/products')}>
                Перейти к товарам
              </Button>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm mb-6 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Назад
          </button>
          
          <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Информация о доставке</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Имя</Label>
                      <Input id="first-name" placeholder="Введите имя" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Фамилия</Label>
                      <Input id="last-name" placeholder="Введите фамилию" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="example@mail.com" defaultValue={user?.email || ''} required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" placeholder="+7 (999) 123-45-67" required />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input id="address" placeholder="Введите адрес доставки" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">Город</Label>
                      <Input id="city" placeholder="Введите город" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zip">Почтовый индекс</Label>
                      <Input id="zip" placeholder="Введите почтовый индекс" required />
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <h2 className="text-xl font-semibold mb-6">Способ оплаты</h2>
                  
                  <div className="border rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        id="card-payment" 
                        name="payment-method" 
                        className="h-4 w-4 text-primary" 
                        defaultChecked 
                      />
                      <Label htmlFor="card-payment" className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" /> Оплата картой
                      </Label>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="card-number">Номер карты</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Срок действия</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      Оформить заказ
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Ваш заказ</h2>
                
                <div className="mb-6 max-h-80 overflow-y-auto space-y-4">
                  {cartItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товары:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span className="text-green-600">Бесплатно</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Итого:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="text-muted-foreground flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-medium">Бесплатная доставка</h4>
                      <p className="text-sm text-muted-foreground">Бесплатная стандартная доставка для заказов от $50</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <Info className="text-muted-foreground flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-medium">Безопасная оплата</h4>
                      <p className="text-sm text-muted-foreground">Мы используем безопасное шифрование для защиты ваших данных</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
