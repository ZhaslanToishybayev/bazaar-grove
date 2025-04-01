import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { getProducts, Product } from '@/lib/data';
import { useClickOutside } from '@/hooks/useClickOutside';

const NavSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useClickOutside(searchContainerRef, () => {
    setIsOpen(false);
    setIsFocused(false);
  });
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products for search:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const results = products
      .filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term))
      )
      .slice(0, 5); // Ограничиваем до 5 результатов для лучшего UX
    
    setFilteredProducts(results);
  }, [searchTerm, products]);
  
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary font-medium">$1</mark>');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
    setSearchTerm('');
    setIsOpen(false);
  };
  
  return (
    <div ref={searchContainerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.trim() !== '');
          }}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "pr-10 w-full transition-all bg-secondary/50 focus-visible:bg-background",
            isFocused && "border-primary shadow-sm"
          )}
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 top-0 h-full px-3"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="py-1">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="flex items-start gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
              >
                <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(product.name, searchTerm) 
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <p className="text-xs font-semibold mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="px-3 py-2 border-t">
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                Все результаты для "{searchTerm}"
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && searchTerm.trim() !== '' && filteredProducts.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Ничего не найдено для "{searchTerm}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavSearchBar;
