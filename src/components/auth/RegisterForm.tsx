
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

// Schema for registration form
const registerSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  passwordConfirm: z.string().min(6, 'Подтверждение пароля должно содержать минимум 6 символов'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
}

const RegisterForm = ({ submitting, setSubmitting }: RegisterFormProps) => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Registration form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  // Handle registration form submission
  const onSubmit = async (values: RegisterFormValues) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Register attempt with:', values.email);
      
      if (!values.email || !values.password) {
        console.error('Missing email or password');
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return;
      }
      
      if (values.password !== values.passwordConfirm) {
        console.error('Passwords do not match');
        toast({
          title: 'Ошибка',
          description: 'Пароли не совпадают',
          variant: 'destructive',
        });
        return;
      }
      
      const { success, error } = await signUp(values.email, values.password);
      
      console.log('Registration result:', success, error);
      
      if (success) {
        // Email confirmation is disabled, so try to sign in automatically
        console.log('Registration successful, trying to sign in');
        const signInResult = await signIn(values.email, values.password);
        
        if (signInResult.success) {
          console.log('Auto sign-in successful after registration');
          navigate('/', { replace: true });
        } else {
          console.log('Auto sign-in failed');
          toast({
            title: 'Регистрация успешна',
            description: 'Теперь вы можете войти в систему',
          });
          form.reset();
        }
      }
    } catch (error: any) {
      console.error('Registration error in component:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла неизвестная ошибка при регистрации',
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
                    autoComplete="new-password"
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
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Подтвердите пароль</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    className="pl-10" 
                    {...field} 
                    autoComplete="new-password"
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
          ) : 'Зарегистрироваться'}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
