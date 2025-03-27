
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, Filter } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Container from '@/components/ui/Container';
import SearchBar from '@/components/ui/SearchBar';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/data';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { highlightText } from '@/lib/highlightText';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Популярные поисковые запросы
const popularSearches = [
  'Часы', 'Наушники', 'Кошелек', 'Лампа', 'Чашка', 'Блокнот', 'Бутылка', 'Колонка'
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { toast } = useToast();
  useDocumentTitle(`Поиск: ${query}`);

  useEffect(() => {
    // Загрузка недавних поисковых запросов из localStorage
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
    
    // Сохранение текущего запроса в историю поиска
    if (query) {
      const updatedSearches = storedSearches 
        ? Array.from(new Set([query, ...JSON.parse(storedSearches)])).slice(0, 5) 
        : [query];
      
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    }
  }, [query]);

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
        
        if (data.length > 0) {
          toast({
            title: "Найдено товаров",
            description: `По запросу "${query}" найдено ${data.length} товаров`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Ошибка при поиске товаров:', error);
        toast({
          title: "Ошибка поиска",
          description: "Не удалось выполнить поисковый запрос",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, toast]);

  // Улучшенное отображение карточки продукта с подсветкой
  const renderProductCard = (product: Product) => {
    return (
      <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <ProductCard product={product} />
        {(product.name.toLowerCase().includes(query.toLowerCase()) || 
         (product.description && product.description.toLowerCase().includes(query.toLowerCase()))) && (
          <div className="p-4 pt-0">
            {product.name.toLowerCase().includes(query.toLowerCase()) && (
              <p className="text-sm mb-1">
                <span className="font-medium mr-1">Название:</span>
                <span>{highlightText(product.name, query)}</span>
              </p>
            )}
            {product.description && product.description.toLowerCase().includes(query.toLowerCase()) && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium mr-1">Описание:</span>
                <span className="line-clamp-2">{highlightText(product.description, query)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
    toast({
      title: "История очищена",
      description: "История поисковых запросов была успешно очищена",
    });
  };

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
            {query ? (
              <>
                {products.length > 0 ? (
                  <div>
                    <p className="mb-6 text-muted-foreground">Найдено товаров: {products.length}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map(renderProductCard)}
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
            ) : (
              <div className="py-8">
                {recentSearches.length > 0 && (
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium">Недавние запросы</h2>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearRecentSearches}
                      >
                        Очистить историю
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <a 
                          key={index}
                          href={`/search?q=${encodeURIComponent(term)}`}
                          className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
                        >
                          {term}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-medium mb-4">Популярные запросы</h2>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, index) => (
                      <a 
                        key={index}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors flex items-center"
                      >
                        <SearchIcon size={14} className="mr-1 opacity-70" />
                        {term}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Search;
