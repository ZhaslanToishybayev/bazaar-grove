-- Создание таблицы администраторов
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание уникального индекса для предотвращения дублирования администраторов
CREATE UNIQUE INDEX IF NOT EXISTS admins_user_id_idx ON admins (user_id);

-- Включаем Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Политика для чтения таблицы администраторов
CREATE POLICY "Только администраторы могут видеть таблицу администраторов" ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM admins
  ));

-- Политика для добавления/изменения/удаления администраторов
CREATE POLICY "Только администраторы могут изменять таблицу администраторов" ON admins
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM admins
  ));

-- Комментарий: Перед использованием политик безопасности, вам необходимо добавить
-- первого администратора напрямую через SQL или через интерфейс Supabase.
-- Например:
-- INSERT INTO admins (user_id) VALUES ('YOUR_USER_ID_HERE'); 