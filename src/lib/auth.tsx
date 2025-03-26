
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError, Provider } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | null; success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change:', event, currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );
    
    // Then check current session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error.message);
          return;
        }
        console.log('Initial session check:', data.session);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with:', email);
      
      if (!email || !password) {
        console.error('Missing email or password');
        toast({
          title: 'Ошибка при входе',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return { error: new Error('Пожалуйста, заполните все поля') as AuthError, success: false };
      }
      
      console.log('Making sign in request to Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      console.log('Sign in response:', data, error);
      
      if (error) {
        console.error('Sign in error:', error.message);
        let errorMessage = 'Произошла ошибка при входе';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Неверный email или пароль';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email не подтвержден';
        }
        
        toast({
          title: 'Ошибка при входе',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return { error, success: false };
      }
      
      console.log('Sign in successful:', data);
      toast({
        title: 'Успешный вход',
        description: 'Вы вошли в свою учетную запись',
      });
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Error during sign in:', error.message);
      toast({
        title: 'Ошибка при входе',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
      return { error: error as AuthError, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign up with:', email);
      
      if (!email || !password) {
        console.error('Missing email or password');
        toast({
          title: 'Ошибка при регистрации',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return { error: new Error('Пожалуйста, заполните все поля') as AuthError, success: false };
      }
      
      console.log('Making sign up request to Supabase...');
      // No email confirmation needed since it's disabled in Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          data: {
            email: email.trim(),
          },
        }
      });
      
      console.log('Sign up response:', data, error);
      
      if (error) {
        console.error('Sign up error:', error.message);
        let errorMessage = error.message;
        
        if (error.message.includes('already registered')) {
          errorMessage = 'Этот email уже зарегистрирован';
        }
        
        toast({
          title: 'Ошибка при регистрации',
          description: errorMessage,
          variant: 'destructive',
        });
        return { error, success: false };
      }
      
      // Since email confirmation is disabled, the user should be signed in immediately
      if (data.user) {
        console.log('User registered successfully:', data.user);
        toast({
          title: 'Регистрация успешна',
          description: 'Вы успешно зарегистрировались',
        });
        return { error: null, success: true };
      } else {
        toast({
          title: 'Регистрация выполнена',
          description: 'Пожалуйста, войдите в систему',
        });
        return { error: null, success: true };
      }
    } catch (error: any) {
      console.error('Error during sign up:', error);
      toast({
        title: 'Ошибка при регистрации',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
      return { error: error as AuthError, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with Google');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      
      if (error) {
        console.error('Google sign in error:', error.message);
        toast({
          title: 'Ошибка входа через Google',
          description: error.message,
          variant: 'destructive',
        });
        return { error, success: false };
      }
      
      return { error: null, success: true };
    } catch (error: any) {
      console.error('Error during Google sign in:', error.message);
      toast({
        title: 'Ошибка входа через Google',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
      return { error: error as AuthError, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error.message);
        throw error;
      }
      
      toast({
        title: 'Вы вышли из системы',
        description: 'Вы успешно вышли из своей учетной записи',
      });
    } catch (error: any) {
      console.error('Error during sign out:', error.message);
      toast({
        title: 'Ошибка при выходе',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
