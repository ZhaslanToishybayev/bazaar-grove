/**
 * Описание Edge Function для создания Checkout сессии Stripe
 * 
 * Эта функция должна быть развернута в Supabase как Edge Function.
 * Исходный код функции находится в проекте в директории:
 * /supabase/functions/create-checkout-session/
 * 
 * Функция предоставляет следующие эндпоинты:
 * 
 * 1. POST /create-checkout-session
 *    Создает новую Checkout сессию в Stripe
 *    Тело запроса:
 *    {
 *      line_items: Array - массив товаров в формате Stripe
 *      customer_email: string - email клиента
 *      metadata: Object - дополнительные данные для сохранения в сессии
 *    }
 * 
 * 2. POST /create-checkout-session/webhook
 *    Обрабатывает webhook от Stripe о завершении оплаты
 *    Создает запись заказа в базе данных
 * 
 * 3. POST /create-checkout-session/check-status
 *    Проверяет статус сессии оплаты
 *    Тело запроса:
 *    {
 *      session_id: string - ID сессии Stripe
 *    }
 * 
 * 4. GET /create-checkout-session/config
 *    Проверяет настройку Stripe
 * 
 * Необходимые переменные окружения в Supabase:
 * - STRIPE_SECRET_KEY: секретный ключ Stripe
 * - STRIPE_WEBHOOK_SECRET: секретный ключ для проверки вебхуков Stripe
 */

/**
 * Структура метаданных для создания заказа через webhook
 */
export interface CheckoutSessionMetadata {
  user_id: string;
  cart_items: string; // JSON строка с товарами
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  phone?: string;
}

/**
 * Структура ответа от эндпоинта создания сессии
 */
export interface CreateCheckoutSessionResponse {
  id: string;      // ID сессии
  url: string;     // URL для перенаправления клиента
}

/**
 * Структура ответа от эндпоинта проверки статуса
 */
export interface CheckSessionStatusResponse {
  status: string;         // Статус сессии (complete, open)
  payment_status: string; // Статус платежа (paid, unpaid)
  order_id?: string;      // ID созданного заказа, если есть
}

/**
 * Структура ответа от эндпоинта проверки конфигурации
 */
export interface ConfigCheckResponse {
  configured: boolean;      // Настроен ли Stripe полностью
  hasStripeKey: boolean;    // Есть ли ключ Stripe
  hasWebhookSecret: boolean; // Есть ли секрет для вебхуков
  message: string;          // Сообщение о статусе
}

/**
 * Структура ошибки для ответов API
 */
export interface ApiErrorResponse {
  error: string;       // Краткое описание ошибки
  message?: string;    // Подробное сообщение
  code?: string;       // Код ошибки
}

/**
 * Формат товаров для отправки в Stripe
 */
export interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
      metadata?: Record<string, string>;
    };
    unit_amount: number; // Сумма в минимальных единицах валюты (копейках)
  };
  quantity: number;
} 