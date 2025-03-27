
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Container from '../ui/Container';
import ProductCard from '../ui/ProductCard';
import { getFeaturedProducts, Product } from '@/lib/data';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const { scrollY } = useScrollAnimation();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setLoading(true);
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);
  
  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Декоративные элементы с параллакс-эффектом */}
      <motion.div 
        className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/5 opacity-70"
        style={{
          y: useTransform(scrollY, [300, 1000], [0, 100]),
          x: useTransform(scrollY, [300, 1000], [0, -50]),
        }}
      />
      
      <motion.div 
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/10 opacity-70"
        style={{
          y: useTransform(scrollY, [600, 1200], [0, -70]),
        }}
      />
      
      <Container>
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Популярные товары</h2>
            <p className="mt-2 text-muted-foreground">Наши самые популярные товары, подобранные для вас</p>
          </div>
          <Link 
            to="/products" 
            className="hidden sm:flex items-center text-sm font-medium hover:text-primary transition-colors"
          >
            Смотреть все
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </motion.div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-8 sm:hidden">
          <Link 
            to="/products" 
            className="flex items-center justify-center text-sm font-medium hover:text-primary transition-colors"
          >
            Смотреть все товары
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedProducts;
