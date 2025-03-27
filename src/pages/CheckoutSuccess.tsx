
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/cartContext';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
    
    // Show success message
    toast.success('Платеж успешно выполнен!');
  }, [clearCart]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Спасибо за ваш заказ. Мы отправили подтверждение на вашу электронную почту.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                Вернуться на главную
              </Button>
              
              <Button onClick={() => navigate('/products')} size="lg">
                Продолжить покупки
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
