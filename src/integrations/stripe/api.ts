import type { CartItem } from "@/lib/cart/types";
import { getStripeSessionInfo, clearStripeSessionInfo } from "./client";
import { supabase } from "@/integrations/supabase/client";

/**
 * Интерфейс для данных доставки
 */
export interface ShippingDetails {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface CreateCheckoutResponse {
  success: boolean;
  message: string;
  url?: string;
  sessionId?: string;
  error?: any;
}

/**
 * Создает Stripe Checkout сессию через Supabase Edge Function
 */
export async function createCheckoutSession(
  cartItems: CartItem[],
  userEmail: string | null,
  userId: string | null,
  shippingDetails: ShippingDetails
): Promise<CreateCheckoutResponse> {
  try {
    // Проверяем наличие корзины
    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        message: 'Корзина пуста'
      };
    }

    // Проверяем подключение к Stripe
    const { data: configData, error: configError } = await supabase.functions.invoke(
      'create-checkout-session/config',
      {
        method: 'GET',
      }
    );

    if (configError) {
      console.error('[API] Error checking Stripe config:', configError);
      return {
        success: false,
        message: 'Не удалось подключиться к Stripe. Детали в консоли.',
        error: configError
      };
    }
    
    if (!configData.configured) {
      console.warn('[API] Stripe integration not fully configured:', configData);
      return {
        success: false,
        message: 'Stripe интеграция не настроена полностью.',
        error: configData
      };
    }

    // Преобразуем товары корзины в формат Stripe
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'rub',
        product_data: {
          name: item.name || `Товар ${item.id}`,
          images: item.image_url ? [item.image_url] : []
        },
        unit_amount: Math.round(item.price * 100) // Цена в копейках
      },
      quantity: item.quantity
    }));
    
    // Создаем объект метаданных для сохранения информации о заказе
    const metadata = {
      user_id: userId || 'anonymous',
      shipping_address: shippingDetails.address,
      shipping_city: shippingDetails.city,
      shipping_postal_code: shippingDetails.postalCode,
      shipping_country: shippingDetails.country,
      phone: shippingDetails.phone
    };

    // Вызываем Edge Function для создания Checkout Session
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: {
          line_items,
          customer_email: userEmail,
          metadata
        }
      }
    );
    
    if (error) {
      console.error('[API] Error invoking Supabase function:', error);
      return {
        success: false,
        message: `Ошибка при создании сессии оплаты: ${error.message || 'Неизвестная ошибка'}`,
        error
      };
    }

    if (!data || !data.id || !data.url) {
      return {
        success: false,
        message: 'Получен некорректный ответ от API',
        error: data
      };
    }

    return {
      success: true,
      message: 'Сессия Stripe успешно создана',
      url: data.url,
      sessionId: data.id
    };
  } catch (error) {
    console.error('Непредвиденная ошибка при создании сессии Stripe:', error);
    return {
      success: false,
      message: 'Произошла непредвиденная ошибка при создании сессии оплаты',
      error
    };
  }
}

/**
 * Проверяет статус Stripe сессии
 */
export async function checkSessionStatus(sessionId: string): Promise<{
  success: boolean;
  message: string;
  status?: string;
  paymentStatus?: string;
  orderId?: string;
  trackingNumber?: string;
  error?: any;
}> {
  try {
    if (!sessionId) {
      return {
        success: false,
        message: 'ID сессии не указан'
      };
    }

    // Вызываем Edge Function для проверки статуса сессии
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session/check-status',
      {
        body: { session_id: sessionId }
      }
    );

    if (error) {
      console.error('Ошибка при проверке статуса сессии:', error);
      return {
        success: false,
        message: `Ошибка при проверке статуса оплаты: ${error.message || 'Неизвестная ошибка'}`,
        error
      };
    }

    if (data.status === 'complete' && data.payment_status === 'paid') {
      // Если оплата завершена успешно, очищаем информацию о сессии
      clearStripeSessionInfo();
    }

    return {
      success: true,
      message: 'Статус сессии успешно получен',
      status: data.status,
      paymentStatus: data.payment_status,
      orderId: data.order_id,
      trackingNumber: data.tracking_number
    };
  } catch (error) {
    console.error('Непредвиденная ошибка при проверке статуса сессии:', error);
    return {
      success: false,
      message: 'Произошла непредвиденная ошибка при проверке статуса оплаты',
      error
    };
  }
}

/**
 * Проверяет, настроена ли Stripe интеграция на сервере
 */
export async function verifyStripeConfiguration(): Promise<{
  success: boolean;
  configured: boolean;
  message: string;
  details?: any;
}> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session/config',
      {
        method: 'GET',
      }
    );

    if (error) {
      console.error('Ошибка при проверке конфигурации Stripe:', error);
      return {
        success: false,
        configured: false,
        message: 'Не удалось проверить конфигурацию Stripe',
        details: error
      };
    }

    return {
      success: true,
      configured: data.configured,
      message: data.message,
      details: data
    };
  } catch (error) {
    console.error('Непредвиденная ошибка при проверке конфигурации Stripe:', error);
    return {
      success: false,
      configured: false,
      message: 'Произошла непредвиденная ошибка при проверке конфигурации Stripe',
      details: error
    };
  }
}

// Функция для сохранения информации о сессии Stripe
function saveStripeSessionInfo(sessionId: string, metadata: any): void {
  try {
    localStorage.setItem('stripe_session_id', sessionId);
    localStorage.setItem('stripe_session_metadata', JSON.stringify(metadata));
    localStorage.setItem('stripe_session_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Ошибка при сохранении данных сессии Stripe:', error);
  }
} 