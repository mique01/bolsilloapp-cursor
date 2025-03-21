import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SupabaseAuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        if (!supabase || !supabase.auth) {
          console.error("Supabase client not initialized properly");
          setError(new Error("Error al inicializar el cliente de Supabase"));
          return;
        }
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        console.log("Sesión obtenida con éxito:", data.session ? "Autenticado" : "No autenticado");
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth subscription
    let authListener: any = null;
    try {
      if (supabase && supabase.auth) {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (event: string, session: Session | null) => {
            console.log("Auth state changed:", event);
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
          }
        );
        authListener = listener;
      }
    } catch (error) {
      console.error("Error setting up auth listener:", error);
    }

    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase || !supabase.auth) {
        throw new Error("Cliente de Supabase no inicializado correctamente");
      }
      
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      console.log("Usuario registrado con éxito");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase || !supabase.auth) {
        throw new Error("Cliente de Supabase no inicializado correctamente");
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      console.log("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase || !supabase.auth) {
        throw new Error("Cliente de Supabase no inicializado correctamente");
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase || !supabase.auth) {
        throw new Error("Cliente de Supabase no inicializado correctamente");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      console.log("Correo de restablecimiento enviado");
    } catch (error) {
      console.error("Error al solicitar restablecimiento de contraseña:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
} 