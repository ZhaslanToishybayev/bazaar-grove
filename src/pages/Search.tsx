
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Container from '@/components/ui/Container';
import SearchBar from '@/components/ui/SearchBar';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/data';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useDocumentTitle(`Поиск: ${query}`);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        // Поиск товаров по имени и описанию
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
          
        if (error) {
          throw error;
        }
        
        setProducts(data as Product[]);
      } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-muted py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Поиск товаров</h1>
          <div className="max-w-lg">
            <SearchBar 
              placeholder="Поиск товаров..."
              className="mb-4"
            />
          </div>
          {query && (
            <p className="text-muted-foreground">
              Результаты поиска для: <span className="font-medium text-foreground">"{query}"</span>
            </p>
          )}
        </Container>
      </div>
      
      <Container className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div>
                <p className="mb-6 text-muted-foreground">Найдено товаров: {products.length}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-medium mb-2">Товары не найдены</h2>
                <p className="text-muted-foreground mb-8">
                  К сожалению, мы не нашли товаров, соответствующих вашему запросу
                </p>
                <p className="text-sm text-muted-foreground">
                  Попробуйте изменить поисковый запрос или просмотреть все наши товары в каталоге
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Search;
