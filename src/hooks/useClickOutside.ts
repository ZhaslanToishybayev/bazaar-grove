import { useEffect, RefObject } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>, 
  handler: () => void,
  exceptionalRefs: RefObject<HTMLElement>[] = []
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Проверяем, содержит ли ref элемент, на котором произошло событие
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      
      // Проверяем, содержит ли какой-либо из исключенных рефов элемент, на котором произошло событие
      for (const exceptRef of exceptionalRefs) {
        if (exceptRef.current && exceptRef.current.contains(target)) {
          return;
        }
      }
      
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, exceptionalRefs]);
}; 