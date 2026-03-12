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
  import { gerarPDF } from '@/utils/pdfGenerator';

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

  interface CodigoInfo {
    codigo: string;
    usado_em: string;
    teste_completado_em: string;
  }

  export default function ClienteResultadoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { clienteId, resultadoId } = params;
    
    const [loading, setLoading] = useState(true);
    const [gerandoPDF, setGerandoPDF] = useState(false);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
    const [codigoInfo, setCodigoInfo] = useState<CodigoInfo | null>(null);

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

        // Buscar informações do código utilizado
        const { data: codigoData, error: codigoError } = await supabase
          .from('codigos')
          .select('codigo, usado_em, teste_completado_em')
          .eq('cliente_id', clienteId)
          .single();

        if (!codigoError && codigoData) {
          setCodigoInfo(codigoData as CodigoInfo);
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

    const handleGerarPDF = async () => {
      setGerandoPDF(true);
      try {
        await gerarPDF({
          cliente: {
            nome: codigoInfo?.codigo ? `Cliente ${codigoInfo.codigo}` : 'Cliente',
          },
          resultado: {
            scores_fatores: resultado.scores_fatores,
          },
          protocolos: protocolos,
          codigo: codigoInfo?.codigo,
          dataTeste: codigoInfo?.teste_completado_em 
            ? new Date(codigoInfo.teste_completado_em).toLocaleDateString('pt-BR')
            : new Date().toLocaleDateString('pt-BR'),
          tipo: 'cliente',
        });
      } catch (error: any) {
        console.error('Erro ao gerar PDF:', error);
        Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
      } finally {
        setGerandoPDF(false);
      }
    };

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

            {codigoInfo && (
              <View style={styles.codigoInfoCard}>
                <Text style={styles.codigoLabel}>Código utilizado</Text>
                <Text style={styles.codigoValue}>{codigoInfo.codigo}</Text>
                <Text style={styles.dataTeste}>
                  Teste realizado em {new Date(codigoInfo.teste_completado_em || codigoInfo.usado_em).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

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

            {/* Botões de Ação */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={[styles.botaoPDF, gerandoPDF && styles.botaoDisabled]}
                onPress={handleGerarPDF}
                disabled={gerandoPDF}
                activeOpacity={0.8}
              >
                {gerandoPDF ? (
                  <ActivityIndicator size="small" color={COLORS.creamLight} />
                ) : (
                  <Text style={styles.botaoPDFTexto}>📄 Baixar Resultado PDF</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => router.replace('/')}
                activeOpacity={0.8}
              >
                <Text style={styles.botaoVoltarTexto}>← Voltar para Home</Text>
              </TouchableOpacity>
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
    botoesContainer: {
      paddingHorizontal: 24,
      marginBottom: 24,
      gap: 12,
    },
    botaoPDF: {
      backgroundColor: COLORS.vinho || '#6B2D3A',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    botaoPDFTexto: {
      color: COLORS.creamLight,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    botaoVoltar: {
      backgroundColor: COLORS.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    botaoVoltarTexto: {
      color: COLORS.creamLight,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    botaoDisabled: {
      opacity: 0.7,
    },
    codigoInfoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      alignItems: 'center',
    },
    codigoLabel: {
      fontSize: 12,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    codigoValue: {
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.accent,
      letterSpacing: 1,
      marginBottom: 8,
    },
    dataTeste: {
      fontSize: 14,
      color: COLORS.cream,
      opacity: 0.9,
    },
  });
