import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/supabase/useAuth';
import { supabase } from '@/lib/supabase/client';
import { COLORS_ARTIO, GRADIENTS } from '@/constants/colors-artio';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// Interface para os códigos disponíveis
interface CodigoDisponivel {
  id: string;
  codigo: string;
  validoAte: string;
  diasRestantes: number;
}

// Helper para copiar usando expo-clipboard
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.warn('Erro ao copiar:', error);
    return false;
  }
};

export default function MeusCodigosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [codigos, setCodigos] = useState<CodigoDisponivel[]>([]);
  const [treinadoraId, setTreinadoraId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  // Buscar treinadora ID
  useEffect(() => {
    const buscarTreinadora = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('treinadoras')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar treinadora:', error);
          return;
        }
        
        if (data) {
          setTreinadoraId(data.id);
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };
    
    buscarTreinadora();
  }, [user]);

  // Buscar códigos disponíveis
  const carregarCodigos = useCallback(async () => {
    if (!treinadoraId) return;

    try {
      const { data, error } = await supabase
        .from('codigos')
        .select('id, codigo, valido_ate')
        .eq('treinadora_id', treinadoraId)
        .eq('usado', false)
        .gt('valido_ate', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const disponiveis = data?.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        validoAte: c.valido_ate,
        diasRestantes: Math.ceil(
          (new Date(c.valido_ate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })) || [];

      setCodigos(disponiveis);
    } catch (error) {
      console.error('Erro ao carregar códigos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus códigos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [treinadoraId]);

  useEffect(() => {
    carregarCodigos();
  }, [carregarCodigos]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarCodigos();
  };

  const copiarCodigo = async (codigo: string) => {
    const success = await copyToClipboard(codigo);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 2000);
    } else {
      // Fallback: mostra o código em um Alert
      Alert.alert(
        '📋 Código para Copiar',
        `Código: ${codigo}`,
        [{ text: 'OK' }]
      );
    }
  };

  const copiarTodos = async () => {
    if (codigos.length === 0) return;
    
    const todos = codigos.map((c) => c.codigo).join('\n');
    const success = await copyToClipboard(todos);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Copiado!', `${codigos.length} códigos copiados para a área de transferência`);
    } else {
      Alert.alert(
        '📋 Códigos para Copiar',
        `Seus códigos:\n\n${todos}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getValidadeText = (diasRestantes: number): string => {
    if (diasRestantes <= 0) return 'Vence hoje';
    if (diasRestantes === 1) return 'Vence amanhã';
    return `Vence em ${diasRestantes} dias`;
  };

  const getValidadeColor = (diasRestantes: number) => {
    if (diasRestantes <= 3) return COLORS_ARTIO.error;
    if (diasRestantes <= 7) return COLORS_ARTIO.warning;
    return COLORS_ARTIO.cream;
  };

  if (isLoading) {
    return (
      <LinearGradient colors={[...GRADIENTS.primary]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS_ARTIO.creamLight} />
            <Text style={styles.loadingText}>Carregando seus códigos...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...GRADIENTS.primary]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS_ARTIO.creamLight} />
            </TouchableOpacity>
            <Text style={styles.title}>Meus Códigos</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.subtitle}>
            Você tem {codigos.length} código{codigos.length !== 1 ? 's' : ''} disponível
          </Text>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS_ARTIO.creamLight}
              colors={[COLORS_ARTIO.creamLight]}
            />
          }
        >
          {/* Lista de Códigos */}
          {codigos.map((item) => (
            <View key={item.id} style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <View style={styles.codeIconContainer}>
                  <Ionicons name="ticket" size={20} color={COLORS_ARTIO.terracotaLight} />
                </View>
                <Text style={styles.codeText}>{item.codigo}</Text>
                {copiado === item.codigo && (
                  <View style={styles.copiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS_ARTIO.success} />
                    <Text style={styles.copiedText}>Copiado</Text>
                  </View>
                )}
              </View>

              <View style={styles.codeInfo}>
                <View style={styles.validadeContainer}>
                  <Ionicons 
                    name={item.diasRestantes <= 7 ? "alert-circle" : "time-outline"} 
                    size={16} 
                    color={getValidadeColor(item.diasRestantes)} 
                  />
                  <Text
                    style={[
                      styles.validade,
                      { color: getValidadeColor(item.diasRestantes) },
                      item.diasRestantes <= 7 && styles.validadeUrgente,
                    ]}
                  >
                    {getValidadeText(item.diasRestantes)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.copyButton,
                  copiado === item.codigo && styles.copyButtonSuccess,
                ]}
                onPress={() => copiarCodigo(item.codigo)}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={copiado === item.codigo ? "checkmark" : "copy-outline"} 
                  size={18} 
                  color={COLORS_ARTIO.creamLight} 
                  style={styles.copyIcon}
                />
                <Text style={styles.copyButtonText}>
                  {copiado === item.codigo ? 'Copiado!' : 'Copiar Código'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Empty State */}
          {codigos.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="ticket-outline" size={48} color={COLORS_ARTIO.terracotaLight} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum código disponível</Text>
              <Text style={styles.emptyText}>
                Compre mais códigos na Hotmart para continuar avaliando suas clientes.
              </Text>
              <TouchableOpacity
                style={styles.comprarButton}
                onPress={() => {
                  // Navegar para loja Hotmart ou mostrar instruções
                  Alert.alert(
                    'Comprar Códigos',
                    'Acesse nossa página na Hotmart para adquirir mais códigos DECIFRA.',
                    [
                      { text: 'OK', style: 'default' },
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.comprarButtonText}>Comprar na Hotmart</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão Copiar Todos */}
          {codigos.length > 1 && (
            <TouchableOpacity
              style={styles.copyAllButton}
              onPress={copiarTodos}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="copy" 
                size={20} 
                color={COLORS_ARTIO.terracotaLight} 
                style={styles.copyAllIcon}
              />
              <Text style={styles.copyAllText}>
                Copiar Todos ({codigos.length})
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={COLORS_ARTIO.cream} 
              style={styles.footerIcon}
            />
            <Text style={styles.footerText}>
              Envie um código para cada cliente.{'\n'}
              Cada código só pode ser usado uma vez.
            </Text>
          </View>
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
  },
  loadingText: {
    color: COLORS_ARTIO.cream,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    opacity: 0.9,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS_ARTIO.creamLight,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS_ARTIO.cream,
    opacity: 0.9,
    textAlign: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  codeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 90, 61, 0.3)',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  codeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196, 90, 61, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS_ARTIO.creamLight,
    letterSpacing: 1.5,
    flex: 1,
  },
  copiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  copiedText: {
    color: COLORS_ARTIO.success,
    fontSize: 12,
    fontWeight: '600',
  },
  codeInfo: {
    marginBottom: 16,
  },
  validadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validade: {
    fontSize: 14,
    opacity: 0.8,
  },
  validadeUrgente: {
    fontWeight: '600',
  },

  copyButton: {
    backgroundColor: COLORS_ARTIO.terracota,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  copyButtonSuccess: {
    backgroundColor: COLORS_ARTIO.success,
  },
  copyIcon: {
    marginRight: 4,
  },
  copyButtonText: {
    color: COLORS_ARTIO.creamLight,
    fontSize: 16,
    fontWeight: '600',
  },

  copyAllButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS_ARTIO.terracota,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  copyAllIcon: {
    marginRight: 4,
  },
  copyAllText: {
    color: COLORS_ARTIO.terracotaLight,
    fontSize: 16,
    fontWeight: '600',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(196, 90, 61, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS_ARTIO.creamLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS_ARTIO.cream,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  comprarButton: {
    backgroundColor: COLORS_ARTIO.terracota,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  comprarButtonText: {
    color: COLORS_ARTIO.creamLight,
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    paddingVertical: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerIcon: {
    opacity: 0.7,
  },
  footerText: {
    fontSize: 14,
    color: COLORS_ARTIO.cream,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});
