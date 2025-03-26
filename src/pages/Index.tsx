
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoryCard from '../components/ui/CategoryCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data';

// Category images
const categoryImages = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D',
  'Accessories': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww',
  'Home': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9tZSUyMGRlY29yfGVufDB8fDB8fHww',
  'Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zml0bmVzcyUyMGVxdWlwbWVudHxlbnwwfHwwfHx8MA%3D%3D',
  'Stationery': 'https://images.unsplash.com/photo-1587145717214-e697da9155ec?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3RhdGlvbmVyeXxlbnwwfHwwfHx8MA%3D%3D'
};

const shownCategories = categories.filter(category => category !== 'All').slice(0, 4);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedProducts />
        
        {/* Categories Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
                <p className="mt-2 text-muted-foreground">Explore our curated collections</p>
              </div>
              <Button 
                variant="link" 
                className="hidden md:flex items-center mt-4 md:mt-0"
                asChild
              >
                <a href="/products">
                  View all categories <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {shownCategories.map((category, index) => (
                <CategoryCard 
                  key={category}
                  category={category}
                  image={categoryImages[category] || ''}
                  index={index}
                />
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Button variant="outline" className="rounded-full" asChild>
                <a href="/products">
                  View all categories <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Fast Delivery',
                  description: 'Get your order delivered within 2-3 business days',
                  icon: '🚚'
                },
                {
                  title: 'Secure Payments',
                  description: 'We use industry-leading encryption for all transactions',
                  icon: '🔒'
                },
                {
                  title: 'Quality Guarantee',
                  description: '30-day money-back guarantee on all purchases',
                  icon: '✅'
                }
              ].map((benefit, index) => (
                <div 
                  key={benefit.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-16 sm:py-24 bg-primary/5 rounded-3xl mx-4 sm:mx-8 my-8">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">Subscribe to our newsletter to receive updates on new products, special offers, and more.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex h-12 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button className="h-12 rounded-full px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
