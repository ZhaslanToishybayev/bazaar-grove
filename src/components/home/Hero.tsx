
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { Button } from '../ui/button';

const Hero = () => {
  return (
    <section className="relative pt-20 pb-24 sm:pt-24 sm:pb-32 overflow-hidden">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
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
              <Button
                size="lg"
                className="rounded-full shadow-md animate-fade-in opacity-0"
                style={{ animationDelay: '0.6s' }}
              >
                Начать покупки
              </Button>
              <Link 
                to="/categories"
                className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors animate-fade-in opacity-0"
                style={{ animationDelay: '0.8s' }}
              >
                Просмотреть категории
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="relative animate-slide-down opacity-0" style={{ animationDelay: '0.4s' }}>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1pbmltYWxpc3QlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D" 
                alt="Витрина премиум товаров" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
              <div className="glass-panel py-3 px-5 rounded-xl">
                <p className="text-sm font-medium">Нам доверяют</p>
                <p className="text-3xl font-bold">12,000+</p>
                <p className="text-xs text-muted-foreground">довольных клиентов</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/30 blur-3xl opacity-20"></div>
    </section>
  );
};

export default Hero;
