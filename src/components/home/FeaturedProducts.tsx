
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import ProductCard from '../ui/ProductCard';
import { getFeaturedProducts, Product } from '@/lib/data';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex items-center justify-between mb-8">
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
        </div>
        
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
            {featuredProducts.map((product) => (
              <div 
                key={product.id} 
                className="animate-fade-in opacity-0"
                style={{ animationDelay: `${0.1 + Number(product.id) * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
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
