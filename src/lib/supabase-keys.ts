import { supabase } from '@/integrations/supabase/client';

/**
 * Интерфейс для ключей Supabase
 */
export interface SupabaseKeys {
  url: string;
  anon_key: string;
  service_key?: string;
}

/**
 * Получает ключи Supabase через Edge Function
 */
export const getSupabaseKeys = async (): Promise<{
  success: boolean;
  keys?: SupabaseKeys;
  error?: string;
  status: 'success' | 'error' | 'masked';
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('supabase-keys', {
      method: 'GET',
    });

    if (error) {
      console.error('Ошибка при получении ключей Supabase:', error);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    }

    return {
      success: true,
      keys: data.keys,
      status: data.status || 'success'
    };
  } catch (error) {
    console.error('Неожиданная ошибка при получении ключей Supabase:', error);
    return {
      success: false,
      error: error.message,
      status: 'error'
    };
  }
};

/**
 * Формирует корректные переменные окружения для проекта
 */
export const generateEnvLocalContent = (keys?: SupabaseKeys): string => {
  if (!keys) {
    return `NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;
  }

  return `NEXT_PUBLIC_SUPABASE_URL=${keys.url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${keys.anon_key}`;
};

/**
 * Проверяет текущее подключение к Supabase
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, any>;
}> => {
  try {
    // 1. Проверяем, настроен ли клиент
    if (!supabase) {
      return {
        success: false,
        message: 'Клиент Supabase не инициализирован',
        details: {
          suggestion: 'Проверьте, что переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY заданы верно'
        }
      };
    }

    // 2. Проверяем аутентификацию
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // 3. Проверяем доступ к базе данных
    const { data: dbData, error: dbError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);

    // 4. Проверяем доступность Edge Functions
    const { data: functionsData, error: functionsError } = await supabase.functions
      .invoke('list-functions', {
        method: 'GET'
      })
      .catch(() => ({ data: null, error: { message: 'Edge Functions не настроены или недоступны' } }));

    // Собираем результаты проверок
    const checks = {
      client: true,
      auth: !sessionError,
      db: !dbError,
      functions: !functionsError,
      tables: dbData ? dbData.map(table => table.table_name) : [],
      session: sessionData?.session ? 'Активна' : 'Не активна',
      functionsAvailable: functionsData?.functions?.length || 0
    };

    // Определяем общий статус
    const allSuccessful = checks.client && checks.auth && checks.db;

    return {
      success: allSuccessful,
      message: allSuccessful ? 'Подключение к Supabase работает корректно' : 'Проблемы с подключением к Supabase',
      details: checks
    };
  } catch (error) {
    console.error('Ошибка при проверке подключения к Supabase:', error);
    return {
      success: false,
      message: 'Произошла ошибка при проверке подключения',
      details: {
        error: error.message
      }
    };
  }
}; 