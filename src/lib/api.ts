import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Отправляет сообщение из контактной формы и сохраняет его в базе данных
 */
export const sendContactMessage = async (data: ContactMessage): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Отправка сообщения:', data);
    
    // Проверяем, доступна ли таблица messages
    const { error: tableCheckError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Ошибка при проверке таблицы messages:', tableCheckError);
      if (tableCheckError.message.includes('does not exist')) {
        return { 
          success: false, 
          error: 'Таблица сообщений не создана. Пожалуйста, выполните миграции базы данных.' 
        };
      }
    }
    
    // Отправляем сообщение
    const { error } = await supabase
      .from('messages')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'new'
      });

    if (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      if (error.message.includes('admins')) {
        return { 
          success: false, 
          error: 'Ошибка с таблицей администраторов. Пожалуйста, убедитесь, что таблица admins создана и настроена корректно.' 
        };
      }
      
      return { 
        success: false, 
        error: `Не удалось отправить сообщение: ${error.message}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Произошла неизвестная ошибка при отправке сообщения' 
    };
  }
}; 