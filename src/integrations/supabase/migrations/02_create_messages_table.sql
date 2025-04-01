-- Проверяем, существует ли таблица администраторов
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    RAISE EXCEPTION 'Таблица admins не существует. Сначала выполните миграцию 03_create_admins_table.sql';
  END IF;
END
$$;

-- Создание таблицы для сообщений контактной формы
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Создаем политику для доступа к сообщениям только администраторам
CREATE POLICY "Сообщения доступны только администраторам" ON messages
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM admins
  ));

-- Разрешаем всем пользователям вставлять записи в таблицу сообщений
CREATE POLICY "Любой пользователь может отправить сообщение" ON messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Создаем индекс для ускорения поиска
CREATE INDEX messages_email_idx ON messages (email);
CREATE INDEX messages_created_at_idx ON messages (created_at);
CREATE INDEX messages_status_idx ON messages (status); 