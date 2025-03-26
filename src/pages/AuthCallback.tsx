
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Обработка URL после перенаправления от OAuth провайдера
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error.message);
          toast({
            title: 'Ошибка аутентификации',
            description: error.message,
            variant: 'destructive',
          });
          navigate('/auth', { replace: true });
          return;
        }
        
        console.log('OAuth callback processed successfully');
        toast({
          title: 'Успешная аутентификация',
          description: 'Вы успешно вошли в систему',
        });
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('Error during OAuth callback:', error);
        toast({
          title: 'Ошибка аутентификации',
          description: error.message || 'Произошла неизвестная ошибка',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Завершение аутентификации...</h2>
        <p className="text-muted-foreground">Пожалуйста, подождите, пока мы завершаем процесс входа в систему.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
