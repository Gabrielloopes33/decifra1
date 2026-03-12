/**
 * Real-time Updates Hook for Meus Codigos - DECIFRA
 * 
 * Monitora mudanças na tabela 'codigos' em tempo real via Supabase Realtime.
 * Detecta quando um código é utilizado (campo 'usado' muda de false para true)
 * e automaticamente atualiza a lista através do refetch.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

// Tipo do payload esperado na tabela codigos
interface CodigoRow {
  id: string;
  codigo: string;
  treinadora_id: string;
  usado: boolean;
  cliente_id?: string;
  usado_em?: string;
  valido_ate?: string;
  created_at?: string;
}

interface UseMeusCodigosRealtimeOptions {
  /** Habilitar/desabilitar o realtime (default: true) */
  enabled?: boolean;
  /** Callback opcional quando um código é detectado como usado */
  onCodigoUsado?: (codigo: CodigoRow) => void;
}

/**
 * Hook para escutar atualizações em tempo real na tabela 'codigos'
 * 
 * @param treinadoraId - ID da treinadora para filtrar os códigos
 * @param refetch - Função do React Query para recarregar os dados
 * @param options - Opções adicionais de configuração
 * 
 * @example
 * ```typescript
 * const { data, refetch } = useMeusCodigos(treinadoraId);
 * useMeusCodigosRealtime(treinadoraId, refetch);
 * ```
 */
export function useMeusCodigosRealtime(
  treinadoraId: string | undefined,
  refetch: () => void,
  options: UseMeusCodigosRealtimeOptions = {}
) {
  const { enabled = true, onCodigoUsado } = options;
  
  // Ref para controlar se já foi inicializado (evita duplas subscriptions)
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Só inicia se tiver treinadoraId e estiver habilitado
    if (!treinadoraId || !enabled) {
      return;
    }

    // Evita criar subscription duplicada
    if (subscriptionRef.current) {
      return;
    }

    const channelName = `codigos-treinadora-${treinadoraId}`;

    // Cria o canal de subscription
    const subscription = supabase
      .channel(channelName)
      .on<RealtimePostgresUpdatePayload<CodigoRow>>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'codigos',
          filter: `treinadora_id=eq.${treinadoraId}`,
        },
        (payload) => {
          const oldRecord = payload.old;
          const newRecord = payload.new;

          // Detecta quando o código foi usado (usado mudou de false para true)
          if (newRecord.usado === true && oldRecord.usado === false) {
            console.log('[Realtime] Código usado detectado:', newRecord.codigo);
            
            // Chama o refetch para atualizar a lista
            refetch();
            
            // Chama callback opcional se fornecido
            if (onCodigoUsado) {
              onCodigoUsado(newRecord);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status (${channelName}):`, status);
      });

    // Armazena a referência
    subscriptionRef.current = subscription;

    // Cleanup: remove a subscription ao desmontar ou mudar treinadoraId
    return () => {
      if (subscriptionRef.current) {
        console.log(`[Realtime] Removendo subscription (${channelName})`);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [treinadoraId, refetch, enabled, onCodigoUsado]);
}

export default useMeusCodigosRealtime;
