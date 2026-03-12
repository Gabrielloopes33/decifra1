/**
 * Hook para autenticação de administrador
 * 
 * Verifica se o usuário está logado e se possui privilégios de admin (is_admin = true)
 */

import { useEffect, useState, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { AdminUser } from '@/types/admin';

interface UseAdminAuthReturn {
  user: AdminUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError | Error | null }>;
  logout: () => Promise<{ success: boolean; error?: AuthError | Error | null }>;
  refreshAdminStatus: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Busca os dados do admin no banco de dados
   */
  const fetchAdminData = useCallback(async (userId: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await supabase
        .from('treinadoras')
        .select('id, email, nome, is_admin, created_at')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do admin:', error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('Erro ao buscar dados do admin:', error);
      return null;
    }
  }, []);

  /**
   * Verifica o status de administrador do usuário
   */
  const checkAdminStatus = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const adminData = await fetchAdminData(currentSession.user.id);
    
    if (adminData && adminData.is_admin) {
      setUser(adminData);
      setIsAdmin(true);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    
    setIsLoading(false);
  }, [fetchAdminData]);

  useEffect(() => {
    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      checkAdminStatus(initialSession);
    });

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      checkAdminStatus(newSession);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  /**
   * Realiza login de administrador
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError | Error | null }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error };
      }

      // Verifica se é admin após login
      if (data.user) {
        const adminData = await fetchAdminData(data.user.id);
        
        if (!adminData || !adminData.is_admin) {
          // Faz logout se não for admin
          await supabase.auth.signOut();
          setIsLoading(false);
          return { 
            success: false, 
            error: new Error('Acesso negado. Este usuário não possui privilégios de administrador.') 
          };
        }
        
        setSession(data.session);
        setUser(adminData);
        setIsAdmin(true);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error as Error };
    }
  };

  /**
   * Realiza logout
   */
  const logout = async (): Promise<{ success: boolean; error?: AuthError | Error | null }> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setIsLoading(false);
        return { success: false, error };
      }

      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error as Error };
    }
  };

  /**
   * Atualiza o status de admin manualmente
   */
  const refreshAdminStatus = async () => {
    setIsLoading(true);
    await checkAdminStatus(session);
  };

  return {
    user,
    session,
    isLoading,
    isAdmin,
    isAuthenticated: !!session && isAdmin,
    login,
    logout,
    refreshAdminStatus,
  };
}

export default useAdminAuth;
