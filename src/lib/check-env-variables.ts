import { supabase } from '@/integrations/supabase/client';

/**
 * Проверяет наличие необходимых переменных окружения
 */
export const checkEnvironmentVariables = async () => {
  const results: Record<string, { exists: boolean; hint?: string }> = {};
  
  // Проверяем переменные Supabase в локальном окружении
  results['NEXT_PUBLIC_SUPABASE_URL'] = {
    exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hint: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      `Найден: ${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15)}...` : 
      'Отсутствует в .env'
  };
  
  results['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = {
    exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hint: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      'Найден' : 
      'Отсутствует в .env'
  };
  
  // Проверяем переменные в Supabase Functions с помощью вызова функции check-environment
  try {
    const { data, error } = await supabase.functions.invoke('check-environment');
    
    if (error) {
      results['SUPABASE_FUNCTIONS'] = {
        exists: false,
        hint: `Ошибка при проверке: ${error.message}`
      };
    } else if (data) {
      // Добавляем результаты из Supabase Functions
      if (data.results) {
        Object.keys(data.results).forEach(key => {
          results[`REMOTE_${key}`] = {
            exists: data.results[key].exists,
            hint: data.results[key].masked_value ? 
              `Найден в Supabase Functions: ${data.results[key].masked_value}` : 
              'Отсутствует в Supabase Functions'
          };
        });
      }
    }
  } catch (e) {
    results['SUPABASE_FUNCTIONS_ERROR'] = {
      exists: false,
      hint: `Не удалось проверить переменные в Supabase Functions: ${e.message}`
    };
  }
  
  return {
    success: Object.values(results).every(r => r.exists),
    results,
    timestamp: new Date().toISOString()
  };
};

/**
 * Генерирует URL для настройки переменных окружения
 */
export const getEnvironmentSetupUrl = () => {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
  
  if (!projectRef) {
    return 'https://app.supabase.com/';
  }
  
  return `https://app.supabase.com/project/${projectRef}/settings/functions`;
};

/**
 * Получает URL для получения ключей Stripe
 */
export const getStripeKeysUrl = () => {
  return 'https://dashboard.stripe.com/apikeys';
};

/**
 * Получает URL для настройки вебхуков Stripe
 */
export const getStripeWebhooksUrl = () => {
  return 'https://dashboard.stripe.com/test/webhooks';
}; 