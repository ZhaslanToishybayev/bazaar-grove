# Настройка Stripe для проекта Bazaar Grove

## Обзор

Данная интеграция позволяет принимать платежи с помощью Stripe Checkout. Она состоит из нескольких компонентов:

1. **Клиентская часть** - API для создания платежных сессий и проверки их статуса
2. **Серверная часть** - Edge Functions в Supabase для взаимодействия со Stripe API
3. **Webhook** - Автоматическое создание заказов при успешной оплате

## Необходимые шаги для настройки

### 1. Создание аккаунта Stripe

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. После регистрации вы получите тестовые API ключи
3. Перейдите в раздел Developers -> API keys

### 2. Получение API ключей

Вам понадобятся два ключа:
- **Publishable key** - публичный ключ для клиентской части
- **Secret key** - секретный ключ для серверной части

### 3. Настройка Edge Function в Supabase

1. Перейдите в [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в раздел **Functions**
4. Нажмите **Create New Function**
5. Назовите функцию `create-checkout-session`
6. Скопируйте код из директории `supabase/functions/create-checkout-session` в редактор
7. Нажмите **Deploy Function**

### 4. Добавление переменных окружения

В разделе **Functions** -> **Environment variables** добавьте:

```
STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ
STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_секрет
```

### 5. Настройка Webhook в Stripe

1. В панели Stripe перейдите в раздел **Developers** -> **Webhooks**
2. Нажмите **Add Endpoint**
3. В поле URL укажите: `https://<ваш-проект>.functions.supabase.co/create-checkout-session/webhook`
4. В разделе **Events to send** выберите `checkout.session.completed`
5. После создания webhook, Stripe покажет **Signing Secret** - это и есть `STRIPE_WEBHOOK_SECRET`

### 6. Настройка клиентской части

1. Установите ваш публичный ключ Stripe в файле `src/integrations/stripe/client.ts`
2. Убедитесь, что клиентский код использует правильные URL для Edge Functions

## Тестирование

### Тестовые карты

Для тестирования можно использовать следующие карты:
- `4242 4242 4242 4242` - Успешный платеж
- `4000 0000 0000 0002` - Отклоненный платеж (недостаточно средств)

### Проверка функций

1. На странице корзины нажмите "Оформить заказ"
2. Должна открыться форма Stripe Checkout
3. После успешной оплаты тестовой картой, вы будете перенаправлены на страницу успешного оформления
4. В базе данных должен быть создан новый заказ

## Устранение неполадок

### Ошибки клиентской части

1. **Не удается создать сессию** - Проверьте консоль разработчика и убедитесь, что Edge Function правильно настроена и доступна
2. **Ошибка 401 Unauthorized** - Проверьте, что пользователь авторизован или используйте анонимный режим

### Ошибки серверной части

1. **Ошибка при создании заказа** - Проверьте логи Edge Function и убедитесь, что база данных содержит необходимые таблицы
2. **Webhook не срабатывает** - Проверьте настройки webhook в Stripe Dashboard и логи Edge Function

## Схема базы данных

Для работы с заказами необходимы таблицы:

1. `orders` - Основная информация о заказе
2. `order_items` - Товары в заказе

SQL для создания этих таблиц находится в директории `src/integrations/supabase/migrations`

## Переход в боевой режим

После тестирования и проверки функциональности:

1. Переключите Stripe из тестового режима в боевой
2. Обновите API ключи в настройках Edge Function
3. Обновите webhook URL для использования боевого ключа
4. Обновите публичный ключ в клиентском коде