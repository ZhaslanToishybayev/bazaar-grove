
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const promos = [
  "🎁 Бесплатная доставка при заказе от $100",
  "🔥 Скидка 15% на все товары по промокоду WELCOME15",
  "⏱️ Специальное предложение! Скидка 20% только сегодня!"
];

const PromoBanner: React.FC = () => {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Меняем промо-сообщение каждые 5 секунд
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-primary text-primary-foreground py-2 text-center relative animate-fade-in">
      <p className="text-sm font-medium">{promos[currentPromo]}</p>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" 
        onClick={() => setIsVisible(false)}
        aria-label="Закрыть"
      >
        <X size={14} />
      </Button>
    </div>
  );
};

export default PromoBanner;
