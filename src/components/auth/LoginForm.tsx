
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Schema for login form
const loginSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
}

const LoginForm = ({ submitting, setSubmitting }: LoginFormProps) => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle login form submission
  const onSubmit = async (values: LoginFormValues) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Login attempt with:', values.email);
      
      if (!values.email || !values.password) {
        console.error('Missing email or password');
        toast({
          title: 'Ошибка при входе',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return;
      }
      
      const { success, error } = await signIn(values.email, values.password);
      
      console.log('Login result:', success, error);
      
      if (success) {
        console.log('Login successful, redirecting to home page');
        navigate('/', { replace: true });
      } else if (error) {
        console.error('Login error in component:', error.message);
      }
    } catch (error: any) {
      console.error('Login error in component:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла неизвестная ошибка при входе',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="email@example.com" 
                    className="pl-10" 
                    {...field} 
                    autoComplete="email"
                    disabled={submitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    className="pl-10" 
                    {...field} 
                    autoComplete="current-password"
                    disabled={submitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : 'Войти'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
