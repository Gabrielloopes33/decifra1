import { useEffect, useState } from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
  } from 'react-native';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { supabase } from '@/lib/supabase/client';
  import { Mandala } from '@/components/ui/Mandala';
  import { FATORES } from '@/constants/ipip';
  import type { FatorKey } from '@/constants/ipip';
  import { COLORS } from '@/constants/colors';

  interface Resultado {
    id: string;
    scores_fatores: Array<{
      fator: FatorKey;
      score: number;
      percentil: number;
      classificacao: string;
    }>;
  }

  interface Protocolo {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: number;
  }

  export default function ClienteResultadoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { clienteId, resultadoId } = params;
    
    const [loading, setLoading] = useState(true);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [protocolos, setProtocolos] = useState<Protocolo[]>([]);

    useEffect(() => {
      carregarResultado();
    }, []);

    const carregarResultado = async () => {
      try {
        const { data: resultadoData, error: resultadoError } = await supabase
          .from('resultados')
          .select('*')
          .eq('id', resultadoId)
          .single();

        if (resultadoError || !resultadoData) {
          console.error('Erro ao buscar resultado:', resultadoError);
          Alert.alert('Erro', 'Não foi possível carregar os resultados');
          return;
        }

        setResultado(resultadoData as Resultado);

        const { data: protocolosData, error: protocolosError } = await supabase
          .from('protocolos_recomendados')
          .select(`
            prioridade,
            protocolos (
              id,
              titulo,
              descricao
            )
          `)
          .eq('resultado_id', resultadoId)
          .order('prioridade', { ascending: false })
          .limit(4);

        if (protocolosError) {
          console.error('Erro ao buscar protocolos:', protocolosError);
        } else if (protocolosData) {
          const protocolosFormatados = protocolosData.map((p: any) => ({
            id: p.protocolos.id,
            titulo: p.protocolos.titulo,
            descricao: p.protocolos.descricao,
            prioridade: p.prioridade,
          }));
          setProtocolos(protocolosFormatados);
        }
      } catch (error: any) {
        console.error('Erro ao carregar resultado:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar os resultados');
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      );
    }

    if (!resultado) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar resultados</Text>
        </View>
      );
    }

    const scoresFatores = resultado.scores_fatores;

    return (
      <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Seu Resultado</Text>
              <Text style={styles.subtitle}>
                Teste de Personalidade Big Five
              </Text>
            </View>

            <View style={styles.mandalaContainer}>
              <Mandala
                scores={scoresFatores.map(sf => ({
                  fator: sf.fator,
                  percentil: sf.percentil,
                }))}
                size={320}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seus 5 Fatores</Text>
              
              {scoresFatores.map((scoreFator) => {
                const nomeFator = FATORES[scoreFator.fator];
                return (
                  <View key={scoreFator.fator} style={styles.fatorCard}>
                    <View style={styles.fatorHeader}>
                      <Text style={styles.fatorNome}>{nomeFator}</Text>
                      <Text style={styles.fatorClassificacao}>
                        {scoreFator.classificacao}
                      </Text>
                    </View>
                    <View style={styles.percentilBar}>
                      <View
                        style={[
                          styles.percentilFill,
                          { width: `${scoreFator.percentil}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.percentilText}>
                      Percentil: {scoreFator.percentil}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Protocolos Recomendados</Text>
              <Text style={styles.sectionSubtitle}>
                Baseado no seu perfil, recomendamos:
              </Text>
              
              {protocolos.length > 0 ? (
                protocolos.map((protocolo, index) => (
                  <View key={protocolo.id} style={styles.protocoloCard}>
                    <View style={styles.protocoloHeader}>
                      <View style={styles.protocoloNumeroContainer}>
                        <Text style={styles.protocoloNumero}>{index + 1}</Text>
                      </View>
                      <View style={styles.protocoloInfo}>
                        <Text style={styles.protocoloTitulo}>
                          {protocolo.titulo}
                        </Text>
                        <Text style={styles.protocoloDescricao}>
                          {protocolo.descricao}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Protocolos serão adicionados em breve
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Sua treinadora tem acesso a um relatório completo com análise detalhada de todas as 30 facetas e 6 protocolos personalizados.
              </Text>
            </View>

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
    safeArea: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.dark1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: COLORS.dark1,
    },
    errorText: {
      fontSize: 18,
      color: COLORS.error,
    },
    content: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.cream,
      opacity: 0.9,
    },
    mandalaContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: COLORS.cardBg,
      marginHorizontal: 24,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 16,
      color: COLORS.cream,
      opacity: 0.9,
      marginBottom: 16,
    },
    fatorCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    fatorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    fatorNome: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.cream,
    },
    fatorClassificacao: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.accent,
    },
    percentilBar: {
      height: 8,
      backgroundColor: 'rgba(245, 230, 211, 0.15)',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    percentilFill: {
      height: '100%',
      backgroundColor: COLORS.accent,
      borderRadius: 4,
    },
    percentilText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    protocoloCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    protocoloHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    protocoloNumeroContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    protocoloNumero: {
      color: COLORS.creamLight,
      fontSize: 16,
      fontWeight: 'bold',
    },
    protocoloInfo: {
      flex: 1,
    },
    protocoloTitulo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.cream,
      marginBottom: 6,
    },
    protocoloDescricao: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    emptyState: {
      padding: 24,
      alignItems: 'center',
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    emptyStateText: {
      fontSize: 16,
      color: COLORS.textSecondary,
    },
    infoBox: {
      marginHorizontal: 24,
      padding: 16,
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    infoText: {
      fontSize: 14,
      color: COLORS.cream,
      lineHeight: 20,
    },
    espacoFinal: {
      height: 40,
    },
  });
