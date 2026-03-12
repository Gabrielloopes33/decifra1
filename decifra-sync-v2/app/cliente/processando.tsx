/**
 * Tela Processando - DECIFRA
 * 
 * Experiência ritualística de processamento dos resultados
 * Versão simplificada sem Reanimated
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase/client';
import { calcularResultado } from '@/utils/calculadora';
import { recomendarProtocolos } from '@/utils/recomendacao';
import { MandalaAnimada } from '@/components/MandalaAnimada';
import { COLORS } from '@/constants/colors';
import { GRADIENTS } from '@/constants/colors-artio';

// Mensagens que aparecem durante o processamento
const MENSAGENS_PROCESSAMENTO = [
  'Coletando suas respostas...',
  'Analisando 30 facetas de personalidade...',
  'Calculando os 5 fatores principais...',
  'Comparando com base de dados...',
  'Selecionando protocolos personalizados...',
  'Preparando seu perfil completo...',
];

export default function ClienteProcessandoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { clienteId } = params;
  const [mensagemIndex, setMensagemIndex] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [scores, setScores] = useState<Array<{ fator: 'N' | 'E' | 'O' | 'A' | 'C'; percentil: number }>>([
    { fator: 'N', percentil: 0 },
    { fator: 'E', percentil: 0 },
    { fator: 'O', percentil: 0 },
    { fator: 'A', percentil: 0 },
    { fator: 'C', percentil: 0 },
  ]);
  const [processando, setProcessando] = useState(true);
  const [showMandala, setShowMandala] = useState(false);

  useEffect(() => {
    // Haptic de início
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    processarResultados();
  }, []);

  // Atualizar mensagens periodicamente
  useEffect(() => {
    if (!processando) return;
    
    const interval = setInterval(() => {
      setMensagemIndex(prev => {
        if (prev < MENSAGENS_PROCESSAMENTO.length - 1) {
          return prev + 1;
        }
        return prev;
      });
      setProgresso(prev => Math.min(prev + 15, 90));
    }, 1500);

    return () => clearInterval(interval);
  }, [processando]);

  const processarResultados = useCallback(async () => {
    try {
      // Buscar respostas
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('questao_id');

      if (respostasError || !respostasData || respostasData.length !== 120) {
        console.error('Erro ao buscar respostas:', respostasError);
        simularProcessamento();
        return;
      }

      // Calcular resultados
      const respostas = respostasData.map(r => ({
        questao_id: r.questao_id,
        resposta: r.resposta,
      }));

      const { scoresFacetas, scoresFatores } = calcularResultado(respostas);
      
      // Atualizar scores para animação da mandala
      setScores(scoresFatores.map(sf => ({
        fator: sf.fator,
        percentil: sf.percentil,
      })));

      // Mostrar mandala
      setShowMandala(true);
      
      // Gerar recomendações
      const recomendacoes = recomendarProtocolos(scoresFacetas, 3);

      // Salvar resultados
      const { data: resultadoData, error: resultadoError } = await supabase
        .from('resultados')
        .upsert({
          cliente_id: clienteId,
          scores_facetas: scoresFacetas,
          scores_fatores: scoresFatores,
          percentis: scoresFatores.map(sf => ({
            fator: sf.fator,
            percentil: sf.percentil,
          })),
          classificacoes: scoresFatores.map(sf => ({
            fator: sf.fator,
            classificacao: sf.classificacao,
          })),
        }, { onConflict: 'cliente_id' })
        .select()
        .single();

      if (resultadoError || !resultadoData) {
        console.error('Erro ao salvar resultados:', resultadoError);
        simularProcessamento();
        return;
      }

      // Salvar protocolos recomendados
      if (recomendacoes.length > 0) {
        const protocolosRecomendados = recomendacoes.map((rec) => ({
          resultado_id: resultadoData.id,
          protocolo_id: rec.protocolo.codigo,
          prioridade: rec.prioridade === 'alta' ? 1 : rec.prioridade === 'media' ? 2 : 3,
        }));

        await supabase
          .from('protocolos_recomendados')
          .upsert(protocolosRecomendados, { onConflict: 'resultado_id,protocolo_id' });
      }

      // Finalizar
      setProgresso(100);
      setProcessando(false);
      
      // Haptic de sucesso
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Esperar e navegar
      setTimeout(() => {
        router.replace({
          pathname: '/cliente/resultado',
          params: {
            clienteId: clienteId as string,
            resultadoId: resultadoData.id,
          },
        });
      }, 2500);

    } catch (error) {
      console.error('Erro ao processar:', error);
      simularProcessamento();
    }
  }, [clienteId]);

  // Função para simular processamento quando não há dados
  const simularProcessamento = () => {
    setTimeout(() => {
      setScores([
        { fator: 'N', percentil: 65 },
        { fator: 'E', percentil: 45 },
        { fator: 'O', percentil: 70 },
        { fator: 'A', percentil: 55 },
        { fator: 'C', percentil: 60 },
      ]);
      setShowMandala(true);
    }, 500);

    setTimeout(() => {
      setProgresso(100);
      setProcessando(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        router.replace({
          pathname: '/cliente/resultado',
          params: {
            clienteId: clienteId as string,
          },
        });
      }, 2000);
    }, 4000);
  };

  return (
    <LinearGradient colors={GRADIENTS.splash} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>Processando seu perfil</Text>
          
          {/* Mandala */}
          {showMandala && (
            <View style={styles.mandalaContainer}>
              <MandalaAnimada 
                scores={scores} 
                animated={false}
              />
            </View>
          )}

          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.mensagem}>
              {MENSAGENS_PROCESSAMENTO[mensagemIndex]}
            </Text>
            
            {/* Barra de progresso */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progresso}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progresso}%</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              🧠 Análise em andamento
            </Text>
            <Text style={styles.infoText}>
              Estamos processando suas 120 respostas para criar um mapa único da sua personalidade.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  mandalaContainer: {
    marginVertical: 16,
  },
  statusContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginTop: 16,
  },
  mensagem: {
    fontSize: 15,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
    height: 44,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cream,
    minWidth: 40,
    textAlign: 'right',
  },
  infoBox: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: 'rgba(45, 21, 24, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
    maxWidth: 320,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: 'center',
  },
});
