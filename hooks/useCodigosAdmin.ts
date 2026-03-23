/**
 * Hook para listar e gerenciar códigos (visão administrativa)
 * 
 * Utiliza TanStack Query para caching e gerenciamento de estado
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { CodigoAdmin } from '@/types/admin';

const CODIGOS_ADMIN_QUERY_KEY = ['admin', 'codigos'] as const;

interface UseCodigosAdminOptions {
  enabled?: boolean;
  filtroStatus?: 'todos' | 'usados' | 'ativos';
  treinadoraId?: string | null;
}

/**
 * Busca todos os códigos com informações da treinadora e cliente
 */
async function fetchCodigosAdmin(
  filtroStatus: 'todos' | 'usados' | 'ativos' = 'todos',
  treinadoraId: string | null = null
): Promise<CodigoAdmin[]> {
  console.log('[useCodigosAdmin] Iniciando busca de códigos...');

  // Verifica se há sessão ativa antes de fazer a query
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[useCodigosAdmin] Erro ao obter sessão:', sessionError);
    throw new Error(`Erro de autenticação: ${sessionError.message}`);
  }

  if (!session) {
    console.error('[useCodigosAdmin] Sem sessão ativa - RLS pode bloquear o acesso');
    throw new Error('Sessão não encontrada. Faça login novamente.');
  }

  console.log('[useCodigosAdmin] Sessão encontrada:', session.user.email);

  let query = supabase
    .from('codigos')
    .select(`
      id,
      codigo,
      treinadora_id,
      treinadoras(nome),
      usado,
      valido_ate,
      cliente_id,
      created_at
    `)
    .order('created_at', { ascending: false });

  // Filtra por status semântico
  if (filtroStatus === 'usados') {
    query = query.eq('usado', true);
  } else if (filtroStatus === 'ativos') {
    query = query.eq('usado', false).gt('valido_ate', new Date().toISOString());
  }

  // Filtra por treinadora se especificado
  if (treinadoraId) {
    query = query.eq('treinadora_id', treinadoraId);
  }

  const { data: codigos, error: codigosError } = await query;

  if (codigosError) {
    console.error('[useCodigosAdmin] Erro ao buscar códigos:', {
      message: codigosError.message,
      code: codigosError.code,
      details: codigosError.details,
    });
    
    // Verifica se o erro é relacionado a permissões/RLS
    if (codigosError.code === '42501' || codigosError.message?.includes('permission denied')) {
      throw new Error('Permissão negada. Verifique as políticas RLS da tabela codigos.');
    }
    
    throw new Error(`Erro ao buscar códigos: ${codigosError.message}`);
  }

  if (!codigos || codigos.length === 0) {
    console.warn('[useCodigosAdmin] Nenhum código retornado do Supabase (verifique RLS)');
    return [];
  }

  console.log(`[useCodigosAdmin] ${codigos.length} códigos carregados`);

  // Busca informações adicionais (apenas clientes - treinadora já vem no join)
  const codigosCompletos = await Promise.all(
    codigos.map(async (codigo: any) => {
      // Extrai nome da treinadora do join (pode ser array ou objeto)
      let treinadoraNome = 'Desconhecida';
      if (codigo.treinadoras) {
        if (Array.isArray(codigo.treinadoras) && codigo.treinadoras.length > 0) {
          treinadoraNome = codigo.treinadoras[0].nome;
        } else if (typeof codigo.treinadoras === 'object' && codigo.treinadoras.nome) {
          treinadoraNome = codigo.treinadoras.nome;
        }
      }

      // Se o código foi usado, busca informações do cliente
      let clienteNome: string | undefined;
      let clienteEmail: string | undefined;

      if (codigo.usado && codigo.cliente_id) {
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('nome, email')
          .eq('id', codigo.cliente_id)
          .single();

        if (clienteError) {
          console.error(`[useCodigosAdmin] Erro ao buscar cliente ${codigo.cliente_id}:`, clienteError);
        } else if (cliente) {
          clienteNome = cliente.nome;
          clienteEmail = cliente.email || undefined;
        }
      }

      return {
        id: codigo.id,
        codigo: codigo.codigo,
        treinadora_id: codigo.treinadora_id,
        treinadora_nome: treinadoraNome,
        usado: codigo.usado,
        valido_ate: codigo.valido_ate,
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        created_at: codigo.created_at,
      } as CodigoAdmin;
    })
  );

  return codigosCompletos;
}

/**
 * Hook para listar códigos (visão admin)
 */
export function useCodigosAdmin(options: UseCodigosAdminOptions = {}) {
  const { enabled = true, filtroStatus = 'todos', treinadoraId = null } = options;
  const queryClient = useQueryClient();

  const query = useQuery<CodigoAdmin[], Error>({
    queryKey: [...CODIGOS_ADMIN_QUERY_KEY, { filtroStatus, treinadoraId }],
    queryFn: () => fetchCodigosAdmin(filtroStatus, treinadoraId),
    enabled,
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
    console.error('[useCodigosAdmin] Erro no hook:', query.error);
  }

  // Log de sucesso
  if (query.data) {
    console.log('[useCodigosAdmin] Dados carregados:', query.data.length, 'códigos');
  }

  /**
   * Invalida o cache e força refetch
   */
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: CODIGOS_ADMIN_QUERY_KEY });
  };

  /**
   * Filtra códigos por status
   */
  const filtrarPorStatus = (status: 'todos' | 'usados' | 'ativos') => {
    queryClient.invalidateQueries({ 
      queryKey: [...CODIGOS_ADMIN_QUERY_KEY, { filtroStatus: status, treinadoraId }] 
    });
  };

  /**
   * Filtra códigos por treinadora
   */
  const filtrarPorTreinadora = (id: string | null) => {
    queryClient.invalidateQueries({ 
      queryKey: [...CODIGOS_ADMIN_QUERY_KEY, { filtroStatus, treinadoraId: id }] 
    });
  };

  return {
    ...query,
    codigos: query.data || [],
    refresh,
    filtrarPorStatus,
    filtrarPorTreinadora,
  };
}

export { CODIGOS_ADMIN_QUERY_KEY };
export default useCodigosAdmin;
