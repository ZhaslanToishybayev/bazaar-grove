
import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import CategoryCard from '../components/ui/CategoryCard';
import { getCategoriesWithImages, Category } from '@/lib/data';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategoriesWithImages();
        setCategories(data);
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
      <main className="flex-grow pt-24">
        <Container>
          <div className="py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Категории товаров</h1>
            <p className="text-muted-foreground max-w-3xl mb-12">
              Исследуйте наши разнообразные категории продуктов и найдите именно то, что ищете.
            </p>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => (
                  <CategoryCard 
                    key={category.id}
                    category={category.name}
                    image={category.image_url || ''}
                    index={index}
                    className="h-64"
                  />
                ))}
              </div>
            )}
            
            {/* Featured Category */}
            {!loading && categories.length > 0 && (
              <div className="mt-20 border-t border-muted pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Популярная категория</h2>
                    <h3 className="text-xl font-medium text-primary mb-4">{categories[0]?.name || 'Электроника'}</h3>
                    <p className="text-muted-foreground mb-8">
                      {categories[0]?.description || 'Наша коллекция электроники включает в себя самые современные устройства и гаджеты от ведущих производителей. Все товары проходят тщательный отбор и проверку качества перед тем, как попасть к нашим клиентам.'}
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
                      href={`/products?category=${categories[0]?.name || 'Electronics'}`}
                      className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      Смотреть все товары
                    </a>
                  </div>
                  <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                    <img 
                      src={categories[0]?.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D'}
                      alt={categories[0]?.name || 'Электроника'}
                      className="rounded-xl w-full h-auto object-cover aspect-[4/3]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
