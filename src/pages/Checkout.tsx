import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, CreditCard, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart/cartContext';
import { useAuth } from '@/lib/auth';
import { createCheckoutSession, ShippingDetails } from '@/integrations/stripe/api';
import { isStripeConfigured } from '@/integrations/stripe/client';
import { useToast } from '@/hooks/use-toast';

// Схема валидации формы доставки
const shippingFormSchema = z.object({
  name: z.string().min(3, 'Имя должно содержать минимум 3 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  address: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
  city: z.string().min(2, 'Введите название города'),
  postalCode: z.string().min(5, 'Введите корректный почтовый индекс'),
  country: z.string().min(2, 'Введите название страны'),
});

const Checkout: React.FC = () => {
  const { cart, cartTotal, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState<boolean | null>(null);
  
  // Проверяем, настроен ли Stripe при загрузке страницы
  useEffect(() => {
    const checkStripeConfig = async () => {
      const configured = await isStripeConfigured();
      setIsStripeReady(configured);
      
      if (!configured) {
        toast({
          title: 'Stripe не настроен',
          description: 'Платежная система не настроена. Оплата недоступна.',
          variant: 'destructive',
        });
      }
    };
    
    checkStripeConfig();
  }, [toast]);

  // Инициализация формы
  const form = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });
  
  // Если корзина пуста, перенаправляем на страницу корзины
  useEffect(() => {
    if (!cartLoading && (!cart || cart.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  // Обработчик отправки формы
  const onSubmit = async (data: z.infer<typeof shippingFormSchema>) => {
    try {
      if (!isStripeReady) {
        console.error("[Checkout] Stripe is not ready or configured.");
        toast({
          title: 'Оплата недоступна',
          description: 'Платежная система не настроена. Пожалуйста, свяжитесь с администратором.',
          variant: 'destructive',
        });
        return;
      }

      if (cartLoading || cart.length === 0) {
        toast({
          title: 'Корзина пуста',
          description: 'Добавьте товары в корзину перед оформлением заказа',
          variant: 'destructive',
        });
        return;
      }

      setIsRedirecting(true);
      
      // Подготовка данных для отправки
      const shippingDetails: ShippingDetails = {
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone
      };
      
      // Преобразуем товары корзины в формат для Stripe API
      const cartItemsForApi = cart.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url,
      }));
      
      // Создаем checkout сессию
      const result = await createCheckoutSession(
        cartItemsForApi, 
        data.email, 
        user?.id || null,
        shippingDetails
      );
      
      if (result.success && result.url) {
        // Перенаправляем на страницу оплаты Stripe
        window.location.href = result.url;
      } else {
        console.error("[Checkout] Failed to create session or missing URL. Result:", result);
        setIsRedirecting(false);
        toast({
          title: 'Ошибка',
          description: result.message || result.error?.message || 'Не удалось создать сессию оплаты',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsRedirecting(false);
      console.error('[Checkout] Unexpected error during onSubmit:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла непредвиденная ошибка при обработке платежа',
        variant: 'destructive',
      });
    }
  };

  if (cartLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Оформление заказа</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Форма доставки */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Данные доставки</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input placeholder="Иванов Иван Иванович" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (999) 123-45-67" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес</FormLabel>
                    <FormControl>
                      <Input placeholder="ул. Пушкина, д. 10, кв. 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город</FormLabel>
                      <FormControl>
                        <Input placeholder="Москва" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Индекс</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Страна</FormLabel>
                    <FormControl>
                      <Input placeholder="Россия" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={isRedirecting || !isStripeReady}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Перенаправление...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Перейти к оплате
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        {/* Сводка заказа */}
        <div className="bg-secondary/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Ваш заказ
          </h2>
          
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-secondary/20 mr-3">
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {item.product.price.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
                <p className="font-semibold">
                  {(item.product.price * item.quantity).toLocaleString()} ₽
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <p>Подытог</p>
              <p className="font-semibold">{cartTotal.toLocaleString()} ₽</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Доставка</p>
              <p>Бесплатно</p>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
              <p>Итого</p>
              <p>{cartTotal.toLocaleString()} ₽</p>
            </div>
          </div>
          
          {!isStripeReady && isStripeReady !== null && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded">
              <p className="text-sm">
                Платежная система не настроена. Оплата недоступна.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
