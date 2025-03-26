
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback at: ', window.location.href);
        
        // Get URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get('error_description');
        
        if (errorDescription) {
          console.error('OAuth error from URL hash:', errorDescription);
          setError(errorDescription);
          toast({
            title: 'Ошибка аутентификации',
            description: errorDescription,
            variant: 'destructive',
          });
          return;
        }
        
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error.message);
          setError(error.message);
          toast({
            title: 'Ошибка аутентификации',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        
        if (!data.session) {
          console.error('No session found after OAuth callback');
          setError('Не удалось получить сессию пользователя');
          toast({
            title: 'Ошибка аутентификации',
            description: 'Не удалось получить сессию пользователя',
            variant: 'destructive',
          });
          return;
        }
        
        console.log('OAuth callback processed successfully:', data.session);
        toast({
          title: 'Успешная аутентификация',
          description: 'Вы успешно вошли в систему',
        });
        
        // Redirect to home page
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('Error during OAuth callback:', error);
        setError(error.message || 'Произошла неизвестная ошибка');
        toast({
          title: 'Ошибка аутентификации',
          description: error.message || 'Произошла неизвестная ошибка',
          variant: 'destructive',
        });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg">
        {error ? (
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Ошибка аутентификации</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/auth', { replace: true })}
                variant="default"
              >
                Вернуться на страницу входа
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Попробовать снова
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Завершение аутентификации...</h2>
            <p className="text-muted-foreground">Пожалуйста, подождите, пока мы завершаем процесс входа в систему.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
