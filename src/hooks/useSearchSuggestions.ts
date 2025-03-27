
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async () => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Получаем сначала по названию товара
      const { data: nameData, error: nameError } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (nameError) {
        throw nameError;
      }

      // Если нашли меньше 5 названий, дополняем результатами из описаний
      let descriptionData: any[] = [];
      if (nameData.length < 5) {
        const { data: descData, error: descError } = await supabase
          .from('products')
          .select('description')
          .not('description', 'is', null)
          .ilike('description', `%${query}%`)
          .limit(5 - nameData.length);

        if (descError) {
          throw descError;
        }

        descriptionData = descData
          .filter(item => item.description) // Убедимся, что описание не null
          .map(item => {
            // Получаем контекст вокруг поискового запроса
            const desc = item.description;
            const index = desc.toLowerCase().indexOf(query.toLowerCase());
            const start = Math.max(0, index - 15);
            const end = Math.min(desc.length, index + query.length + 15);
            const context = desc.substring(start, end);
            return context.trim() + (end < desc.length ? '...' : '');
          });
      }

      // Объединяем результаты и удаляем дубликаты
      const combinedResults = [
        ...nameData.map(item => item.name),
        ...descriptionData
      ];
      
      const uniqueSuggestions = Array.from(new Set(combinedResults));
      setSuggestions(uniqueSuggestions);
    } catch (err) {
      console.error('Ошибка при получении подсказок:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      setSuggestions([]);
      
      // Не показываем уведомление при поиске подсказок
      // toast({
      //   title: "Ошибка поиска",
      //   description: "Не удалось получить подсказки для поиска",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // Добавляем небольшую задержку для уменьшения количества запросов
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refetch: fetchSuggestions };
};
