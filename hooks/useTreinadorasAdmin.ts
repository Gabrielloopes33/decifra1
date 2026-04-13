/**
 * Hook para listar e gerenciar treinadoras (visão administrativa)
 * 
 * Utiliza TanStack Query para caching e gerenciamento de estado
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { TreinadoraAdmin } from '@/types/admin';
import { useEffect, useState } from 'react';

const TREINADORAS_ADMIN_QUERY_KEY = ['admin', 'treinadoras'] as const;

interface UseTreinadorasAdminOptions {
  enabled?: boolean;
}

/**
 * Busca todas as treinadoras com estatísticas
 */
async function fetchTreinadorasAdmin(): Promise<TreinadoraAdmin[]> {
  console.log('[useTreinadorasAdmin] Iniciando busca de treinadoras...');

  // Verifica se há sessão ativa antes de fazer a query
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[useTreinadorasAdmin] Erro ao obter sessão:', sessionError);
    throw new Error(`Erro de autenticação: ${sessionError.message}`);
  }

  if (!session) {
    console.error('[useTreinadorasAdmin] Sem sessão ativa - RLS pode bloquear o acesso');
    throw new Error('Sessão não encontrada. Faça login novamente.');
  }

  console.log('[useTreinadorasAdmin] Sessão encontrada:', {
    user: session.user.email,
    expiresAt: session.expires_at,
  });

  // Tenta buscar treinadoras excluindo admins (query principal)
  let { data: treinadoras, error: treinadorasError } = await supabase
    .from('treinadoras')
    .select('id, nome, email, created_at, is_admin')
    .eq('is_admin', false)
    .order('created_at', { ascending: false });

  // Se retornou vazio ou erro, tenta sem o filtro como fallback
  if ((!treinadoras || treinadoras.length === 0) && !treinadorasError) {
    console.log('[useTreinadorasAdmin] Query com filtro retornou vazio, tentando fallback sem filtro...');
    
    const fallbackResult = await supabase
      .from('treinadoras')
      .select('id, nome, email, created_at, is_admin')
      .order('created_at', { ascending: false });
    
    if (fallbackResult.error) {
      console.error('[useTreinadorasAdmin] Erro no fallback:', fallbackResult.error);
      treinadorasError = fallbackResult.error;
    } else if (fallbackResult.data && fallbackResult.data.length > 0) {
      console.log(`[useTreinadorasAdmin] Fallback retornou ${fallbackResult.data.length} registros, filtrando localmente...`);
      // Filtra localmente para excluir admins
      treinadoras = fallbackResult.data.filter(t => !t.is_admin);
      console.log(`[useTreinadorasAdmin] Após filtro local: ${treinadoras.length} treinadoras`);
    } else {
      console.warn('[useTreinadorasAdmin] Fallback também retornou vazio');
      treinadoras = [];
    }
  } else if (treinadoras && treinadoras.length > 0) {
    console.log(`[useTreinadorasAdmin] Query com filtro retornou ${treinadoras.length} treinadoras`);
  }

  if (treinadorasError) {
    console.error('[useTreinadorasAdmin] Erro ao buscar treinadoras:', {
      message: treinadorasError.message,
      code: treinadorasError.code,
      details: treinadorasError.details,
      hint: treinadorasError.hint,
    });
    
    // Verifica se o erro é relacionado a permissões/RLS
    if (treinadorasError.code === '42501' || treinadorasError.message?.includes('permission denied')) {
      throw new Error('Permissão negada. Verifique as políticas RLS da tabela treinadoras.');
    }
    
    throw new Error(`Erro ao buscar treinadoras: ${treinadorasError.message}`);
  }

  if (!treinadoras || treinadoras.length === 0) {
    console.warn('[useTreinadorasAdmin] Nenhuma treinadora retornada do Supabase (verifique RLS ou se is_admin está false)');
    return [];
  }

  console.log(`[useTreinadorasAdmin] ${treinadoras.length} treinadoras carregadas`);

  // Busca TODOS os códigos e clientes de uma vez (mais eficiente)
  console.log('[useTreinadorasAdmin] Buscando estatísticas...');
  
  // Busca todos os códigos
  const { data: todosCodigos, error: codigosError } = await supabase
    .from('codigos')
    .select('treinadora_id');
  
  if (codigosError) {
    console.error('[useTreinadorasAdmin] Erro ao buscar códigos:', codigosError);
  }
  console.log(`[useTreinadorasAdmin] Total de códigos no sistema: ${todosCodigos?.length || 0}`);

  // Busca todos os clientes
  const { data: todosClientes, error: clientesError } = await supabase
    .from('clientes')
    .select('treinadora_id');
  
  if (clientesError) {
    console.error('[useTreinadorasAdmin] Erro ao buscar clientes:', clientesError);
  }
  console.log(`[useTreinadorasAdmin] Total de clientes no sistema: ${todosClientes?.length || 0}`);

  // Mapeia as estatísticas
  const treinadorasComStats = treinadoras.map((treinadora) => {
    const totalCodigos = todosCodigos?.filter(c => c.treinadora_id === treinadora.id).length || 0;
    const totalClientes = todosClientes?.filter(c => c.treinadora_id === treinadora.id).length || 0;
    
    console.log(`[useTreinadorasAdmin] ${treinadora.nome}: ${totalCodigos} códigos, ${totalClientes} clientes`);
    
    return {
      ...treinadora,
      totalCodigos,
      totalClientes,
    } as TreinadoraAdmin;
  });

  console.log('[useTreinadorasAdmin] Estatísticas carregadas:', treinadorasComStats.map(t => `${t.nome}: ${t.totalCodigos} cod, ${t.totalClientes} cli`).join(' | '));
  return treinadorasComStats;
}

/**
 * Hook para listar treinadoras (visão admin)
 */
export function useTreinadorasAdmin(options: UseTreinadorasAdminOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Verifica sessão ao montar o componente
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setHasSession(!!session);
        console.log('[useTreinadorasAdmin] Status da sessão:', !!session);
      }
    }

    checkSession();

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useTreinadorasAdmin] Auth state changed:', event);
      setHasSession(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const query = useQuery<TreinadoraAdmin[], Error>({
    queryKey: TREINADORAS_ADMIN_QUERY_KEY,
    queryFn: fetchTreinadorasAdmin,
    enabled: enabled && hasSession !== false, // Só executa se não sabemos que não há sessão
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: (failureCount, error) => {
      // Não retry em erros de autenticação
      if (error.message?.includes('Sessão não encontrada')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Log de erro do hook
  if (query.error) {
    console.error('[useTreinadorasAdmin] Erro no hook:', query.error);
  }

  // Log de sucesso
  if (query.data) {
    console.log('[useTreinadorasAdmin] Dados carregados:', query.data.length, 'treinadoras');
  }

  /**
   * Invalida o cache e força refetch
   */
  const refresh = () => {
    console.log('[useTreinadorasAdmin] Invalidando cache...');
    queryClient.invalidateQueries({ queryKey: TREINADORAS_ADMIN_QUERY_KEY });
  };

  return {
    ...query,
    treinadoras: query.data || [],
    refresh,
    hasSession,
    isAuthenticated: hasSession === true,
  };
}

export { TREINADORAS_ADMIN_QUERY_KEY };
export default useTreinadorasAdmin;
