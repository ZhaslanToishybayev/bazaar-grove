import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/ui/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';
import { useCategories, useProductsByCategory } from '@/lib/data';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sort, setSort] = useState<string>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Используем React Query хуки для получения данных с кэшированием
  const { data: categories = ["All"], isLoading: categoriesLoading } = useCategories();
  const { data: products = [], isLoading: productsLoading } = useProductsByCategory(selectedCategory);
  
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Товары</h1>
            <p className="text-muted-foreground mt-2">Исследуйте нашу коллекцию премиум товаров</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Mobile */}
            <div className="lg:hidden">
              <button 
                className="w-full flex items-center justify-between border border-border p-3 rounded-md"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <span className="flex items-center">
                  <Filter size={16} className="mr-2" />
                  Фильтровать товары
                </span>
                <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="mt-4 border border-border rounded-md p-4 bg-white">
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Категории</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          className={`block w-full text-left py-1 px-2 rounded-md text-sm ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Сортировка</h3>
                    <select 
                      className="w-full border border-input bg-background h-9 rounded-md px-3 text-sm"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="newest">Новинки</option>
                      <option value="price-low">Цена: по возрастанию</option>
                      <option value="price-high">Цена: по убыванию</option>
                      <option value="rating">По рейтингу</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filters - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 border border-border rounded-xl p-6 bg-white">
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Категории</h3>
                  <div className="space-y-2">
                    {categoriesLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-8 bg-gray-200 rounded-md"></div>
                        ))}
                      </div>
                    ) : (
                      categories.map(category => (
                        <button
                          key={category}
                          className={`block w-full text-left py-1.5 px-3 rounded-md text-sm ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted transition-colors'}`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Сортировка</h3>
                  <select 
                    className="w-full border border-input bg-background h-9 rounded-md px-3 text-sm"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Новинки</option>
                    <option value="price-low">Цена: по возрастанию</option>
                    <option value="price-high">Цена: по убыванию</option>
                    <option value="rating">По рейтингу</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSort("newest");
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Показано <span className="font-medium">{sortedProducts.length}</span> товаров
                </p>
                <select 
                  className="hidden sm:block border border-input bg-background h-9 rounded-md px-3 text-sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Новинки</option>
                  <option value="price-low">Цена: по возрастанию</option>
                  <option value="price-high">Цена: по убыванию</option>
                  <option value="rating">По рейтингу</option>
                </select>
              </div>
              
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
                      <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="animate-fade-in opacity-0"
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
              
              {!productsLoading && sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Товары не найдены.</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
