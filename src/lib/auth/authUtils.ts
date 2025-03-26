
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  console.log('Making sign in request to Supabase...');
  return await supabase.auth.signInWithPassword({ 
    email: email.trim(), 
    password 
  });
};

export const signUpWithEmailAndPassword = async (email: string, password: string) => {
  console.log('Making sign up request to Supabase...');
  return await supabase.auth.signUp({ 
    email: email.trim(), 
    password,
    options: {
      data: {
        email: email.trim(),
      },
    }
  });
};

export const signOutUser = async () => {
  console.log('Attempting to sign out');
  return await supabase.auth.signOut();
};

export const signInWithGoogleProvider = async () => {
  console.log('Attempting to sign in with Google');
  
  // Get the current origin and construct the full callback URL
  const origin = window.location.origin;
  const redirectUrl = `${origin}/auth/callback`;
  
  console.log('Using redirect URL:', redirectUrl);
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error in signInWithGoogleProvider:', error);
    return { data: null, error: error as AuthError };
  }
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};
