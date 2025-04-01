import { supabase } from '@/integrations/supabase/client';

/**
 * Проверяет конфигурацию вебхуков Stripe в Supabase Function
 */
export const testWebhookSetup = async (): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, any>;
}> => {
  try {
    // 1. Проверяем таблицы для хранения заказов
    console.log('Проверка таблиц для заказов...');
    const { error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['orders', 'order_items']);

    if (tablesError) {
      return {
        success: false,
        message: 'Не удалось проверить наличие таблиц',
        details: {
          error: tablesError.message,
          hint: 'Убедитесь, что у вас есть доступ к схеме information_schema'
        }
      };
    }

    // 2. Проверяем доступность Supabase Functions (просто запрос к каталогу функций)
    console.log('Проверка доступности Supabase Functions...');
    const { data: functionsResponse, error: functionsError } = await supabase
      .functions
      .invoke('list-functions', {
        method: 'GET',
      })
      .catch(() => ({ data: null, error: { message: 'Функция list-functions не найдена' } }));

    if (functionsError) {
      return {
        success: false,
        message: 'Невозможно проверить Supabase Functions',
        details: {
          error: functionsError.message,
          hint: 'Убедитесь, что у вас настроены Edge Functions в Supabase'
        }
      };
    }

    // 3. Проверка ключей Stripe в переменных окружения
    console.log('Проверка переменных окружения для Stripe...');
    const { data: envVars, error: envError } = await supabase
      .functions
      .invoke('check-environment', {
        method: 'GET',
      })
      .catch(() => ({ 
        data: null, 
        error: { message: 'Функция check-environment не найдена' } 
      }));

    if (envError) {
      return {
        success: false,
        message: 'Невозможно проверить переменные окружения',
        details: {
          error: envError.message,
          hint: 'Создайте функцию check-environment для проверки переменных окружения'
        }
      };
    }

    // 4. Сбор результатов проверок
    const checks = {
      tables: {
        orders: tablesError ? false : true,
        order_items: tablesError ? false : true
      },
      functions: functionsError ? false : true,
      environment: envError ? false : (envVars || {})
    };

    if (tablesError || functionsError || envError) {
      return {
        success: false,
        message: 'Некоторые проверки не прошли',
        details: checks
      };
    }

    return {
      success: true,
      message: 'Все проверки прошли успешно',
      details: checks
    };
  } catch (error) {
    console.error('Ошибка при проверке настройки вебхуков:', error);
    return {
      success: false,
      message: 'Произошла ошибка при проверке настройки вебхуков',
      details: {
        error: error.message
      }
    };
  }
};

/**
 * Проверяет, правильно ли настроен вебхук для оформления заказа
 */
export const checkStripeWebhookSetup = (): {
  url: string;
  instructions: string[];
  prerequisites: string[];
} => {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] || 'your-project-ref';
  
  const webhookUrl = `https://${projectRef}.functions.supabase.co/create-checkout-session/webhook`;

  return {
    url: webhookUrl,
    instructions: [
      '1. Войдите в панель управления Stripe (https://dashboard.stripe.com)',
      '2. Перейдите в раздел Developers > Webhooks',
      '3. Нажмите "Add endpoint"',
      `4. Введите URL: ${webhookUrl}`,
      '5. Выберите событие "checkout.session.completed"',
      '6. Сохраните вебхук и скопируйте Signing Secret',
      '7. Добавьте Signing Secret в переменные окружения Supabase Functions (STRIPE_WEBHOOK_SECRET)'
    ],
    prerequisites: [
      'Создайте таблицы orders и order_items в базе данных',
      'Убедитесь, что переменные STRIPE_SECRET_KEY и STRIPE_WEBHOOK_SECRET заданы в Supabase Functions',
      'Функция create-checkout-session должна быть опубликована в Supabase'
    ]
  };
};

/**
 * Проверяет ответ от вебхука и выдаёт рекомендации по устранению проблем
 */
export const analyzeWebhookResponse = (
  statusCode: number, 
  responseText: string
): { 
  status: 'success' | 'error' | 'warning'; 
  message: string; 
  solution?: string[];
} => {
  if (statusCode === 200) {
    return {
      status: 'success',
      message: 'Вебхук ответил успешно',
    };
  }

  // Обработка ошибки "Missing authorization header"
  if (statusCode === 401 || responseText.includes('authorization header')) {
    return {
      status: 'error',
      message: 'Ошибка авторизации: отсутствует заголовок авторизации',
      solution: [
        'Вебхук должен вызываться только из Stripe с правильным заголовком stripe-signature',
        'При прямом обращении через браузер эта ошибка ожидаема и не является проблемой',
        'Для проверки вебхука используйте тестовые платежи через интерфейс сайта'
      ]
    };
  }

  // Обработка ошибки с таблицами
  if (responseText.includes('does not exist') || responseText.includes('Table check failed')) {
    return {
      status: 'error',
      message: 'Ошибка базы данных: отсутствуют необходимые таблицы',
      solution: [
        'Выполните миграцию для создания таблиц orders и order_items',
        'Убедитесь, что таблицы созданы с правильной структурой',
        'Проверьте права доступа сервисной роли к таблицам'
      ]
    };
  }

  // Обработка ошибок с переменными окружения
  if (responseText.includes('not configured') || responseText.includes('secret')) {
    return {
      status: 'error',
      message: 'Ошибка конфигурации: отсутствуют необходимые переменные окружения',
      solution: [
        'Убедитесь, что переменные STRIPE_SECRET_KEY и STRIPE_WEBHOOK_SECRET заданы в Supabase Functions',
        'Проверьте, что значения переменных окружения правильные (скопированы из Stripe без ошибок)'
      ]
    };
  }

  // Общая ошибка
  return {
    status: 'error',
    message: `Неизвестная ошибка: ${responseText}`,
    solution: [
      'Проверьте логи Supabase Functions для получения дополнительной информации',
      'Убедитесь, что функция create-checkout-session опубликована',
      'Проверьте структуру запроса, отправляемого в вебхук'
    ]
  };
}; 