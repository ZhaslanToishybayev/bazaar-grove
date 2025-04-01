# Функция обработки платежей Stripe

Эта Edge Function предназначена для интеграции с Stripe Checkout для обработки платежей.

## Развертывание функции

### Требования
- Установленный Supabase CLI
- Docker (для локального тестирования)
- Аккаунт Stripe с API ключами

### Шаги по установке

1. **Установите необходимые переменные окружения в вашем Supabase проекте**

   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

2. **Разверните функцию в Supabase**

   ```bash
   supabase functions deploy create-checkout-session
   ```

3. **Настройте webhook в Stripe Dashboard**

   - Зайдите в [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Создайте новый webhook endpoint
   - URL: `https://[YOUR_PROJECT_REF].supabase.co/functions/v1/create-checkout-session/webhook`
   - События: `checkout.session.completed`
   - Получите webhook secret и сохраните его в переменных окружения Supabase

## Тестирование локально

1. Запустите функцию локально:

   ```bash
   supabase start
   supabase functions serve create-checkout-session --env-file .env.local
   ```

2. Используйте Stripe CLI для пересылки событий локально:

   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/create-checkout-session/webhook
   ```

## Эндпоинты

### 1. Создание сессии оплаты

**POST** `/create-checkout-session`

**Тело запроса:**
```json
{
  "line_items": [
    {
      "price_data": {
        "currency": "rub",
        "product_data": {
          "name": "Название товара",
          "images": ["https://example.com/image.jpg"]
        },
        "unit_amount": 1000 
      },
      "quantity": 1
    }
  ],
  "customer_email": "customer@example.com",
  "metadata": {
    "user_id": "user123",
    "cart_items": "[{\"id\":\"product1\",\"name\":\"Product 1\",\"price\":10.00,\"quantity\":1}]",
    "shipping_address": "ул. Пушкина 10",
    "shipping_city": "Москва",
    "shipping_postal_code": "123456",
    "shipping_country": "Россия",
    "phone": "+7 999 123 45 67"
  }
}
```

**Ответ:**
```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/..." 
}
```

### 2. Проверка статуса сессии

**POST** `/create-checkout-session/check-status`

**Тело запроса:**
```json
{
  "session_id": "cs_test_..." 
}
```

**Ответ:**
```json
{
  "status": "complete", 
  "payment_status": "paid",
  "order_id": "order_id_from_database" 
}
```

### 3. Проверка конфигурации

**GET** `/create-checkout-session/config`

**Ответ:**
```json
{
  "configured": true,
  "hasStripeKey": true,
  "hasWebhookSecret": true,
  "message": "Stripe configuration check" 
}
```

### 4. Webhook для обработки событий Stripe

**POST** `/create-checkout-session/webhook`

Этот эндпоинт предназначен для получения уведомлений от Stripe о событиях, таких как успешное завершение платежа. После получения события `checkout.session.completed` функция создает запись заказа в базе данных Supabase.

## Структура базы данных

Для корректной работы webhook необходимы следующие таблицы:

1. **orders**
   ```sql
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL,
     status TEXT NOT NULL,
     payment_status TEXT,
     total_amount DECIMAL NOT NULL,
     tracking_number TEXT,
     shipping_address TEXT,
     shipping_city TEXT,
     shipping_postal_code TEXT,
     shipping_country TEXT,
     phone TEXT,
     email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **order_items**
   ```sql
   CREATE TABLE order_items (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     product_id UUID NOT NULL,
     product_name TEXT NOT NULL,
     product_price DECIMAL NOT NULL,
     quantity INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## Примечания по безопасности

- Не используйте боевые ключи Stripe в режиме разработки
- Всегда проверяйте webhook signature для предотвращения подделки запросов
- Храните секретные ключи только в переменных окружения, никогда не коммитьте их в репозиторий 