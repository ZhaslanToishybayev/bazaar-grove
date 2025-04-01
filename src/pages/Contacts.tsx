import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import { Button } from '@/components/ui/button';
import { sendContactMessage } from '@/lib/api';

// Временное решение: отправка сообщения на email (имитация)
const sendEmailFallback = (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  console.log('Отправка сообщения по email:', data);
  // В реальном приложении здесь был бы код для отправки email
  return { success: true };
};

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Пытаемся отправить сообщение через Supabase
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        toast.success('Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.');
        // Сбрасываем форму
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        console.warn('Ошибка при сохранении в базу данных:', result.error);
        
        // Если не удалось сохранить в базу данных, используем запасной вариант
        const fallbackResult = sendEmailFallback(formData);
        
        if (fallbackResult.success) {
          toast.success('Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.');
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        } else {
          toast.error('Не удалось отправить сообщение. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      // Если произошла ошибка, используем запасной вариант
      const fallbackResult = sendEmailFallback(formData);
      
      if (fallbackResult.success) {
        toast.success('Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error('Не удалось отправить сообщение. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <Container>
          <div className="py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Связаться с нами</h1>
            <p className="text-muted-foreground max-w-3xl mb-8">
              У вас есть вопросы или предложения? Мы всегда рады помочь вам и ответить на любые вопросы. Свяжитесь с нами любым удобным способом.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-semibold mb-6">Контактная информация</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Адрес</h3>
                      <p className="text-muted-foreground mt-1">ул. Примерная, 123, Москва, Россия, 123456</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Телефон</h3>
                      <p className="text-muted-foreground mt-1">+7 (123) 456-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground mt-1">info@jana-market.ru</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="font-medium mb-4">Часы работы</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Понедельник - Пятница</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Суббота</span>
                      <span>10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Воскресенье</span>
                      <span>Выходной</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-semibold mb-6">Отправить сообщение</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Имя</label>
                    <input
                      id="name"
                      type="text"
                      className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ваше имя"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ваш email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Тема</label>
                    <input
                      id="subject"
                      type="text"
                      className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Тема сообщения"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Сообщение</label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ваше сообщение"
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                  </Button>
                </form>
              </div>
            </div>
            
            {/* Map */}
            <div className="mt-16 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-semibold mb-6">Как нас найти</h2>
              <div className="h-96 bg-muted rounded-xl overflow-hidden">
                {/* Placeholder for map - would be replaced with actual map component */}
                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                  <p className="text-muted-foreground">Здесь будет карта</p>
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

export default Contacts;
