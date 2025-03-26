
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import ProductCard from '../ui/ProductCard';
import { getFeaturedProducts } from '@/lib/data';

const FeaturedProducts = () => {
  const featuredProducts = getFeaturedProducts();
  
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Our most popular items selected for you</p>
          </div>
          <Link 
            to="/products" 
            className="hidden sm:flex items-center text-sm font-medium hover:text-primary transition-colors"
          >
            View All
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
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
        
        <div className="mt-8 sm:hidden">
          <Link 
            to="/products" 
            className="flex items-center justify-center text-sm font-medium hover:text-primary transition-colors"
          >
            View All Products
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedProducts;
