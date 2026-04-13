import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Interface representando um código disponível para uso pela treinadora
 */
export interface CodigoDisponivel {
  id: string;
  codigo: string;
  validoAte: string;
  diasRestantes: number;
}

/**
 * Retorno do hook useMeusCodigos
 */
interface UseMeusCodigosReturn {
  disponiveis: CodigoDisponivel[];
  total: number;
}

/**
 * Query key para cache do React Query
 */
const MEUS_CODIGOS_QUERY_KEY = 'meus-codigos';

/**
 * Calcula os dias restantes até a validade do código
 * @param validoAte - Data de validade do código em formato ISO
 * @returns Número de dias restantes (0 se vence hoje, negativo se já venceu)
 */
function calcularDiasRestantes(validoAte: string): number {
  const dataValidade = new Date(validoAte).getTime();
  const agora = Date.now();
  const diffEmMilissegundos = dataValidade - agora;
  const diffEmDias = Math.ceil(diffEmMilissegundos / (1000 * 60 * 60 * 24));
  return diffEmDias;
}

/**
 * Hook para buscar códigos disponíveis de uma treinadora
 * 
 * @param treinadoraId - ID da treinadora (opcional, se não fornecido não executa a query)
 * @returns Query do React Query com lista de códigos disponíveis e total
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useMeusCodigos(treinadora?.id);
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <View>
 *     <Text>Você tem {data?.total} códigos disponíveis</Text>
 *     {data?.disponiveis.map(codigo => (
 *       <CodigoCard key={codigo.id} codigo={codigo} />
 *     ))}
 *   </View>
 * );
 * ```
 */
export function useMeusCodigos(treinadoraId?: string) {
  return useQuery<UseMeusCodigosReturn>({
    queryKey: [MEUS_CODIGOS_QUERY_KEY, treinadoraId],
    queryFn: async (): Promise<UseMeusCodigosReturn> => {
      // Se não houver treinadoraId, retorna array vazio
      if (!treinadoraId) {
        return { disponiveis: [], total: 0 };
      }

      const { data, error } = await supabase
        .from('codigos')
        .select('id, codigo, valido_ate')
        .eq('treinadora_id', treinadoraId)
        .eq('usado', false)
        .eq('distribuido', false)
        .gt('valido_ate', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useMeusCodigos] Erro ao buscar códigos:', error);
        throw new Error(`Falha ao carregar códigos: ${error.message}`);
      }

      // Mapeia os dados do Supabase para a interface CodigoDisponivel
      const disponiveis: CodigoDisponivel[] =
        data?.map((item) => ({
          id: item.id,
          codigo: item.codigo,
          validoAte: item.valido_ate,
          diasRestantes: calcularDiasRestantes(item.valido_ate),
        })) ?? [];

      return {
        disponiveis,
        total: disponiveis.length,
      };
    },
    // Só executa a query se houver treinadoraId
    enabled: !!treinadoraId,
    // Cache de 5 minutos - dados não mudam frequentemente
    staleTime: 5 * 60 * 1000,
    // Não recarrega ao focar a janela (comportamento padrão em mobile)
    refetchOnWindowFocus: false,
    // Tenta novamente em caso de erro (máximo 2 tentativas)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export default useMeusCodigos;
