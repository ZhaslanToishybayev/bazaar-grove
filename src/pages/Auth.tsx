
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, Lock, Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';

// Schema for login form
const loginSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

// Schema for registration form
const registerSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  passwordConfirm: z.string().min(6, 'Подтверждение пароля должно содержать минимум 6 символов'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, isLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Login attempt with:', values.email);
      
      const { success, error } = await signIn(values.email, values.password);
      
      if (success) {
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

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Register attempt with:', values.email);
      
      if (values.password !== values.passwordConfirm) {
        toast({
          title: 'Ошибка',
          description: 'Пароли не совпадают',
          variant: 'destructive',
        });
        return;
      }
      
      const { success } = await signUp(values.email, values.password);
      
      if (success) {
        // Email confirmation is disabled, so redirect to home
        toast({
          title: 'Регистрация успешна',
          description: 'Теперь вы можете войти в систему',
        });
        setIsLogin(true);
        registerForm.reset();
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

  // If the user is already logged in, redirect to the home page
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16">
        <Container>
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{isLogin ? 'Вход' : 'Регистрация'}</CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Войдите в свою учетную запись, чтобы получить доступ к вашим заказам и профилю' 
                    : 'Создайте новую учетную запись для совершения покупок'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
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
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
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
                        disabled={submitting || isLoading}
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
                ) : (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
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
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
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
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
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
                        disabled={submitting || isLoading}
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
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center">
                  {isLogin ? (
                    <>
                      Нет учетной записи?{' '}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => setIsLogin(false)}
                        type="button"
                      >
                        Зарегистрироваться
                      </Button>
                    </>
                  ) : (
                    <>
                      Уже есть учетная запись?{' '}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => setIsLogin(true)}
                        type="button"
                      >
                        Войти
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
