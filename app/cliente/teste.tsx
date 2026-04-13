import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { QUESTOES } from '@/constants/questoes';
import { getQuestoesEstacao } from '@/constants/ordem-questoes';
import { STATION_THEMES } from '@/constants/colors-artio';
import { RespostaButton } from '@/components/RespostaButton';
import { supabase } from '@/lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';

const ESCALA = [
  { valor: 1, label: 'Discordo\nTotalmente' },
  { valor: 2, label: 'Discordo' },
  { valor: 3, label: 'Neutro' },
  { valor: 4, label: 'Concordo' },
  { valor: 5, label: 'Concordo\nTotalmente' },
];

export default function ClienteTesteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { clienteId, estacao: estacaoParam } = params;
  const estacaoAtual = parseInt(estacaoParam as string) || 1;

  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  // Animação da barra de progresso
  const progressAnim = useState(new Animated.Value(0))[0];

  // Obter questões na ordem anti-manipulação
  const questoesIds = getQuestoesEstacao(estacaoAtual as 1 | 2 | 3 | 4);
  const temaEstacao = STATION_THEMES[estacaoAtual as 1 | 2 | 3 | 4];

  useEffect(() => {
    carregarRespostasLocais();
  }, []);

  useEffect(() => {
    // Animar barra de progresso quando respostas mudam
    const { percentual } = progresso();
    Animated.spring(progressAnim, {
      toValue: percentual,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [respostas]);

  const carregarRespostasLocais = async () => {
    try {
      const respostasString = await AsyncStorage.getItem(`respostas_estacao_${estacaoAtual}`);
      if (respostasString) {
        const respostasLocal = JSON.parse(respostasString);
        setRespostas(respostasLocal);
      }
    } catch (error) {
      console.error('Erro ao carregar respostas locais:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarRespostaLocal = async (questaoId: number, resposta: number) => {
    // Feedback tátil
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const novasRespostas = { ...respostas, [questaoId]: resposta };
    setRespostas(novasRespostas);

    try {
      await AsyncStorage.setItem(
        `respostas_estacao_${estacaoAtual}`,
        JSON.stringify(novasRespostas)
      );
    } catch (error) {
      console.error('Erro ao salvar resposta local:', error);
    }
  };

  const progresso = useCallback(() => {
    const respondidas = Object.keys(respostas).length;
    const total = questoesIds.length;
    return { 
      respondidas, 
      total, 
      percentual: total > 0 ? (respondidas / total) * 100 : 0 
    };
  }, [respostas, questoesIds]);

  const todasRespondidas = () => {
    return questoesIds.every((q: number) => respostas[q] !== undefined);
  };

  const finalizarEstacao = async () => {
    if (!todasRespondidas()) {
      const pendentes = questoesIds.length - Object.keys(respostas).length;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Questões pendentes',
        `Você ainda tem ${pendentes} questões para responder nesta estação.`
      );
      return;
    }

    setSalvando(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const respostasArray = questoesIds.map((questaoId: number) => ({
        cliente_id: clienteId as string,
        questao_id: questaoId,
        resposta: respostas[questaoId],
      }));

      const { error } = await supabase
        .from('respostas')
        .upsert(respostasArray, { onConflict: 'cliente_id,questao_id' });

      if (error) {
        console.error('Erro ao salvar respostas:', error);
        Alert.alert('Erro', 'Não foi possível salvar suas respostas. Tente novamente.');
        setSalvando(false);
        return;
      }

      const statusUpdate = estacaoAtual < 4 ? 'em_andamento' : 'completo';
      await supabase
        .from('clientes')
        .update({ status: statusUpdate })
        .eq('id', clienteId as string);

      await AsyncStorage.removeItem(`respostas_estacao_${estacaoAtual}`);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (estacaoAtual < 4) {
        // Mensagem de transição entre estações
        router.push({
          pathname: '/cliente/transicao',
          params: {
            clienteId: clienteId as string,
            estacaoAtual: String(estacaoAtual),
            proximaEstacao: String(estacaoAtual + 1),
          },
        });
      } else {
        router.push({
          pathname: '/cliente/processando',
          params: { clienteId: clienteId as string },
        });
      }
    } catch (error: any) {
      console.error('Erro ao finalizar estacao:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao finalizar a estação');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={temaEstacao.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.creamLight} />
      </LinearGradient>
    );
  }

  const { respondidas, total } = progresso();
  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={temaEstacao.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header com tema da estação */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.stationBadge}>
              <Text style={[styles.stationIcon, { color: temaEstacao.color }]}>
                {temaEstacao.icon === 'cloud' && '☁️'}
                {temaEstacao.icon === 'mountain' && '⛰️'}
                {temaEstacao.icon === 'water' && '💧'}
                {temaEstacao.icon === 'flame' && '🔥'}
              </Text>
              <Text style={[styles.stationLabel, { color: temaEstacao.textSecondary }]}>
                Estação {estacaoAtual} de 4
              </Text>
            </View>
            <Text style={[styles.progressoText, { color: temaEstacao.textSecondary }]}>
              {respondidas}/{total}
            </Text>
          </View>
          
          <Text style={[styles.nomeEstacao, { color: temaEstacao.textPrimary }]}>{temaEstacao.name}</Text>
          <Text style={[styles.descricaoEstacao, { color: temaEstacao.textSecondary }]}>{temaEstacao.description}</Text>

          {/* Barra de progresso animada */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: widthInterpolated,
                    backgroundColor: temaEstacao.color,
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentual}>
              {Math.round((respondidas / total) * 100)}%
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {questoesIds.map((questaoId: number) => {
            const questao = QUESTOES.find(q => q.id === questaoId);
            if (!questao) return null;

            const respostaSelecionada = respostas[questaoId];

            return (
              <View key={questaoId} style={styles.questaoCard}>
                <View style={styles.questaoHeader}>
                  <Text style={[styles.questaoNumero, { color: temaEstacao.color }]}>
                    Questão {questaoId}
                  </Text>
                  {respostaSelecionada && (
                    <View style={[styles.respondidoBadge, { backgroundColor: temaEstacao.color }]}>
                      <Text style={[styles.respondidoText, { color: temaEstacao.textPrimary }]}>✓</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.questaoTexto}>{questao.texto}</Text>

                <View style={styles.escalaContainer}>
                  {ESCALA.map(({ valor, label }) => (
                    <RespostaButton
                      key={valor}
                      valor={valor}
                      label={label}
                      isSelected={respostaSelecionada === valor}
                      themeColor={temaEstacao.color}
                      selectedTextColor={temaEstacao.textPrimary}
                      onPress={() => salvarRespostaLocal(questaoId, valor)}
                    />
                  ))}
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={[
              styles.botaoFinalizar,
              { 
                backgroundColor: todasRespondidas() ? temaEstacao.color : COLORS.textMuted,
                opacity: todasRespondidas() ? 1 : 0.5,
              },
            ]}
            onPress={finalizarEstacao}
            disabled={!todasRespondidas() || salvando}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color={COLORS.creamLight} />
            ) : (
              <Text style={styles.botaoFinalizarTexto}>
                {estacaoAtual < 4 ? 'Próxima Estação →' : 'Finalizar Teste'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.espacoFinal} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stationIcon: {
    fontSize: 24,
  },
  stationLabel: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.95,
  },
  progressoText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.95,
  },
  nomeEstacao: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  descricaoEstacao: {
    fontSize: 16,
    opacity: 0.95,
    marginBottom: 18,
    lineHeight: 22,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(245, 240, 230, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentual: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questaoCard: {
    backgroundColor: 'rgba(45, 21, 24, 0.75)',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.15)',
  },
  questaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  questaoNumero: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  respondidoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respondidoText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  questaoTexto: {
    fontSize: 18,
    color: COLORS.creamLight,
    marginBottom: 24,
    lineHeight: 27,
    fontWeight: '500',
  },
  escalaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  botaoFinalizar: {
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoFinalizarTexto: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  espacoFinal: {
    height: 48,
  },
});
