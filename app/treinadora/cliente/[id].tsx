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
import { FATORES, FACETAS, FACETAS_DESCRICAO } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';
  import { PROTOCOLOS } from '@/constants/protocolos';
  import { getInterpretacao, type Faixa } from '@/constants/interpretacoes';
  import { recomendarProtocolosTreinadora } from '@/utils/recomendacao';
  import { COLORS } from '@/constants/colors';
  import { gerarPDF } from '@/utils/pdfGenerator';
  import { ProtocoloCard } from '@/components/ProtocoloCard';

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

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  status: string;
  created_at: string;
}

interface Protocolo {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: number;
  motivo?: string;
  faceta?: string;
  facetaNome?: string;
  tipoLabel?: string;
}

export default function TreinadoraClienteResultadoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id: clienteId } = params;

  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  const carregarDados = async () => {
    if (!clienteId) return;

    try {
      // Buscar dados do cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (clienteError || !clienteData) {
        console.error('Erro ao buscar cliente:', clienteError);
        Alert.alert('Erro', 'Cliente não encontrado');
        setLoading(false);
        return;
      }

      setCliente(clienteData);

      // Buscar resultado do cliente
      const { data: resultadoData, error: resultadoError } = await supabase
        .from('resultados')
        .select('*')
        .eq('cliente_id', clienteId)
        .single();

      if (resultadoError || !resultadoData) {
        console.error('Erro ao buscar resultado:', resultadoError);
        // Cliente existe mas ainda não tem resultado (teste não finalizado)
        setLoading(false);
        return;
      }

      setResultado(resultadoData as Resultado);

      // Buscar protocolos recomendados
      const { data: protocolosData, error: protocolosError } = await supabase
        .from('protocolos_recomendados')
        .select('protocolo_id, prioridade')
        .eq('resultado_id', resultadoData.id)
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
              motivo: p.motivo,
              faceta: protocolo.faceta,
              facetaNome: protocolo.facetaNome,
              tipoLabel: protocolo.tipoLabel,
            };
          })
          .filter((p): p is Protocolo => p !== null)
          .sort((a, b) => a.prioridade - b.prioridade)
          .slice(0, 6);

        setProtocolos(protocolosFormatados);
      } else if (resultadoData.scores_facetas && resultadoData.scores_facetas.length > 0) {
        const protocolosFallback = recomendarProtocolosTreinadora(resultadoData.scores_facetas)
          .slice(0, 6)
          .map((rec, index) => ({
            id: rec.protocolo.codigo,
            titulo: rec.protocolo.titulo,
            descricao: rec.protocolo.descricao,
            prioridade: index + 1,
            motivo: rec.motivo,
            faceta: rec.protocolo.faceta,
            facetaNome: rec.protocolo.facetaNome,
            tipoLabel: rec.protocolo.tipoLabel,
          }));

        setProtocolos(protocolosFallback);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleGerarPDF = async () => {
    if (!cliente || !resultado) return;
    
    setGerandoPDF(true);
    try {
      await gerarPDF({
        cliente: {
          nome: cliente.nome,
          email: cliente.email,
        },
        resultado: {
          scores_fatores: resultado.scores_fatores,
          scores_facetas: resultado.scores_facetas,
        },
        protocolos: protocolos,
        dataTeste: new Date(cliente.created_at).toLocaleDateString('pt-BR'),
        tipo: 'treinadora',
      });
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cliente não encontrado</Text>
        <TouchableOpacity onPress={handleVoltar} style={styles.voltarButton}>
          <Text style={styles.voltarButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se cliente existe mas não tem resultado ainda
  if (!resultado) {
    return (
      <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.clienteNome}>{cliente.nome}</Text>
            <Text style={styles.statusText}>Status: {cliente.status}</Text>
            
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⏳</Text>
              <Text style={styles.emptyTitle}>Teste em andamento</Text>
              <Text style={styles.emptyText}>
                O cliente ainda não finalizou o teste. {'\n'}
                Volte mais tarde para ver os resultados.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
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

  const fatorDestaque = [...scoresFatores]
    .sort((a, b) => Math.abs(b.percentil - 50) - Math.abs(a.percentil - 50))[0];

  const interpretacaoDestaque = fatorDestaque
    ? getInterpretacao(fatorDestaque.fator, classificarParaFaixa(fatorDestaque.classificacao))
    : null;

  return (
    <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          </View>

          {/* Info do Cliente */}
          <View style={styles.clienteInfo}>
            <Text style={styles.clienteNome}>{cliente.nome}</Text>
            {cliente.email && (
              <Text style={styles.clienteEmail}>{cliente.email}</Text>
            )}
            <Text style={styles.dataText}>
              Teste realizado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          {/* Mandala */}
          <View style={styles.mandalaContainer}>
            <Text style={styles.sectionTitleVisual}>Visualização do Perfil</Text>
            <Mandala
              scores={scoresFatores.map(sf => ({
                fator: sf.fator,
                percentil: sf.percentil,
              }))}
              size={300}
            />
          </View>

          {/* Fatores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5 Fatores Principais</Text>
            
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
                  <View style={styles.fatorFooter}>
                    <Text style={styles.percentilText}>
                      Percentil: {scoreFator.percentil}
                    </Text>
                    <Text style={styles.scoreText}>
                      Score: {Math.round(scoreFator.score)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {interpretacaoDestaque && fatorDestaque && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interpretação Principal</Text>
              <Text style={styles.sectionSubtitle}>
                Destaque em {FATORES[fatorDestaque.fator]}
              </Text>

              <View style={styles.interpretacaoCard}>
                <Text style={styles.interpretacaoTitulo}>{interpretacaoDestaque.titulo}</Text>
                <Text style={styles.interpretacaoSubtitulo}>{interpretacaoDestaque.subtitulo}</Text>
                <Text style={styles.interpretacaoDescricao}>{interpretacaoDestaque.descricao}</Text>
              </View>
            </View>
          )}

          {/* Facetas (se disponíveis) */}
          {resultado.scores_facetas && resultado.scores_facetas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>30 Facetas Detalhadas</Text>
              
              {resultado.scores_facetas.map((faceta) => {
                const nomeFaceta = FACETAS[faceta.faceta as keyof typeof FACETAS];
                const descricaoFaceta = FACETAS_DESCRICAO[faceta.faceta as keyof typeof FACETAS_DESCRICAO];
                
                return (
                  <View key={faceta.faceta} style={styles.facetaCard}>
                    <View style={styles.facetaHeader}>
                      <Text style={styles.facetaNome}>
                        {faceta.faceta} - {nomeFaceta}
                      </Text>
                      <Text style={styles.facetaClassificacao}>
                        {faceta.classificacao}
                      </Text>
                    </View>
                    <View style={styles.percentilBarSmall}>
                      <View
                        style={[
                          styles.percentilFillSmall,
                          { width: `${faceta.percentil}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.facetaFooter}>
                      <Text style={styles.facetaPercentil}>
                        Percentil: {faceta.percentil}º
                      </Text>
                      <Text style={styles.facetaScore}>
                        Score: {faceta.score}/20
                      </Text>
                    </View>
                    {descricaoFaceta && (
                      <Text style={styles.facetaDescricao}>
                        {descricaoFaceta}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Protocolos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Protocolos Recomendados</Text>
            <Text style={styles.sectionSubtitle}>
              Prioridade para desenvolvimento:
            </Text>
            <Text style={styles.protocoloHint}>Toque no protocolo para ler completo</Text>
            
            {protocolos.length > 0 ? (
              protocolos.map((protocolo, index) => {
                const protocoloCompleto = PROTOCOLOS[protocolo.id as keyof typeof PROTOCOLOS];
                if (!protocoloCompleto) return null;

                const prioridade = index < 3 ? 'alta' : 'media';

                return (
                  <View key={protocolo.id} style={styles.protocoloWrapper}>
                    {/* Badge da Faceta e Tipo */}
                    {(protocolo.faceta || protocolo.facetaNome) && (
                      <View style={styles.facetaBadge}>
                        <Text style={styles.facetaBadgeText}>
                          {protocolo.faceta && protocolo.facetaNome
                            ? `${protocolo.faceta} - ${protocolo.facetaNome}`
                            : protocolo.faceta || protocolo.facetaNome}
                          {protocolo.tipoLabel ? `  •  ${protocolo.tipoLabel}` : ''}
                        </Text>
                      </View>
                    )}
                    
                    {/* Motivo da Recomendação */}
                    {protocolo.motivo && (
                      <View style={styles.motivoContainer}>
                        <Text style={styles.motivoIcon}>💡</Text>
                        <Text style={styles.motivoText}>{protocolo.motivo}</Text>
                      </View>
                    )}
                    
                    <ProtocoloCard
                      protocolo={protocoloCompleto}
                      index={index}
                      prioridade={prioridade}
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Nenhum protocolo recomendado
                </Text>
              </View>
            )}
          </View>

          {/* Botão Gerar PDF */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.botaoPDF, gerandoPDF && styles.botaoDisabled]}
              onPress={handleGerarPDF}
              disabled={gerandoPDF}
              activeOpacity={0.8}
            >
              {gerandoPDF ? (
                <ActivityIndicator size="small" color={COLORS.creamLight} />
              ) : (
                <Text style={styles.botaoPDFTexto}>📄 Baixar Relatório Completo PDF</Text>
              )}
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
  scrollView: {
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
    marginBottom: 16,
  },
  voltarButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  voltarButtonText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.creamLight,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.dark1,
    fontWeight: '600',
  },
  clienteInfo: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  clienteNome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 4,
  },
  clienteEmail: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
    marginBottom: 4,
  },
  dataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 4,
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
  sectionTitleVisual: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 16,
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
  protocoloHint: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 12,
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
    height: 10,
    backgroundColor: 'rgba(245, 230, 211, 0.15)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  percentilFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  fatorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentilText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scoreText: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
  },
  facetaCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  facetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facetaCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.cream,
  },
  facetaNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.cream,
    flex: 1,
    marginRight: 8,
  },
  facetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  facetaScore: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  facetaDescricao: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  facetaClassificacao: {
    fontSize: 12,
    color: COLORS.accent,
  },
  percentilBarSmall: {
    height: 6,
    backgroundColor: 'rgba(245, 230, 211, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  percentilFillSmall: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  facetaPercentil: {
    fontSize: 12,
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
    backgroundColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  protocoloNumeroContainerHighPriority: {
    backgroundColor: COLORS.accent,
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
  interpretacaoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  interpretacaoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.creamLight,
    marginBottom: 4,
  },
  interpretacaoSubtitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 10,
  },
  interpretacaoDescricao: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  espacoFinal: {
    height: 40,
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
    fontWeight: '600',
  },
  botaoDisabled: {
    opacity: 0.7,
  },
  protocoloWrapper: {
    marginBottom: 16,
  },
  facetaBadge: {
    backgroundColor: 'rgba(196, 90, 61, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(196, 90, 61, 0.4)',
  },
  facetaBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  motivoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 230, 211, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  motivoIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  motivoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.9,
    lineHeight: 20,
  },
});
