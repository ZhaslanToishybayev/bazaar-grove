
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import CategoryCard from '../components/ui/CategoryCard';
import { categories } from '@/lib/data';

// Category images
const categoryImages = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D',
  'Accessories': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww',
  'Home': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9tZSUyMGRlY29yfGVufDB8fDB8fHww',
  'Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zml0bmVzcyUyMGVxdWlwbWVudHxlbnwwfHwwfHx8MA%3D%3D',
  'Stationery': 'https://images.unsplash.com/photo-1587145717214-e697da9155ec?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RhdGlvbmVyeXxlbnwwfHwwfHx8MA%3D%3D'
};

const Categories = () => {
  const allCategories = categories.filter(category => category !== 'All');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <Container>
          <div className="py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Категории товаров</h1>
            <p className="text-muted-foreground max-w-3xl mb-12">
              Исследуйте наши разнообразные категории продуктов и найдите именно то, что ищете.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCategories.map((category, index) => (
                <CategoryCard 
                  key={category}
                  category={category}
                  image={categoryImages[category] || ''}
                  index={index}
                  className="h-64"
                />
              ))}
            </div>
            
            {/* Featured Category */}
            <div className="mt-20 border-t border-muted pt-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Популярная категория</h2>
                  <h3 className="text-xl font-medium text-primary mb-4">Электроника</h3>
                  <p className="text-muted-foreground mb-8">
                    Наша коллекция электроники включает в себя самые современные устройства и гаджеты от ведущих производителей. 
                    Все товары проходят тщательный отбор и проверку качества перед тем, как попасть к нашим клиентам.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      Смартфоны и аксессуары
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      Ноутбуки и компьютеры
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      Аудио и видео техника
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      Умный дом и гаджеты
                    </li>
                  </ul>
                  <a 
                    href="/products?category=Electronics"
                    className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Смотреть все товары
                  </a>
                </div>
                <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                  <img 
                    src={categoryImages['Electronics']}
                    alt="Электроника"
                    className="rounded-xl w-full h-auto object-cover aspect-[4/3]"
                  />
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

export default Categories;
