
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Container from '@/components/ui/Container';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const { user, isLoading } = useAuth();

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
                <CardTitle>Вход / Регистрация</CardTitle>
                <CardDescription>
                  Войдите в свою учетную запись или создайте новую для доступа к вашим заказам и профилю
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-xs text-muted-foreground text-center">
                  Нажимая «Продолжить», вы соглашаетесь с нашими условиями обслуживания и политикой конфиденциальности.
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
