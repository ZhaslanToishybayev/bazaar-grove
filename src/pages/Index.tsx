import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useTransform } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryCard from '../components/ui/CategoryCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getCategoriesWithImages, Category } from '@/lib/data';
import PromoBanner from '../components/layout/PromoBanner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
  const location = useLocation();
  const { scrollY } = useScrollAnimation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const benefitsRef = useRef(null);
  const newsletterRef = useRef(null);
  
  const benefitsY = useTransform(scrollY, [1000, 1500], [100, 0]);
  const newsletterBgScale = useTransform(scrollY, [1500, 2000], [0.8, 1]);
  const newsletterOpacity = useTransform(scrollY, [1500, 1800], [0.5, 1]);
  const categoryBgX = useTransform(scrollY, [500, 1000], [0, -100]);
  
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
      <PromoBanner />
      <main className="flex-grow"> 
        <Hero />
        <FeaturedProducts />
        
        <motion.section 
          className="py-16 bg-secondary/50 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <motion.div 
            className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl opacity-50"
            style={{
              x: categoryBgX
            }}
          />
          
          <div className="container px-4 mx-auto relative z-10">
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
                  <motion.div 
                    key={category.id} 
                    variants={fadeInUp}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
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
        
        <motion.section 
          ref={benefitsRef}
          className="py-16 relative overflow-hidden"
          style={{ y: benefitsY }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-secondary/20 opacity-30"
            style={{
              y: useTransform(scrollY, [800, 1200], [0, 50])
            }}
          />
          
          <div className="container px-4 mx-auto relative z-10">
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
              ].map((benefit, index) => (
                <motion.div 
                  key={benefit.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  custom={index}
                >
                  <motion.div 
                    className="text-4xl mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  >
                    {benefit.icon}
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        
        <motion.section 
          ref={newsletterRef}
          className="py-16 sm:py-24 bg-primary/5 rounded-3xl mx-4 sm:mx-8 my-8 relative overflow-hidden"
          style={{ 
            scale: newsletterBgScale,
            opacity: newsletterOpacity
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <motion.div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-xl"
            animate={{ 
              x: [0, 10, 0], 
              y: [0, -10, 0],
              transition: { repeat: Infinity, duration: 8, ease: "easeInOut" } 
            }}
          />
          <motion.div 
            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent/10 blur-xl"
            animate={{ 
              x: [0, -10, 0], 
              y: [0, 10, 0],
              transition: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 } 
            }}
          />
          
          <div className="container px-4 mx-auto text-center relative z-10">
            <motion.h2 
              variants={fadeInUp} 
              className="text-2xl sm:text-3xl font-bold mb-4"
            >
              Будьте в курсе
            </motion.h2>
            <motion.p 
              variants={fadeInUp} 
              className="text-muted-foreground max-w-lg mx-auto mb-8"
            >
              Подпишитесь на нашу рассылку, чтобы получать обновления о новых продуктах, специальных предложениях и многом другом.
            </motion.p>
            <motion.div 
              variants={fadeInUp} 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              whileInView={{ 
                transition: {
                  staggerChildren: 0.2
                }
              }}
            >
              <motion.input 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                type="email" 
                placeholder="Ваш email адрес" 
                className="flex h-12 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Button 
                  className="h-12 rounded-full px-6"
                >
                  Подписаться
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
