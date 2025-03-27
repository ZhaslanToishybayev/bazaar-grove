
import { useEffect, useState } from 'react';

type ScrollValues = {
  scrollY: number;
  scrollYProgress: number;
};

export function useScrollAnimation(): ScrollValues {
  const [scrollValues, setScrollValues] = useState<ScrollValues>({
    scrollY: 0,
    scrollYProgress: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollYProgress = docHeight ? scrollY / docHeight : 0;
      
      setScrollValues({
        scrollY,
        scrollYProgress,
      });
    };

    // Set initial values
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollValues;
}
