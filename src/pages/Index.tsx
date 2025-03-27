
import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryCard from '../components/ui/CategoryCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getCategoriesWithImages, Category } from '@/lib/data';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategoriesWithImages();
        setCategories(data.slice(0, 4)); // Берем только первые 4 категории для отображения
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-[64px]"> {/* Добавляем отступ для фиксированного Navbar */}
        <Hero />
        <FeaturedProducts />
        
        {/* Categories Section */}
        <motion.section 
          className="py-16 bg-secondary/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl sm:text-3xl font-bold">Категории товаров</h2>
                <p className="mt-2 text-muted-foreground">Исследуйте наши подборки</p>
              </motion.div>
              <Button 
                variant="link" 
                className="hidden md:flex items-center mt-4 md:mt-0"
                asChild
              >
                <motion.a href="/categories" variants={fadeInUp}>
                  Все категории <ArrowRight className="ml-1 h-4 w-4" />
                </motion.a>
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-square"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
                variants={staggerContainer}
              >
                {categories.map((category, index) => (
                  <motion.div key={category.id} variants={fadeInUp}>
                    <CategoryCard 
                      category={category.name}
                      image={category.image_url || ''}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" className="rounded-full" asChild>
                <motion.a variants={fadeInUp} href="/categories">
                  Все категории <ArrowRight className="ml-1 h-4 w-4" />
                </motion.a>
              </Button>
            </div>
          </div>
        </motion.section>
        
        {/* Benefits Section */}
        <motion.section 
          className="py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="container px-4 mx-auto">
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold text-center mb-12">Почему выбирают нас</motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {[
                {
                  title: 'Быстрая доставка',
                  description: 'Получите заказ в течение 2-3 рабочих дней',
                  icon: '🚚'
                },
                {
                  title: 'Безопасные платежи',
                  description: 'Мы используем передовое шифрование для всех транзакций',
                  icon: '🔒'
                },
                {
                  title: 'Гарантия качества',
                  description: '30-дневная гарантия возврата денег на все покупки',
                  icon: '✅'
                }
              ].map((benefit) => (
                <motion.div 
                  key={benefit.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        
        {/* Newsletter */}
        <motion.section 
          className="py-16 sm:py-24 bg-primary/5 rounded-3xl mx-4 sm:mx-8 my-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="container px-4 mx-auto text-center">
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold mb-4">Будьте в курсе</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-lg mx-auto mb-8">Подпишитесь на нашу рассылку, чтобы получать обновления о новых продуктах, специальных предложениях и многом другом.</motion.p>
            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input 
                type="email" 
                placeholder="Ваш email адрес" 
                className="flex h-12 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button className="h-12 rounded-full px-6 hover:scale-105 transition-transform">
                Подписаться
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
