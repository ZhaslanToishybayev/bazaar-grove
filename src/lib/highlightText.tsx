
import React from 'react';

/**
 * Подсвечивает совпадения в тексте
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
    // Экранируем спецсимволы регулярного выражения
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Разбиваем текст по совпадениям
    const parts = text.split(regex);
    
    // Возвращаем jsx с подсвеченными совпадениями
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className={className}>{part}</mark> : part
    );
  } catch (error) {
    console.error('Ошибка при подсветке текста:', error);
    return text;
  }
};
