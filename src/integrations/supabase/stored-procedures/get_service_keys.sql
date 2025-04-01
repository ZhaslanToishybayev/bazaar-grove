-- Создаем хранимую процедуру для безопасного получения ключей API
-- ВНИМАНИЕ: Эта процедура будет работать только при условии, что пользователь
-- имеет высокий уровень доступа (администратор)
create or replace function get_service_keys()
returns json
language plpgsql
security definer -- выполняется с правами создателя функции
as $$
declare
  result json;
begin
  -- Проверяем, что пользователь аутентифицирован
  if auth.uid() is null then
    return json_build_object(
      'error', 'Требуется аутентификация',
      'status', 'error'
    );
  end if;
  
  -- Проверяем, что пользователь является администратором
  -- (предполагается, что есть таблица admins с user_id)
  if not exists (select 1 from admins where user_id = auth.uid()) then
    return json_build_object(
      'error', 'Доступ запрещен: требуются права администратора',
      'status', 'error'
    );
  end if;

  -- Возвращаем "замаскированные" ключи для безопасности
  -- Реальные ключи никогда не должны возвращаться через API
  result := json_build_object(
    'anon_key', 'eyXXXX...XXXX',  -- заменить на реальный, но замаскированный формат
    'service_key', 'eyXXXX...XXXX',  -- заменить на реальный, но замаскированный формат
    'status', 'success'
  );
  
  return result;
end;
$$; 