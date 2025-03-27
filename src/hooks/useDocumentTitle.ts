
import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    // Сохраняем оригинальный заголовок
    const originalTitle = document.title;
    
    // Устанавливаем новый заголовок
    document.title = title;
    
    // При размонтировании компонента восстанавливаем оригинальный заголовок
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
