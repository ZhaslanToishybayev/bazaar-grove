
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
import { Separator } from '@/components/ui/separator';

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
  const { user, isLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User authenticated, redirecting to home page", user);
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

  // Handle Google login
  const handleGoogleLogin = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
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

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
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
          console.log('Auto sign-in failed, switching to login form');
          toast({
            title: 'Регистрация успешна',
            description: 'Теперь вы можете войти в систему',
          });
          setIsLogin(true);
          registerForm.reset();
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

  // If the user is already logged in, redirect to the home page
  if (user && !isLoading) {
    console.log('User is already logged in, redirecting to home');
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
                <div className="mb-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={submitting || isLoading}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                        </g>
                      </svg>
                    )}
                    Продолжить с Google
                  </Button>
                </div>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Или с помощью Email
                    </span>
                  </div>
                </div>

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
                                  disabled={submitting || isLoading}
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
                                  disabled={submitting || isLoading}
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
                                  disabled={submitting || isLoading}
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
                                  disabled={submitting || isLoading}
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
                                  disabled={submitting || isLoading}
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
                        disabled={submitting || isLoading}
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
                        disabled={submitting || isLoading}
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
