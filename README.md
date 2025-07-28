# 🛍️ JANA - Премиум Маркетплейс

**JANA Marketplace** - это современный премиум маркетплейс для уникальных товаров со всего мира, построенный на React, TypeScript и Supabase.

![JANA Marketplace](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop&auto=format)

## ✨ Особенности

- 🎨 **Современный UI/UX** с использованием shadcn/ui и Tailwind CSS
- 🔐 **Аутентификация** через Supabase Auth
- 💳 **Интеграция с Stripe** для обработки платежей
- 🛒 **Корзина покупок** с синхронизацией в базе данных
- ❤️ **Список желаний** с синхронизацией в базе данных
- 📱 **Адаптивный дизайн** для всех устройств
- 🚀 **Быстрая загрузка** благодаря Vite
- 📧 **Контактная форма** с уведомлениями администраторов
- 👨‍💼 **Панель администратора** для управления контентом

## 🛠️ Технологический стек

- **Frontend**: React 18, TypeScript, Vite
- **Стилизация**: Tailwind CSS, shadcn/ui
- **База данных**: Supabase (PostgreSQL)
- **Аутентификация**: Supabase Auth
- **Платежи**: Stripe Checkout
- **Деплой**: Lovable Platform

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ и npm
- Аккаунт Supabase
- Аккаунт Stripe (для платежей)

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/ZhaslanToishybayev/bazaar-grove.git
   cd bazaar-grove
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   
   Создайте файл `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Запустите проект**
   ```bash
   npm run dev
   ```

Откройте [http://localhost:8080](http://localhost:8080) в браузере.

## 📋 Настройка базы данных

### 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и анонимный ключ

### 2. Выполнение миграций

Выполните SQL-скрипты из `src/integrations/supabase/migrations/` в следующем порядке:

1. `01_create_wishlist_table.sql` - таблица избранного
2. `03_create_admins_table.sql` - таблица администраторов
3. `02_create_messages_table.sql` - таблица сообщений

### 3. Добавление первого администратора

```sql
-- Найдите ID вашего пользователя
SELECT id FROM auth.users WHERE email = 'ваш_email@example.com';

-- Добавьте как администратора
INSERT INTO admins (user_id) VALUES ('полученный_id_пользователя');
```

## 💳 Настройка Stripe

### 1. Получение API ключей

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. Получите тестовые ключи в разделе Developers → API keys

### 2. Настройка Edge Function

1. В Supabase Dashboard перейдите в Functions
2. Создайте функцию `create-checkout-session`
3. Скопируйте код из `supabase/functions/create-checkout-session/`
4. Добавьте переменные окружения:
   ```
   STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ
   STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_секрет
   ```

### 3. Настройка Webhook

1. В Stripe Dashboard → Webhooks создайте endpoint:
   ```
   https://ваш-проект.functions.supabase.co/create-checkout-session/webhook
   ```
2. Выберите событие `checkout.session.completed`
3. Скопируйте Signing Secret в переменные Supabase

Подробная инструкция: `src/integrations/stripe/README.md`

## 📁 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # shadcn/ui компоненты
│   └── ...
├── pages/              # Страницы приложения
├── lib/                # Утилиты и провайдеры
│   ├── auth/           # Аутентификация
│   ├── cart/           # Корзина покупок
│   └── wishlist/       # Список желаний
├── integrations/       # Внешние интеграции
│   ├── supabase/       # Настройки Supabase
│   └── stripe/         # Интеграция Stripe
└── hooks/              # Пользовательские хуки
```

## 🎯 Основные страницы

- `/` - Главная страница с каруселью товаров
- `/products` - Каталог товаров с фильтрацией
- `/products/:id` - Детальная страница товара
- `/categories` - Категории товаров
- `/about` - О компании
- `/contacts` - Контактная форма
- `/auth` - Аутентификация
- `/profile` - Профиль пользователя
- `/checkout` - Оформление заказа
- `/checkout/success` - Страница успешного заказа
- `/admin` - Панель администратора

## 🔧 Доступные команды

```bash
npm run dev          # Запуск в режиме разработки (порт 8080)
npm run build        # Сборка для продакшена
npm run build:dev    # Сборка в режиме разработки
npm run preview      # Предварительный просмотр сборки
npm run lint         # Проверка кода ESLint
```

## 🚀 Деплой

### Через Netlify/Vercel

1. Подключите репозиторий к платформе
2. Настройте переменные окружения
3. Команда сборки: `npm run build`
4. Папка публикации: `dist`

## 🧪 Тестирование

### Тестовые карты Stripe

- `4242 4242 4242 4242` - Успешный платеж
- `4000 0000 0000 0002` - Отклоненный платеж

### Проверка функциональности

1. Регистрация/авторизация пользователей
2. Добавление товаров в корзину и избранное
3. Оформление заказа через Stripe
4. Отправка сообщений через контактную форму
5. Управление контентом через админ-панель

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте документацию в папках `src/integrations/`
2. Создайте Issue в репозитории
3. Свяжитесь с разработчиком: [@ZhaslanToishybayev](https://github.com/ZhaslanToishybayev)

---

**Создано с ❤️ разработчиком [Zhaslan Toishybayev](https://github.com/ZhaslanToishybayev)**



