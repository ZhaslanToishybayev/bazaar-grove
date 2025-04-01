import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Функция для проверки переменных окружения
const checkEnvironment = () => {
  // Список переменных окружения, которые нужно проверить
  const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  
  // Результаты проверки
  const results: Record<string, {
    exists: boolean;
    masked_value?: string;
  }> = {};
  
  // Проверяем каждую переменную окружения
  for (const envVar of requiredEnvVars) {
    const value = Deno.env.get(envVar);
    results[envVar] = {
      exists: !!value,
      // Если значение существует, показываем замаскированную версию для проверки
      masked_value: value ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : undefined
    };
  }
  
  // Проверяем доступность Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  results['SUPABASE_CONNECTION'] = {
    exists: !!(supabaseUrl && supabaseKey),
    masked_value: supabaseUrl ? 
      `${supabaseUrl.substring(0, 15)}...${supabaseUrl.substring(supabaseUrl.length - 10)}` : 
      undefined
  };
  
  return {
    status: 'success',
    results,
    timestamp: new Date().toISOString()
  };
};

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
    const result = checkEnvironment();
    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Ошибка при проверке окружения:', error);
    return new Response(JSON.stringify({ 
      error: 'Ошибка при проверке окружения',
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