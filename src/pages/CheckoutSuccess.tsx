
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/cartContext';
import { motion } from 'framer-motion';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear the cart when the success page is loaded
    clearCart();
  }, [clearCart]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Заказ успешно оформлен!
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground mb-8"
            >
              Спасибо за ваш заказ. Мы отправили подтверждение на вашу электронную почту.
              Вы получите уведомление когда ваш заказ будет отправлен.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/products')}
                className="flex items-center"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Продолжить покупки
              </Button>
              
              <Button 
                size="lg"
                onClick={() => navigate('/profile')}
              >
                Отслеживать заказ
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-16 p-6 border rounded-xl bg-secondary/30"
            >
              <h3 className="font-medium mb-2">Что дальше?</h3>
              <p className="text-sm text-muted-foreground">
                Вы получите электронное письмо с подтверждением заказа и дополнительной информацией.
                Вы можете отслеживать статус своего заказа в личном кабинете.
              </p>
            </motion.div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
