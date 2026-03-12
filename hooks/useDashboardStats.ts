/**
 * Hook para buscar estatísticas do dashboard administrativo
 * 
 * Utiliza TanStack Query para caching e gerenciamento de estado
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { DashboardStats } from '@/types/admin';

const DASHBOARD_STATS_QUERY_KEY = ['admin', 'dashboard', 'stats'] as const;

interface UseDashboardStatsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

/**
 * Busca estatísticas do dashboard do Supabase
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Busca contagem de treinadoras (excluindo admins)
  const { count: totalTreinadoras, error: treinadorasError } = await supabase
    .from('treinadoras')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', false);

  if (treinadorasError) {
    console.error('Erro ao buscar total de treinadoras:', treinadorasError);
  }

  // Busca contagem total de códigos
  const { count: totalCodigos, error: codigosError } = await supabase
    .from('codigos')
    .select('*', { count: 'exact', head: true });

  if (codigosError) {
    console.error('Erro ao buscar total de códigos:', codigosError);
  }

  // Busca contagem de códigos usados
  const { count: totalCodigosUsados, error: codigosUsadosError } = await supabase
    .from('codigos')
    .select('*', { count: 'exact', head: true })
    .eq('usado', true);

  if (codigosUsadosError) {
    console.error('Erro ao buscar códigos usados:', codigosUsadosError);
  }

  // Busca contagem total de clientes
  const { count: totalClientes, error: clientesError } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  if (clientesError) {
    console.error('Erro ao buscar total de clientes:', clientesError);
  }

  // Busca contagem de clientes ativos
  const { count: totalClientesAtivos, error: clientesAtivosError } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativo');

  if (clientesAtivosError) {
    console.error('Erro ao buscar clientes ativos:', clientesAtivosError);
  }

  // Busca contagem de clientes com teste completo
  const { count: totalClientesCompletos, error: clientesCompletosError } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completo');

  if (clientesCompletosError) {
    console.error('Erro ao buscar clientes completos:', clientesCompletosError);
  }

  // Calcula códigos disponíveis (não usados)
  const codigosDisponiveis = (totalCodigos || 0) - (totalCodigosUsados || 0);

  return {
    totalTreinadoras: totalTreinadoras || 0,
    totalCodigos: totalCodigos || 0,
    totalCodigosUsados: totalCodigosUsados || 0,
    totalClientes: totalClientes || 0,
    totalClientesAtivos: totalClientesAtivos || 0,
    totalClientesCompletos: totalClientesCompletos || 0,
    codigosDisponiveis: Math.max(0, codigosDisponiveis),
  };
}

/**
 * Hook para buscar estatísticas do dashboard
 */
export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const { enabled = true, refetchInterval = false } = options;

  return useQuery<DashboardStats, Error>({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: fetchDashboardStats,
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export { DASHBOARD_STATS_QUERY_KEY };
export default useDashboardStats;
