
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';

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
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Electronics', 'Accessories', 'Home', 'Fitness'].map((category) => (
                <div 
                  key={category} 
                  className="relative overflow-hidden rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300 aspect-square flex items-center justify-center group animate-zoom-in opacity-0"
                  style={{ animationDelay: `${0.1 + ['Electronics', 'Accessories', 'Home', 'Fitness'].indexOf(category) * 0.1}s` }}
                >
                  <span className="absolute inset-0 opacity-0 bg-black/5 group-hover:opacity-100 transition-opacity z-10"></span>
                  <h3 className="text-lg font-medium z-20">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-16 sm:py-24">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">Subscribe to our newsletter to receive updates on new products, special offers, and more.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 h-10 px-4 py-2">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
