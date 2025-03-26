
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with:', email);
      
      if (!email || !password) {
        toast({
          title: 'Ошибка при входе',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return { error: new Error('Пожалуйста, заполните все поля') as AuthError, success: false };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        let errorMessage = 'Произошла ошибка при входе';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Неверный email или пароль';
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
        description: error.message,
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
        toast({
          title: 'Ошибка при регистрации',
          description: 'Пожалуйста, заполните все поля',
          variant: 'destructive',
        });
        return { error: new Error('Пожалуйста, заполните все поля') as AuthError, success: false };
      }
      
      // No email confirmation needed since it's disabled in Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Sign up error:', error.message);
        toast({
          title: 'Ошибка при регистрации',
          description: error.message,
          variant: 'destructive',
        });
        return { error, success: false };
      }
      
      console.log('Sign up response:', data);
      
      // Since confirmation is disabled, the user should be signed in immediately
      if (data.user) {
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
      console.error('Error during sign up:', error.message);
      toast({
        title: 'Ошибка при регистрации',
        description: error.message,
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
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
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
