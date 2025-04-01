import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Обработчик HTTP-запросов
serve(async (req) => {
  // Проверяем метод запроса
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }
  
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Метод не поддерживается' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }
  
  try {
    // Список функций, которые должны быть доступны
    const expectedFunctions = [
      {
        name: 'create-checkout-session',
        path: '/create-checkout-session',
        webhook_path: '/create-checkout-session/webhook',
        description: 'Обработка создания сессии оплаты и вебхуков от Stripe',
        required_env_vars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
      },
      {
        name: 'check-environment',
        path: '/check-environment',
        description: 'Проверка доступности переменных окружения',
        required_env_vars: [],
      },
      {
        name: 'list-functions',
        path: '/list-functions',
        description: 'Возвращает список доступных функций',
        required_env_vars: [],
      }
    ];
    
    // Список действий для устранения проблем
    const troubleshooting = [
      'Если функция не отвечает, убедитесь, что она опубликована в Supabase',
      'Проверьте, что все необходимые переменные окружения заданы',
      'Убедитесь, что URL функции правильный (без лишних пробелов)',
      'В случае ошибок проверьте логи в панели Supabase Functions'
    ];
    
    return new Response(JSON.stringify({
      status: 'success',
      functions: expectedFunctions,
      troubleshooting,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Ошибка при получении списка функций:', error);
    return new Response(JSON.stringify({ 
      error: 'Ошибка при получении списка функций',
      message: error.message 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
}); 