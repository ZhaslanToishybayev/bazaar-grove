
import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Container from '../ui/Container';
import { Button } from '../ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScrollAnimation();
  
  return (
    <section className="relative pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden" ref={containerRef}>
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="animate-slide-up opacity-0" 
            style={{ animationDelay: '0.2s' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Добро пожаловать в BazaarGrove
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance">
              Откройте для себя премиум товары для современной жизни
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Тщательно подобранная коллекция высококачественных товаров, созданных с учетом простоты, функциональности и элегантности.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  className="rounded-full shadow-md"
                >
                  Начать покупки
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link 
                  to="/categories"
                  className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors"
                >
                  Просмотреть категории
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          <div className="relative">
            <motion.div 
              className="aspect-square rounded-2xl overflow-hidden"
              style={{
                y: useTransform(scrollY, [0, 500], [0, 100]),
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1pbmltYWxpc3QlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D" 
                alt="Витрина премиум товаров" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-6 -left-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{
                x: useTransform(scrollY, [0, 500], [0, -50]),
              }}
            >
              <div className="glass-panel py-3 px-5 rounded-xl">
                <p className="text-sm font-medium">Нам доверяют</p>
                <p className="text-3xl font-bold">12,000+</p>
                <p className="text-xs text-muted-foreground">довольных клиентов</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
      
      {/* Parallax background elements */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/30 blur-3xl opacity-20"
        style={{
          y: useTransform(scrollY, [0, 500], [0, 150]),
          scale: useTransform(scrollY, [0, 500], [1, 1.2]),
        }}
      />
      
      <motion.div 
        className="hidden md:block absolute top-1/4 right-[10%] w-24 h-24 rounded-full bg-primary/20 blur-2xl"
        style={{
          y: useTransform(scrollY, [0, 500], [0, 100]),
          x: useTransform(scrollY, [0, 500], [0, -50]),
        }}
      />
      
      <motion.div 
        className="hidden md:block absolute bottom-1/4 left-[10%] w-32 h-32 rounded-full bg-blue-500/20 blur-2xl"
        style={{
          y: useTransform(scrollY, [0, 500], [0, -80]),
        }}
      />
    </section>
  );
};

export default Hero;
