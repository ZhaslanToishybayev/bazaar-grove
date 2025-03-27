
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isFuzzyMatch } from '@/lib/fuzzySearch';

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
        .limit(10);

      if (nameError) {
        throw nameError;
      }

      // Получаем товары с описаниями
      const { data: descData, error: descError } = await supabase
        .from('products')
        .select('description')
        .not('description', 'is', null)
        .limit(15);

      if (descError) {
        throw descError;
      }

      // Применяем нечеткий поиск к названиям товаров
      const matchedNames = nameData
        .filter(item => isFuzzyMatch(item.name, query))
        .map(item => item.name);

      // Применяем нечеткий поиск к описаниям, с выделением контекста
      const matchedDescriptions = descData
        .filter(item => item.description && isFuzzyMatch(item.description, query))
        .map(item => {
          const desc = item.description;
          // Ищем приблизительное место совпадения
          // Сначала проверяем точное вхождение
          let index = desc.toLowerCase().indexOf(query.toLowerCase());
          
          // Если точного вхождения нет, ищем по словам
          if (index === -1) {
            const words = desc.toLowerCase().split(/\s+/);
            const queryWords = query.toLowerCase().split(/\s+/);
            
            // Ищем первое слово с близким совпадением
            for (let i = 0; i < words.length; i++) {
              for (const queryWord of queryWords) {
                if (queryWord.length >= 3 && isFuzzyMatch(words[i], queryWord, 0.2)) {
                  // Находим индекс этого слова в исходной строке
                  const prevWordsLength = words.slice(0, i).join(' ').length;
                  index = prevWordsLength + (i > 0 ? 1 : 0); // +1 для пробела
                  break;
                }
              }
              if (index !== -1) break;
            }
          }
          
          // Если все еще не нашли совпадения, берем начало описания
          if (index === -1) {
            index = 0;
          }
          
          const start = Math.max(0, index - 20);
          const end = Math.min(desc.length, index + 40);
          const context = desc.substring(start, end);
          return (start > 0 ? '...' : '') + context.trim() + (end < desc.length ? '...' : '');
        });

      // Объединяем результаты, сначала названия, потом описания
      const combinedResults = [
        ...matchedNames,
        ...matchedDescriptions
      ];
      
      const uniqueSuggestions = Array.from(new Set(combinedResults));
      setSuggestions(uniqueSuggestions);
    } catch (err) {
      console.error('Ошибка при получении подсказок:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
      setSuggestions([]);
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
