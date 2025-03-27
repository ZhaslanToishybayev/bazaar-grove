
import React from 'react';

/**
 * Подсвечивает совпадения в тексте с поддержкой нечеткого поиска
 * @param text - исходный текст
 * @param query - поисковый запрос
 * @param className - класс для подсветки
 */
export const highlightText = (
  text: string, 
  query: string, 
  className = "bg-yellow-100 text-black dark:bg-amber-300/30 dark:text-amber-200"
): React.ReactNode => {
  if (!query || !text) return text;
  
  try {
    // Разбиваем запрос на слова для лучшего совпадения
    const queryWords = query.trim().split(/\s+/).filter(word => word.length >= 2);
    
    if (queryWords.length === 0) return text;
    
    // Если запрос из одного слова, используем стандартный подход
    if (queryWords.length === 1) {
      // Экранируем спецсимволы регулярного выражения
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      
      // Разбиваем текст по совпадениям
      const parts = text.split(regex);
      
      // Возвращаем jsx с подсвеченными совпадениями
      return parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className={className}>{part}</mark> : part
      );
    }
    
    // Для запросов из нескольких слов
    // Создаем регулярное выражение для каждого слова
    const regexes = queryWords.map(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(${escapedWord})`, 'gi');
    });
    
    // Начинаем с целого текста
    let result: React.ReactNode[] = [text];
    
    // Для каждого регулярного выражения применяем подсветку
    regexes.forEach(regex => {
      // Обрабатываем каждый элемент результата
      result = result.flatMap((node, nodeIndex) => {
        // Если элемент уже React-элемент (mark), пропускаем его
        if (typeof node !== 'string') return [node];
        
        // Разбиваем текст по совпадениям текущего регулярного выражения
        const parts = node.split(regex);
        
        // Подсвечиваем совпадения
        return parts.map((part, partIndex) => {
          const key = `${nodeIndex}-${partIndex}`;
          return regex.test(part) 
            ? <mark key={key} className={className}>{part}</mark>
            : part;
        });
      });
    });
    
    return result;
  } catch (error) {
    console.error('Ошибка при подсветке текста:', error);
    return text;
  }
};
