
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('name')
          .ilike('name', `%${query}%`)
          .limit(5);

        if (error) {
          throw error;
        }

        const uniqueSuggestions = Array.from(
          new Set(data.map(item => item.name))
        );
        
        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error('Ошибка при получении подсказок:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Добавляем небольшую задержку для уменьшения количества запросов
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};
