import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.17.0?target=deno';

// Функция для проверки доступности Stripe API
async function testStripeConnection(secretKey: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Простой запрос для проверки соединения
    const response = await stripe.customers.list({ limit: 1 });
    
    return {
      success: true,
      message: 'Подключение к Stripe API успешно установлено',
      details: {
        hasData: response.data && response.data.length > 0,
        object: response.object,
        requestId: response.requestId
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Ошибка при подключении к Stripe API: ${error.message}`,
      details: {
        type: error.type,
        code: error.code,
        requestId: error.requestId || 'Нет',
        statusCode: error.statusCode || 'Нет'
      }
    };
  }
}

// Функция для проверки webhook секрета
async function testWebhookSignature(webhookSecret: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!webhookSecret) {
    return {
      success: false,
      message: 'Webhook секрет не задан'
    };
  }
  
  // Проверяем формат секрета
  if (!webhookSecret.startsWith('whsec_')) {
    return {
      success: false,
      message: 'Webhook секрет имеет неправильный формат. Должен начинаться с "whsec_"'
    };
  }
  
  return {
    success: true,
    message: 'Webhook секрет имеет правильный формат'
  };
}

// Функция для тестирования подключения к Supabase
async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tablesExist?: {
    orders: boolean;
    order_items: boolean;
  };
}> {
  try {
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!supabaseKey || !supabaseUrl) {
      return {
        success: false,
        message: 'Отсутствуют переменные окружения для Supabase'
      };
    }
    
    const headers = {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': `${supabaseKey}`
    };
    
    // Проверяем таблицу orders
    const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?limit=1`, {
      headers
    });
    
    // Проверяем таблицу order_items
    const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items?limit=1`, {
      headers
    });
    
    return {
      success: ordersResponse.ok && orderItemsResponse.ok,
      message: ordersResponse.ok && orderItemsResponse.ok 
        ? 'Успешное подключение к таблицам Supabase' 
        : 'Проблема с доступом к таблицам Supabase',
      tablesExist: {
        orders: ordersResponse.ok,
        order_items: orderItemsResponse.ok
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Ошибка при подключении к Supabase: ${error.message}`
    };
  }
}

// Функция для проверки наличия переменных окружения
function checkEnvironmentVariables(): {
  complete: boolean;
  missing: string[];
  available: string[];
} {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const available = [];
  const missing = [];
  
  for (const varName of requiredVars) {
    if (Deno.env.get(varName)) {
      available.push(varName);
    } else {
      missing.push(varName);
    }
  }
  
  return {
    complete: missing.length === 0,
    missing,
    available
  };
}

// Симуляция события от Stripe для проверки обработки
function createMockStripeEvent(): {
  type: string;
  object: any;
} {
  return {
    type: 'checkout.session.completed',
    object: {
      id: 'cs_test_mock',
      object: 'checkout.session',
      customer_email: 'test@example.com',
      payment_status: 'paid',
      amount_total: 15000,
      metadata: {
        user_id: 'test-user-id',
        shipping_address: 'Test Street 123',
        shipping_city: 'Test City',
        shipping_postal_code: '12345',
        shipping_country: 'Test Country',
        phone: '+1234567890',
        cart_items: JSON.stringify([
          {
            id: 'test-item-1',
            name: 'Test Product',
            price: 100,
            quantity: 1
          }
        ])
      }
    }
  };
}

// Основной обработчик запросов
serve(async (req) => {
  // Проверим HTTP-метод
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Метод не поддерживается", { status: 405 });
  }
  
  // Проверим URL для различных функций
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();
  
  // Проверка переменных окружения для всех запросов
  const envStatus = checkEnvironmentVariables();
  
  // Базовый диагностический отчет
  const diagnosticReport = {
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      endpoint: endpoint,
      url: url.toString(),
      headers: Object.fromEntries(req.headers)
    },
    environment: envStatus
  };
  
  // Запрос для диагностики всего сразу
  if (endpoint === 'diagnose') {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    
    const [stripeConnectionTest, webhookTest, supabaseTest] = await Promise.all([
      testStripeConnection(stripeKey),
      testWebhookSignature(webhookSecret),
      testSupabaseConnection()
    ]);
    
    const mockEvent = createMockStripeEvent();
    
    const fullReport = {
      ...diagnosticReport,
      tests: {
        stripe: stripeConnectionTest,
        webhook: webhookTest,
        supabase: supabaseTest
      },
      mockEvent: mockEvent,
      nextSteps: {
        hasErrors: !stripeConnectionTest.success || !webhookTest.success || !supabaseTest.success,
        recommendations: []
      }
    };
    
    // Формируем рекомендации на основе результатов тестов
    if (!envStatus.complete) {
      fullReport.nextSteps.recommendations.push(
        `Необходимо установить отсутствующие переменные окружения: ${envStatus.missing.join(', ')}`
      );
    }
    
    if (!stripeConnectionTest.success) {
      fullReport.nextSteps.recommendations.push(
        'Проверьте ключ Stripe API и интернет-соединение с серверами Stripe'
      );
    }
    
    if (!webhookTest.success) {
      fullReport.nextSteps.recommendations.push(
        'Исправьте формат webhook секрета или получите новый в панели Stripe'
      );
    }
    
    if (!supabaseTest.success) {
      if (supabaseTest.tablesExist) {
        if (!supabaseTest.tablesExist.orders) {
          fullReport.nextSteps.recommendations.push(
            'Создайте таблицу "orders" в базе данных Supabase'
          );
        }
        
        if (!supabaseTest.tablesExist.order_items) {
          fullReport.nextSteps.recommendations.push(
            'Создайте таблицу "order_items" в базе данных Supabase'
          );
        }
      } else {
        fullReport.nextSteps.recommendations.push(
          'Проверьте подключение к Supabase и наличие таблиц orders и order_items'
        );
      }
    }
    
    return new Response(JSON.stringify(fullReport, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }
  
  // Проверка Stripe соединения
  if (endpoint === 'test-stripe') {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const stripeTest = await testStripeConnection(stripeKey);
    
    return new Response(JSON.stringify({
      ...diagnosticReport,
      stripe: stripeTest
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: stripeTest.success ? 200 : 500
    });
  }
  
  // Проверка webhook секрета
  if (endpoint === 'test-webhook') {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const webhookTest = await testWebhookSignature(webhookSecret);
    
    return new Response(JSON.stringify({
      ...diagnosticReport,
      webhook: webhookTest
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: webhookTest.success ? 200 : 500
    });
  }
  
  // Проверка Supabase соединения
  if (endpoint === 'test-supabase') {
    const supabaseTest = await testSupabaseConnection();
    
    return new Response(JSON.stringify({
      ...diagnosticReport,
      supabase: supabaseTest
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: supabaseTest.success ? 200 : 500
    });
  }
  
  // Проверка переменных окружения
  if (endpoint === 'test-env') {
    return new Response(JSON.stringify({
      ...diagnosticReport
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: envStatus.complete ? 200 : 500
    });
  }
  
  // Если ничего не совпало, вернем информацию о доступных эндпоинтах
  return new Response(JSON.stringify({
    message: "Диагностический инструмент для тестирования Stripe webhook",
    availableEndpoints: [
      "/diagnose - Полная диагностика всех компонентов",
      "/test-stripe - Проверка подключения к Stripe API",
      "/test-webhook - Проверка webhook секрета",
      "/test-supabase - Проверка подключения к Supabase и наличия таблиц",
      "/test-env - Проверка наличия всех переменных окружения"
    ],
    diagnosticReport
  }, null, 2), {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
}); 