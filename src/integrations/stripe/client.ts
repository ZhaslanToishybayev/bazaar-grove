import { loadStripe, Stripe } from '@stripe/stripe-js';

// Публичный ключ Stripe, должен быть заменен на реальный
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key';

// Singleton для Stripe клиента
let stripePromise: Promise<Stripe | null>;

/**
 * Получение singleton экземпляра Stripe клиента
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  
  return stripePromise;
};

/**
 * Проверяет, настроена ли Stripe интеграция
 */
export const isStripeConfigured = (): boolean => {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  console.log('Stripe key:', key);
  return key !== 'pk_test_your_key' && 
         key !== undefined && 
         key !== '';
};

/**
 * Форматирует цену для отображения
 * @param amount - сумма в минимальных единицах валюты (центы)
 * @param currency - код валюты
 */
export const formatStripePrice = (amount: number, currency: string = 'RUB'): string => {
  // Преобразуем из центов в основную единицу валюты
  const majorUnitAmount = amount / 100;
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(majorUnitAmount);
};

/**
 * Преобразует цену из формата хранения (например, рубли) в формат Stripe (копейки)
 * @param amount - сумма в основных единицах валюты (рубли)
 */
export const convertToStripeAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Сохраняет информацию о сессии Stripe в localStorage
 * @param sessionId - ID сессии Stripe
 * @param metadata - дополнительные метаданные
 */
export const saveStripeSessionInfo = (sessionId: string, metadata: any = {}): void => {
  try {
    localStorage.setItem('stripe_session_id', sessionId);
    localStorage.setItem('stripe_session_metadata', JSON.stringify(metadata));
    localStorage.setItem('stripe_session_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Ошибка при сохранении данных сессии Stripe:', error);
  }
};

/**
 * Получает информацию о последней сессии Stripe из localStorage
 */
export const getStripeSessionInfo = (): { 
  sessionId: string | null; 
  metadata: any; 
  timestamp: number | null;
} => {
  try {
    const sessionId = localStorage.getItem('stripe_session_id');
    const metadataStr = localStorage.getItem('stripe_session_metadata');
    const timestamp = localStorage.getItem('stripe_session_timestamp');
    
    return {
      sessionId,
      metadata: metadataStr ? JSON.parse(metadataStr) : {},
      timestamp: timestamp ? parseInt(timestamp, 10) : null
    };
  } catch (error) {
    console.error('Ошибка при получении данных сессии Stripe:', error);
    return { sessionId: null, metadata: {}, timestamp: null };
  }
};

/**
 * Очищает информацию о сессии Stripe из localStorage
 */
export const clearStripeSessionInfo = (): void => {
  try {
    localStorage.removeItem('stripe_session_id');
    localStorage.removeItem('stripe_session_metadata');
    localStorage.removeItem('stripe_session_timestamp');
  } catch (error) {
    console.error('Ошибка при очистке данных сессии Stripe:', error);
  }
}; 