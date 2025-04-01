import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRightCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/lib/cart/cartContext';
import { checkSessionStatus } from '@/integrations/stripe/api';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart, refreshCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>('unknown');
  
  // Оборачиваем функции в useCallback для стабильности ссылок в useEffect
  const stableToast = useCallback(toast, []); 
  const stableClearCart = useCallback(clearCart, []);
  const stableRefreshCart = useCallback(refreshCart, []);
  
  useEffect(() => {
    let isComponentMounted = true; // Флаг для предотвращения обновления размонтированного компонента
    
    const performCheck = async () => {
      if (!sessionId) {
        stableToast({ title: 'Ошибка', description: 'ID сессии не найден', variant: 'destructive' });
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Очищаем корзину и обновляем её состояние
        const cartCleared = await stableClearCart();
        if (!cartCleared) {
          console.error('Failed to clear cart');
          // Пробуем обновить состояние корзины
          await stableRefreshCart();
        }
        
        const result = await checkSessionStatus(sessionId);
        
        // Проверяем, что компонент все еще смонтирован
        if (!isComponentMounted) return;
        
        if (result.success) {
          const { status, paymentStatus } = result;
          
          setPaymentStatus(paymentStatus || 'paid');
          
          stableToast({
            title: 'Заказ успешно оформлен',
            description: 'Ваш заказ успешно создан и оплачен',
          });

          // Очищаем данные из localStorage
          localStorage.removeItem('bazaar_grove_shipping_form');
          
          // Еще раз пробуем обновить состояние корзины
          await stableRefreshCart();
        } else {
          console.error("API error checking session status:", result.error);
          stableToast({ 
            title: 'Заказ оформлен', 
            description: 'Мы получили вашу оплату, но возникла ошибка при получении деталей заказа.' 
          });
        }
      } catch (error) {
        // Проверяем, что компонент все еще смонтирован
        if (!isComponentMounted) return;
        
        console.error('Ошибка при проверке статуса сессии:', error);
        stableToast({ 
          title: 'Ошибка', 
          description: 'Произошла ошибка при получении информации о заказе', 
          variant: 'destructive' 
        });
      } finally {
        // Проверяем, что компонент все еще смонтирован
        if (isComponentMounted) {
          setLoading(false);
        }
      }
    };
    
    performCheck(); // Запускаем проверку при монтировании
    
    // Функция очистки для useEffect
    return () => {
      isComponentMounted = false;
    };
  }, [sessionId, navigate, stableClearCart, stableToast, stableRefreshCart]);
  
  if (loading) {
    return (
      <div className="container max-w-4xl py-16">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold text-center">Проверка заказа...</h1>
          <p className="text-muted-foreground text-center mt-2">
            Пожалуйста, подождите, мы обрабатываем ваш заказ
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-16">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-center">Заказ успешно оформлен!</h1>
        
        <p className="text-muted-foreground text-center mt-4 max-w-lg">
          Спасибо за ваш заказ. Мы отправили детали заказа на вашу электронную почту.
          Вы можете отслеживать статус заказа в вашем личном кабинете.
        </p>
        
        <div className="mt-8 p-6 border rounded-lg bg-secondary/10 w-full max-w-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Информация о заказе</h2>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус оплаты:</span>
              <span className="text-green-600 font-medium">Оплачен</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={() => navigate('/profile')} className="flex items-center">
            Мои заказы
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
          
          <Button onClick={() => navigate('/products')} variant="outline">
            Продолжить покупки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
