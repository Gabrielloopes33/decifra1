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
    RefreshControl,
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import * as Clipboard from 'expo-clipboard';
  import { useAuth } from '@/lib/supabase/useAuth';
  import { supabase } from '@/lib/supabase/client';
  import { COLORS } from '@/constants/colors';
  import { useMeusCodigos } from '@/hooks/useMeusCodigos';

  interface Treinadora {
    id: string;
    nome: string;
    email: string;
  }

  interface Cliente {
    id: string;
    nome: string;
    status: 'ativo' | 'em_andamento' | 'completo';
    created_at: string;
    codigo?: string;
  }

  export default function TreinadoraDashboardScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    
    const [treinadora, setTreinadora] = useState<Treinadora | null>(null);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gerandoCodigo, setGerandoCodigo] = useState(false);
    const [ultimoCodigoGerado, setUltimoCodigoGerado] = useState<string | null>(null);
    const [ultimoCodigoValidoAte, setUltimoCodigoValidoAte] = useState<string | null>(null);
    const [codigoGeradoCopiado, setCodigoGeradoCopiado] = useState(false);
    const { data: meusCodigosData, refetch: refetchMeusCodigos } = useMeusCodigos(treinadora?.id);

    const copyToClipboard = async (text: string): Promise<boolean> => {
      try {
        await Clipboard.setStringAsync(text);
        return true;
      } catch (error) {
        console.warn('Erro ao copiar codigo:', error);
        return false;
      }
    };

    const carregarDados = useCallback(async () => {
      if (!user) return;

      try {
        // Primeiro tentar buscar treinadora existente
        const { data: treinadoraData, error: treinadoraError } = await supabase
          .from('treinadoras')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (treinadoraData) {
          // Treinadora encontrada
          setTreinadora(treinadoraData);
        } else if (treinadoraError?.code === 'PGRST116') {
          // Não encontrada, verificar se já existe por email
          const { data: existingByEmail } = await supabase
            .from('treinadoras')
            .select('*')
            .eq('email', user.email)
            .single();

          if (existingByEmail) {
            // Treinadora existe mas com auth_user_id diferente, atualizar
            const { data: updatedTreinadora, error: updateError } = await supabase
              .from('treinadoras')
              .update({ auth_user_id: user.id })
              .eq('id', existingByEmail.id)
              .select()
              .single();

            if (updateError) {
              console.error('Erro ao atualizar treinadora:', updateError);
            } else {
              setTreinadora(updatedTreinadora);
            }
          } else {
            // Criar nova treinadora
            console.log('Criando treinadora automaticamente...');
            
            const { data: novaTreinadora, error: criarError } = await supabase
              .from('treinadoras')
              .insert({
                email: user.email || '',
                nome: user.email?.split('@')[0] || 'Treinadora',
                auth_user_id: user.id,
              })
              .select()
              .single();

            if (criarError) {
              // Se der erro de duplicado, tentar buscar novamente
              if (criarError.code === '23505') {
                const { data: retryData } = await supabase
                  .from('treinadoras')
                  .select('*')
                  .eq('email', user.email)
                  .single();
                
                if (retryData) {
                  setTreinadora(retryData);
                }
              } else {
                console.error('Erro ao criar treinadora:', criarError);
                Alert.alert('Erro', 'Não foi possível criar seu perfil. Tente novamente.');
              }
              setLoading(false);
              return;
            }

            if (novaTreinadora) {
              setTreinadora(novaTreinadora);
              Alert.alert(
                'Bem-vinda!',
                'Sua conta foi criada com sucesso!'
              );
            }
          }
        } else {
          console.error('Erro ao buscar treinadora:', treinadoraError);
          Alert.alert('Erro', 'Não foi possível carregar seus dados');
          setLoading(false);
          return;
        }

        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select(`
            *,
            codigos:codigos!cliente_id(codigo)
          `)
          .eq('treinadora_id', treinadoraData.id)
          .order('created_at', { ascending: false });

        // Processar dados para incluir código
        const clientesProcessados = clientesData?.map((c: any) => ({
          ...c,
          codigo: c.codigos?.[0]?.codigo || null,
        }));

        if (clientesError) {
          console.error('Erro ao buscar clientes:', clientesError);
        } else {
          setClientes(clientesProcessados || []);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar os dados');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [user]);

    useEffect(() => {
      carregarDados();
    }, [carregarDados]);

    const onRefresh = () => {
      setRefreshing(true);
      carregarDados();
      refetchMeusCodigos();
    };

    const copiarUltimoCodigoGerado = async () => {
      if (!ultimoCodigoGerado) return;

      const success = await copyToClipboard(ultimoCodigoGerado);
      if (success) {
        setCodigoGeradoCopiado(true);
      } else {
        Alert.alert('Erro', 'Nao foi possivel copiar o codigo. Tente novamente.');
      }
    };

    const gerarCodigo = async () => {
      if (!treinadora) return;

      const codigosDisponiveis = meusCodigosData?.total ?? 0;
      if (codigosDisponiveis <= 0) {
        Alert.alert(
          'Sem códigos disponíveis',
          'Você não tem códigos disponíveis. Entre em contato com o administrador para adquirir mais códigos.',
          [{ text: 'OK' }]
        );
        return;
      }

      setGerandoCodigo(true);

      try {
        // PEGA O PRIMEIRO CÓDIGO DISPONÍVEL DA LISTA
        const codigoParaDistribuir = meusCodigosData?.disponiveis[0];
        
        if (!codigoParaDistribuir) {
          Alert.alert('Erro', 'Não foi possível encontrar um código disponível');
          setGerandoCodigo(false);
          return;
        }

        // MARCA O CÓDIGO COMO DISTRIBUÍDO
        const { error: updateError } = await supabase
          .from('codigos')
          .update({ distribuido: true })
          .eq('id', codigoParaDistribuir.id);

        if (updateError) {
          console.error('Erro ao distribuir código:', updateError);
          Alert.alert('Erro', 'Não foi possível resgatar o código');
          setGerandoCodigo(false);
          return;
        }

        // ATUALIZA A LISTA E MOSTRA O CÓDIGO
        await refetchMeusCodigos();
        setUltimoCodigoGerado(codigoParaDistribuir.codigo);
        setUltimoCodigoValidoAte(new Date(codigoParaDistribuir.validoAte).toLocaleDateString('pt-BR'));
        setCodigoGeradoCopiado(false);

        Alert.alert(
          'Código resgatado!',
          `Código: ${codigoParaDistribuir.codigo}\n\nVálido até: ${new Date(codigoParaDistribuir.validoAte).toLocaleDateString('pt-BR')}\n\nUse o cartão abaixo para copiar e compartilhar com seu cliente.`,
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        console.error('Erro ao resgatar código:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao resgatar o código');
      } finally {
        setGerandoCodigo(false);
      }
    };

    const handleLogout = async () => {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              router.replace('/');
            },
          },
        ]
      );
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      );
    }

    if (!treinadora) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar dados</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.button}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const statusColors = {
      ativo: COLORS.warning,
      em_andamento: COLORS.accentGlow,
      completo: COLORS.success,
    };

    const statusLabels = {
      ativo: 'Código Ativo',
      em_andamento: 'Em Andamento',
      completo: 'Completo',
    };

    const codigosAtivos = meusCodigosData?.total ?? 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Olá, {treinadora.nome}!</Text>
            <Text style={styles.headerSubtitle}>{treinadora.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          <View style={styles.creditCard}>
            <View style={styles.creditInfo}>
              <Text style={styles.creditLabel}>Códigos Disponíveis</Text>
              <Text style={styles.creditValue}>{codigosAtivos}</Text>
            </View>
            <TouchableOpacity
              style={[styles.generateButton, gerandoCodigo && styles.buttonDisabled]}
              onPress={gerarCodigo}
              disabled={gerandoCodigo}
            >
              {gerandoCodigo ? (
                <ActivityIndicator color={COLORS.accent} />
              ) : (
                <Text style={styles.generateButtonText}>Resgatar Código</Text>
              )}
            </TouchableOpacity>
          </View>

          {ultimoCodigoGerado && (
            <View style={styles.codigoGeradoCard}>
              <Text style={styles.codigoGeradoTitle}>Ultimo codigo resgatado</Text>
              <Text style={styles.codigoGeradoValue}>{ultimoCodigoGerado}</Text>
              <Text style={styles.codigoGeradoValidade}>
                Valido ate: {ultimoCodigoValidoAte}
              </Text>

              <TouchableOpacity
                style={[
                  styles.codigoGeradoCopyButton,
                  codigoGeradoCopiado && styles.codigoGeradoCopyButtonSuccess,
                ]}
                onPress={copiarUltimoCodigoGerado}
              >
                <Text style={styles.codigoGeradoCopyButtonText}>
                  {codigoGeradoCopiado ? 'Copiado!' : 'Copiar Codigo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* NOVO: Botão Meus Códigos */}
          <TouchableOpacity
            style={styles.meusCodigosButton}
            onPress={() => router.push('/treinadora/codigos')}
          >
            <View style={styles.meusCodigosContent}>
              <Text style={styles.meusCodigosTitle}>🎟️ Meus Códigos</Text>
              <Text style={styles.meusCodigosSubtitle}>
                {codigosAtivos} ativo{codigosAtivos !== 1 ? 's' : ''} para compartilhar
              </Text>
            </View>
            <Text style={styles.meusCodigosArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Clientes ({clientes.length})</Text>
            
            {clientes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {"Voce ainda nao tem clientes.\nGere um codigo para comecar!"}
                </Text>
              </View>
            ) : (
              clientes.map((cliente) => (
                <TouchableOpacity
                  key={cliente.id}
                  style={styles.clientCard}
                  onPress={() => {
                    router.push(`/treinadora/cliente/${cliente.id}` as any);
                  }}
                >
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{cliente.nome}</Text>
                    <Text style={styles.clientDate}>
                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                    {cliente.codigo && (
                      <Text style={styles.clientCodigo}>
                        🎟️ {cliente.codigo}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[cliente.status] },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {statusLabels[cliente.status]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.dark1,
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: COLORS.dark2,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.cardBorder,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: COLORS.cream,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 4,
    },
    logoutText: {
      fontSize: 16,
      color: COLORS.error,
      fontWeight: '600' as const,
    },
    content: {
      flex: 1,
    },
    creditCard: {
      margin: 24,
      padding: 24,
      backgroundColor: COLORS.accent,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    creditInfo: {
      marginBottom: 16,
    },
    creditLabel: {
      fontSize: 16,
      color: COLORS.creamLight,
      opacity: 0.9,
    },
    creditValue: {
      fontSize: 48,
      fontWeight: 'bold' as const,
      color: COLORS.white,
      marginTop: 8,
    },
    creditSecondaryLabel: {
      marginTop: 6,
      fontSize: 14,
      color: COLORS.creamLight,
      opacity: 0.95,
      fontWeight: '600' as const,
    },
    generateButton: {
      backgroundColor: COLORS.dark1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    generateButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: COLORS.cream,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    codigoGeradoCard: {
      marginHorizontal: 24,
      marginTop: -8,
      marginBottom: 24,
      padding: 20,
      backgroundColor: COLORS.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    codigoGeradoTitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: 8,
      fontWeight: '600' as const,
    },
    codigoGeradoValue: {
      fontSize: 22,
      color: COLORS.accent,
      fontWeight: 'bold' as const,
      letterSpacing: 1,
      marginBottom: 8,
      fontFamily: 'monospace',
    },
    codigoGeradoValidade: {
      fontSize: 13,
      color: COLORS.textMuted,
      marginBottom: 14,
    },
    codigoGeradoCopyButton: {
      backgroundColor: COLORS.dark2,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    codigoGeradoCopyButtonSuccess: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
    },
    codigoGeradoCopyButtonText: {
      color: COLORS.cream,
      fontSize: 15,
      fontWeight: '700' as const,
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: COLORS.cream,
      marginBottom: 16,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    emptyStateText: {
      fontSize: 16,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    clientCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: COLORS.cream,
    },
    clientDate: {
      fontSize: 14,
      color: COLORS.textMuted,
      marginTop: 4,
    },
    clientCodigo: {
      fontSize: 12,
      color: COLORS.accent,
      marginTop: 4,
      fontFamily: 'monospace',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: COLORS.white,
    },
    button: {
      backgroundColor: COLORS.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      color: COLORS.cream,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    meusCodigosButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 24,
      marginTop: -8,
      marginBottom: 24,
      padding: 20,
      backgroundColor: COLORS.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    meusCodigosContent: {
      flex: 1,
    },
    meusCodigosTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: COLORS.cream,
      marginBottom: 4,
    },
    meusCodigosSubtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    meusCodigosArrow: {
      fontSize: 24,
      color: COLORS.accent,
      marginLeft: 8,
    },
  });
