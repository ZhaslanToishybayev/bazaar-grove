-- Создаем таблицу wishlist, если она не существует
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Включаем Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON wishlist;
CREATE POLICY "Users can view their own wishlist items" 
ON wishlist FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON wishlist;
CREATE POLICY "Users can insert their own wishlist items" 
ON wishlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON wishlist;
CREATE POLICY "Users can delete their own wishlist items" 
ON wishlist FOR DELETE 
USING (auth.uid() = user_id);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS wishlist_product_id_idx ON wishlist(product_id); 