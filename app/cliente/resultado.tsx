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
  import { PROTOCOLOS } from '@/constants/protocolos';
  import { getInterpretacao, type Faixa } from '@/constants/interpretacoes';
  import { recomendarProtocolosCliente } from '@/utils/recomendacao';
  import { COLORS } from '@/constants/colors';
  import { gerarPDF } from '@/utils/pdfGenerator';
  import {
    gerarInterpretacaoPrincipal, 
    type ScoreFator, 
    type ScoreFaceta, 
    type ProtocoloRecomendado,
    type VisaoGeralFator,
    CORES_CLASSIFICACAO
  } from '@/utils/interpretacaoPrincipal';

  interface Resultado {
    id: string;
    scores_fatores: Array<{
      fator: FatorKey;
      score: number;
      percentil: number;
      classificacao: string;
    }>;
    scores_facetas?: Array<{
      faceta: string;
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
          .select('protocolo_id, prioridade')
          .eq('resultado_id', resultadoId)
          .order('prioridade', { ascending: true })
          .limit(6);

        if (protocolosError) {
          console.error('Erro ao buscar protocolos:', protocolosError);
        }

        if (protocolosData && protocolosData.length > 0) {
          const protocolosFormatados = protocolosData
            .map((p: any) => {
              const protocolo = PROTOCOLOS[p.protocolo_id as string];
              if (!protocolo) return null;
              return {
                id: protocolo.codigo,
                titulo: protocolo.titulo,
                descricao: protocolo.descricao,
                prioridade: p.prioridade,
              };
            })
            .filter((p): p is Protocolo => p !== null)
            .sort((a, b) => a.prioridade - b.prioridade)
            .slice(0, 4);

          setProtocolos(protocolosFormatados);
        } else if (resultadoData.scores_facetas && resultadoData.scores_facetas.length > 0) {
          const recomendacoesFallback = recomendarProtocolosCliente(resultadoData.scores_facetas)
            .slice(0, 4)
            .map((rec, index) => ({
              id: rec.protocolo.codigo,
              titulo: rec.protocolo.titulo,
              descricao: rec.protocolo.descricao,
              prioridade: index + 1,
            }));

          setProtocolos(recomendacoesFallback);
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

    const classificarParaFaixa = (classificacao: string): Faixa => {
      const normalized = classificacao.toLowerCase().trim();
      if (normalized.includes('muito') && normalized.includes('baixo')) return 'Muito Baixo';
      if (normalized.includes('baixo')) return 'Baixo';
      if (normalized.includes('muito') && normalized.includes('alto')) return 'Muito Alto';
      if (normalized.includes('alto')) return 'Alto';
      return 'Médio';
    };

    // Gerar interpretação principal completa
    const scoresFatoresTipados: ScoreFator[] = scoresFatores.map(sf => ({
      fator: sf.fator,
      score: sf.score,
      percentil: sf.percentil,
      classificacao: classificarParaFaixa(sf.classificacao) as ScoreFator['classificacao'],
    }));

    const scoresFacetasTipados: ScoreFaceta[] = resultado.scores_facetas?.map((sf: any) => ({
      faceta: sf.faceta,
      score: sf.score,
      percentil: sf.percentil,
      classificacao: classificarParaFaixa(sf.classificacao) as ScoreFaceta['classificacao'],
    })) || [];

    const protocolosTipados: ProtocoloRecomendado[] = protocolos.map(p => ({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      prioridade: p.prioridade,
    }));

    const interpretacaoPrincipal = gerarInterpretacaoPrincipal(
      scoresFatoresTipados,
      scoresFacetasTipados,
      protocolosTipados
    );

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

    // Renderizar card da visão geral de um fator
    const renderVisaoGeralCard = (item: VisaoGeralFator, index: number) => {
      const isDominante = index === 0;
      return (
        <View 
          key={item.fator} 
          style={[
            styles.visaoGeralCard,
            isDominante && styles.visaoGeralCardDestaque,
            { borderLeftColor: item.corIndicador, borderLeftWidth: 4 }
          ]}
        >
          <View style={styles.visaoGeralHeader}>
            <View style={styles.visaoGeralIconeContainer}>
              <Text style={styles.visaoGeralIcone}>{item.icone}</Text>
            </View>
            <View style={styles.visaoGeralTituloContainer}>
              <Text style={styles.visaoGeralNome}>{item.nome}</Text>
              <View style={styles.visaoGeralClassificacaoRow}>
                <Text style={[styles.visaoGeralClassificacao, { color: item.corIndicador }]}>
                  {item.classificacao}
                </Text>
                <Text style={styles.visaoGeralPercentil}>P{item.percentil}</Text>
              </View>
            </View>
            {item.precisaAtencao && (
              <View style={styles.atencaoBadge}>
                <Text style={styles.atencaoBadgeText}>🌱</Text>
              </View>
            )}
          </View>
          
          {/* Barra de progresso visual */}
          <View style={styles.visaoGeralBarraContainer}>
            <View style={styles.visaoGeralBarraBg}>
              <View 
                style={[
                  styles.visaoGeralBarraFill, 
                  { 
                    width: `${item.percentil}%`,
                    backgroundColor: item.corIndicador 
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.visaoGeralDescricao}>{item.descricaoBreve}</Text>
          
          {isDominante && (
            <View style={styles.dominanteBadge}>
              <Text style={styles.dominanteBadgeText}>⭐ Destaque Principal</Text>
            </View>
          )}
        </View>
      );
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

            {/* Resumo do Perfil */}
            {interpretacaoPrincipal && (
              <View style={styles.section}>
                <View style={styles.resumoCard}>
                  <Text style={styles.resumoEmoji}>{interpretacaoPrincipal.resumo.emojiPerfil}</Text>
                  <Text style={styles.resumoArquetipo}>{interpretacaoPrincipal.resumo.arquetipo}</Text>
                  <Text style={styles.resumoFrase}>{interpretacaoPrincipal.resumo.fraseSintese}</Text>
                  <View style={styles.palavrasChaveContainer}>
                    {interpretacaoPrincipal.resumo.palavrasChave.map((palavra, index) => (
                      <View key={index} style={styles.palavraChaveTag}>
                        <Text style={styles.palavraChaveText}>{palavra}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Perfil Dominante */}
            {interpretacaoPrincipal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seu Perfil Principal</Text>
                <Text style={styles.sectionSubtitle}>
                  Destaque em {interpretacaoPrincipal.perfilDominante.nome}
                </Text>

                <View style={styles.interpretacaoCard}>
                  <Text style={styles.interpretacaoTitulo}>{interpretacaoPrincipal.perfilDominante.titulo}</Text>
                  <Text style={styles.interpretacaoSubtitulo}>{interpretacaoPrincipal.perfilDominante.subtitulo}</Text>
                  <Text style={styles.interpretacaoDescricao}>{interpretacaoPrincipal.perfilDominante.descricao}</Text>
                  
                  {/* Texto complementar sobre outros aspectos */}
                  <View style={styles.textoComplementarContainer}>
                    <Text style={styles.textoComplementar}>
                      {interpretacaoPrincipal.perfilDominante.textoComplementar}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* NOVA SEÇÃO: Visão Geral dos 5 Fatores */}
            {interpretacaoPrincipal && interpretacaoPrincipal.visaoGeral.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visão Geral do seu Perfil</Text>
                <Text style={styles.sectionSubtitle}>
                  Suas 5 dimensões de personalidade
                </Text>
                
                <View style={styles.visaoGeralGrid}>
                  {interpretacaoPrincipal.visaoGeral.map((fator, index) => 
                    renderVisaoGeralCard(fator, index)
                  )}
                </View>
                
                <View style={styles.visaoGeralLegenda}>
                  <View style={styles.legendaItem}>
                    <Text style={styles.legendaIcone}>🌱</Text>
                    <Text style={styles.legendaTexto}>Área recomendada para desenvolvimento</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Características Secundárias - AGORA COM TODOS OS 4 FATORES */}
            {interpretacaoPrincipal && interpretacaoPrincipal.caracteristicasSecundarias.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Características Secundárias</Text>
                <Text style={styles.sectionSubtitle}>
                  Todas as outras dimensões que complementam seu perfil
                </Text>

                {interpretacaoPrincipal.caracteristicasSecundarias.map((caracteristica) => (
                  <View key={caracteristica.fator} style={styles.caracteristicaCard}>
                    <View style={styles.caracteristicaHeader}>
                      <View style={styles.caracteristicaHeaderLeft}>
                        <Text style={styles.caracteristicaIcone}>
                          {caracteristica.tipo === 'equilibrio' ? '⚖️' : 
                           caracteristica.tipo === 'forte_alta' ? '⬆️' : '⬇️'}
                        </Text>
                        <Text style={styles.caracteristicaNome}>{caracteristica.nome}</Text>
                      </View>
                      <View style={[
                        styles.caracteristicaBadge,
                        caracteristica.tipo === 'forte_alta' ? styles.badgeAlta :
                        caracteristica.tipo === 'forte_baixa' ? styles.badgeBaixa :
                        styles.badgeEquilibrio
                      ]}>
                        <Text style={styles.caracteristicaBadgeText}>
                          {caracteristica.tipo === 'forte_alta' ? 'Alto' : 
                           caracteristica.tipo === 'forte_baixa' ? 'Baixo' : 'Equilíbrio'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.caracteristicaPercentilRow}>
                      <Text style={styles.caracteristicaPercentil}>P{caracteristica.percentil}</Text>
                      {caracteristica.precisaAtencao && (
                        <View style={styles.atencaoTag}>
                          <Text style={styles.atencaoTagText}>🌱 Área a trabalhar</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.caracteristicaDescricao}>{caracteristica.descricaoCurta}</Text>
                    
                    <View style={styles.complementoContainer}>
                      <Text style={styles.complementoLabel}>💡 Como complementa seu perfil:</Text>
                      <Text style={styles.caracteristicaComplemento}>{caracteristica.comoComplementa}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Combinações Detectadas */}
            {interpretacaoPrincipal && interpretacaoPrincipal.combinacoesDetectadas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Combinações Especiais</Text>
                <Text style={styles.sectionSubtitle}>
                  Padrões únicos no seu perfil
                </Text>

                {interpretacaoPrincipal.combinacoesDetectadas.map((combinacao) => (
                  <View 
                    key={combinacao.id} 
                    style={[styles.combinacaoCard, { borderLeftColor: combinacao.corDestaque }]}
                  >
                    <Text style={styles.combinacaoNome}>{combinacao.nome}</Text>
                    <Text style={styles.combinacaoDescricao}>{combinacao.descricao}</Text>
                    <View style={styles.implicacoesContainer}>
                      {combinacao.implicacoes.map((implicacao, idx) => (
                        <View key={idx} style={styles.implicacaoRow}>
                          <Text style={styles.implicacaoBullet}>•</Text>
                          <Text style={styles.implicacaoText}>{implicacao}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Áreas de Crescimento - MAIS PROMINENTE */}
            {interpretacaoPrincipal && interpretacaoPrincipal.tracosDesenvolver.length > 0 && (
              <View style={styles.section}>
                <View style={styles.areaCrescimentoHeader}>
                  <Text style={styles.sectionTitle}>🌱 Áreas de Crescimento</Text>
                </View>
                
                <View style={styles.areaCrescimentoIntroCard}>
                  <Text style={styles.areaCrescimentoIntroText}>
                    Com base no seu perfil, estes são os traços que recomendamos desenvolver:
                  </Text>
                </View>

                {interpretacaoPrincipal.tracosDesenvolver.map((traco) => (
                  <View key={traco.fator} style={[styles.tracoCard, styles.tracoCardDestaque]}>
                    <View style={styles.tracoHeader}>
                      <View style={styles.tracoHeaderLeft}>
                        <Text style={styles.tracoIcone}>🌱</Text>
                        <Text style={styles.tracoNome}>{traco.nome}</Text>
                      </View>
                      <View style={styles.tracoClassificacaoBadge}>
                        <Text style={styles.tracoClassificacaoText}>{traco.classificacao}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.tracoPercentilContainer}>
                      <Text style={styles.tracoPercentilLabel}>Percentil: </Text>
                      <Text style={styles.tracoPercentil}>P{traco.percentil}</Text>
                    </View>
                    
                    <Text style={styles.tracoDescricao}>{traco.descricaoEmpoderada}</Text>
                    
                    <View style={styles.beneficiosContainer}>
                      <Text style={styles.tracoBeneficiosTitulo}>✨ Benefícios do desenvolvimento:</Text>
                      {traco.beneficios.map((beneficio, idx) => (
                        <View key={idx} style={styles.beneficioRow}>
                          <Text style={styles.beneficioBullet}>✓</Text>
                          <Text style={styles.beneficioText}>{beneficio}</Text>
                        </View>
                      ))}
                    </View>
                    
                    {traco.protocolosRelacionados.length > 0 && (
                      <View style={styles.protocolosRelacionados}>
                        <Text style={styles.protocolosRelacionadosLabel}>Protocolos relacionados:</Text>
                        <Text style={styles.protocolosRelacionadosText}>
                          {traco.protocolosRelacionados.join(' • ')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Se não houver traços específicos para desenvolver, mostrar mensagem positiva */}
            {interpretacaoPrincipal && interpretacaoPrincipal.tracosDesenvolver.length === 0 && (
              <View style={styles.section}>
                <View style={styles.areaCrescimentoHeader}>
                  <Text style={styles.sectionTitle}>🌱 Áreas de Crescimento</Text>
                </View>
                <View style={styles.perfilEquilibradoCard}>
                  <Text style={styles.perfilEquilibradoEmoji}>⚖️</Text>
                  <Text style={styles.perfilEquilibradoTitulo}>Perfil Equilibrado</Text>
                  <Text style={styles.perfilEquilibradoTexto}>
                    Seu perfil demonstra grande equilíbrio entre as cinco dimensões. 
                    Continue cultivando todas as áreas para manter essa harmonia e 
                    buscar a excelência em cada uma delas.
                  </Text>
                </View>
              </View>
            )}

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
      paddingBottom: 18,
    },
    title: {
      fontSize: 34,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 17,
      color: COLORS.cream,
      opacity: 0.95,
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
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 10,
    },
    sectionSubtitle: {
      fontSize: 17,
      color: COLORS.cream,
      opacity: 0.95,
      marginBottom: 18,
    },
    protocoloHint: {
      fontSize: 14,
      color: COLORS.accent,
      fontWeight: '600',
      marginTop: -6,
      marginBottom: 14,
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
      fontSize: 13,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    codigoValue: {
      fontFamily: 'monospace',
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.accent,
      letterSpacing: 1,
      marginBottom: 10,
    },
    dataTeste: {
      fontSize: 15,
      color: COLORS.cream,
      opacity: 0.95,
    },
    // Resumo do Perfil
    resumoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      alignItems: 'center',
    },
    resumoEmoji: {
      fontSize: 52,
      marginBottom: 14,
    },
    resumoArquetipo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 14,
      textAlign: 'center',
    },
    resumoFrase: {
      fontSize: 16,
      color: COLORS.cream,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 18,
      fontStyle: 'italic',
    },
    palavrasChaveContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    palavraChaveTag: {
      backgroundColor: 'rgba(196, 90, 61, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(196, 90, 61, 0.4)',
    },
    palavraChaveText: {
      color: COLORS.accent,
      fontSize: 13,
      fontWeight: '600',
    },
    // Perfil Dominante
    interpretacaoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    interpretacaoTitulo: {
      fontSize: 19,
      fontWeight: '700',
      color: COLORS.creamLight,
      marginBottom: 6,
    },
    interpretacaoSubtitulo: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.accent,
      marginBottom: 12,
    },
    interpretacaoDescricao: {
      fontSize: 15,
      color: COLORS.textSecondary,
      lineHeight: 24,
    },
    textoComplementarContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(245, 230, 211, 0.1)',
    },
    textoComplementar: {
      fontSize: 14,
      color: COLORS.accent,
      fontStyle: 'italic',
      lineHeight: 22,
    },
    // NOVOS ESTILOS: Visão Geral dos 5 Fatores
    visaoGeralGrid: {
      gap: 12,
    },
    visaoGeralCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    visaoGeralCardDestaque: {
      backgroundColor: 'rgba(196, 90, 61, 0.08)',
      borderColor: 'rgba(196, 90, 61, 0.3)',
    },
    visaoGeralHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    visaoGeralIconeContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(245, 230, 211, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    visaoGeralIcone: {
      fontSize: 22,
    },
    visaoGeralTituloContainer: {
      flex: 1,
    },
    visaoGeralNome: {
      fontSize: 17,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 3,
    },
    visaoGeralClassificacaoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    visaoGeralClassificacao: {
      fontSize: 15,
      fontWeight: '600',
    },
    visaoGeralPercentil: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    atencaoBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(39, 174, 96, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    atencaoBadgeText: {
      fontSize: 16,
    },
    visaoGeralBarraContainer: {
      marginBottom: 10,
    },
    visaoGeralBarraBg: {
      height: 6,
      backgroundColor: 'rgba(245, 230, 211, 0.1)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    visaoGeralBarraFill: {
      height: '100%',
      borderRadius: 3,
    },
    visaoGeralDescricao: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    dominanteBadge: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(196, 90, 61, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(196, 90, 61, 0.3)',
    },
    dominanteBadgeText: {
      fontSize: 12,
      color: COLORS.accent,
      fontWeight: '600',
    },
    visaoGeralLegenda: {
      marginTop: 18,
      padding: 14,
      backgroundColor: 'rgba(39, 174, 96, 0.08)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(39, 174, 96, 0.2)',
    },
    legendaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendaIcone: {
      fontSize: 18,
    },
    legendaTexto: {
      fontSize: 14,
      color: COLORS.cream,
    },
    // Características Secundárias - Atualizado
    caracteristicaCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    caracteristicaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    caracteristicaHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    caracteristicaIcone: {
      fontSize: 18,
    },
    caracteristicaNome: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.creamLight,
    },
    caracteristicaBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
    },
    badgeAlta: {
      backgroundColor: 'rgba(39, 174, 96, 0.3)',
    },
    badgeBaixa: {
      backgroundColor: 'rgba(231, 76, 60, 0.3)',
    },
    badgeEquilibrio: {
      backgroundColor: 'rgba(243, 156, 18, 0.3)',
    },
    caracteristicaBadgeText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.creamLight,
    },
    caracteristicaPercentilRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    caracteristicaPercentil: {
      fontSize: 15,
      color: COLORS.textSecondary,
      fontWeight: '600',
    },
    atencaoTag: {
      backgroundColor: 'rgba(39, 174, 96, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(39, 174, 96, 0.3)',
    },
    atencaoTagText: {
      fontSize: 11,
      color: '#27AE60',
      fontWeight: '500',
    },
    caracteristicaDescricao: {
      fontSize: 15,
      color: COLORS.cream,
      lineHeight: 22,
      marginBottom: 14,
    },
    complementoContainer: {
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(245, 230, 211, 0.1)',
    },
    complementoLabel: {
      fontSize: 13,
      color: COLORS.accent,
      fontWeight: '600',
      marginBottom: 6,
    },
    caracteristicaComplemento: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    // Combinações
    combinacaoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      borderLeftWidth: 4,
    },
    combinacaoNome: {
      fontSize: 19,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 10,
    },
    combinacaoDescricao: {
      fontSize: 15,
      color: COLORS.cream,
      lineHeight: 22,
      marginBottom: 14,
    },
    implicacoesContainer: {
      gap: 8,
    },
    implicacaoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    implicacaoBullet: {
      color: COLORS.accent,
      fontSize: 15,
      marginRight: 10,
      lineHeight: 22,
    },
    implicacaoText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
      flex: 1,
    },
    // Áreas de Crescimento - Atualizado e mais proeminente
    areaCrescimentoHeader: {
      marginBottom: 12,
    },
    areaCrescimentoIntroCard: {
      backgroundColor: 'rgba(39, 174, 96, 0.15)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(39, 174, 96, 0.3)',
    },
    areaCrescimentoIntroText: {
      fontSize: 16,
      color: COLORS.cream,
      lineHeight: 24,
      fontWeight: '500',
    },
    tracoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    tracoCardDestaque: {
      borderColor: 'rgba(39, 174, 96, 0.4)',
      backgroundColor: 'rgba(39, 174, 96, 0.05)',
    },
    tracoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    tracoHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    tracoIcone: {
      fontSize: 22,
    },
    tracoNome: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.creamLight,
    },
    tracoClassificacaoBadge: {
      backgroundColor: 'rgba(245, 230, 211, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 10,
    },
    tracoClassificacaoText: {
      fontSize: 13,
      color: COLORS.cream,
      fontWeight: '600',
    },
    tracoPercentilContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tracoPercentilLabel: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    tracoPercentil: {
      fontSize: 15,
      color: COLORS.textSecondary,
      fontWeight: '600',
    },
    tracoDescricao: {
      fontSize: 15,
      color: COLORS.cream,
      lineHeight: 22,
      marginBottom: 14,
    },
    beneficiosContainer: {
      backgroundColor: 'rgba(245, 230, 211, 0.05)',
      borderRadius: 10,
      padding: 14,
      marginBottom: 14,
    },
    tracoBeneficiosTitulo: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.accent,
      marginBottom: 10,
    },
    beneficioRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    beneficioBullet: {
      color: '#27AE60',
      fontSize: 15,
      marginRight: 10,
      lineHeight: 20,
    },
    beneficioText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
      flex: 1,
    },
    protocolosRelacionados: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: 'rgba(245, 230, 211, 0.1)',
    },
    protocolosRelacionadosLabel: {
      fontSize: 13,
      color: COLORS.textMuted,
      marginBottom: 6,
    },
    protocolosRelacionadosText: {
      fontSize: 14,
      color: COLORS.accent,
      fontWeight: '500',
    },
    // Perfil Equilibrado Card
    perfilEquilibradoCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      alignItems: 'center',
    },
    perfilEquilibradoEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    perfilEquilibradoTitulo: {
      fontSize: 19,
      fontWeight: 'bold',
      color: COLORS.creamLight,
      marginBottom: 10,
    },
    perfilEquilibradoTexto: {
      fontSize: 15,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    // Botões e outros
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
      padding: 18,
      backgroundColor: COLORS.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    infoText: {
      fontSize: 15,
      color: COLORS.cream,
      lineHeight: 22,
    },
    espacoFinal: {
      height: 48,
    },
    botoesContainer: {
      paddingHorizontal: 24,
      marginBottom: 28,
      gap: 14,
    },
    botaoPDF: {
      backgroundColor: COLORS.vinho || '#6B2D3A',
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    botaoPDFTexto: {
      color: COLORS.creamLight,
      fontSize: 17,
      fontWeight: '600' as const,
    },
    botaoVoltar: {
      backgroundColor: COLORS.accent,
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
    },
    botaoVoltarTexto: {
      color: COLORS.creamLight,
      fontSize: 17,
      fontWeight: '600' as const,
    },
    botaoDisabled: {
      opacity: 0.7,
    },
  });
