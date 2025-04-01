import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Получаем URL и сервисный ключ из переменных окружения
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Проверяем, что переменные окружения установлены
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY',
        status: 'error'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }
    
    // Получаем URL для анонимного доступа
    // Предполагаем, что это один и тот же URL, но можно было бы получить отдельно
    const publicUrl = supabaseUrl;
    
    // Создаем клиент Supabase с использованием сервисного ключа
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Получаем список ключей API из административного API Supabase
    const { data: apiKeys, error: apiKeysError } = await supabase
      .rpc('get_service_keys')
      .catch(() => ({
        data: null,
        error: { message: 'Функция get_service_keys не найдена или у вас нет прав для ее вызова' }
      }));
    
    if (apiKeysError) {
      // Если не удалось получить ключи напрямую, пробуем создать маскированный ответ
      return new Response(JSON.stringify({
        success: true,
        keys: {
          url: publicUrl,
          anon_key: getMaskedKey('anon'),
          service_key: getMaskedKey('service'),
        },
        note: 'Ключи замаскированы для безопасности. Реальные ключи могут быть получены только из панели управления Supabase.',
        status: 'masked'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });
    }
    
    // Возвращаем успешный ответ с маскированными ключами и URL
    return new Response(JSON.stringify({
      success: true,
      keys: {
        url: publicUrl,
        // Реальные ключи замаскированы для безопасности
        anon_key: apiKeys?.anon_key ? maskApiKey(apiKeys.anon_key) : getMaskedKey('anon'),
        service_key: apiKeys?.service_key ? maskApiKey(apiKeys.service_key) : getMaskedKey('service'),
      },
      status: 'success'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Ошибка при получении ключей:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Произошла ошибка: ${error.message}`,
      status: 'error'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
});

// Маскирует API ключ для безопасности
function maskApiKey(key: string): string {
  if (!key) return "Ключ не задан";
  if (key.length <= 8) return "***";
  
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

// Генерирует фиктивный маскированный ключ, когда реальный ключ недоступен
function getMaskedKey(type: 'anon' | 'service'): string {
  return type === 'anon' 
    ? "eyXX...XXXX" 
    : "eyXX...XXXX";
} 