import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase/client';
import { COLORS } from '@/constants/colors';

type InputState = 'default' | 'valid' | 'invalid';

export default function ClienteCodigoScreen() {
  const router = useRouter();
  
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputState, setInputState] = useState<InputState>('default');
  
  // Animação shake
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const formatarCodigo = (text: string) => {
    // Remove caracteres especiais e converte para maiúsculo
    let formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Adiciona hífens no formato DECF-XXXX-XXXX
    if (formatted.length > 4) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    }
    if (formatted.length > 9) {
      formatted = formatted.slice(0, 9) + '-' + formatted.slice(9);
    }
    
    // Limita ao tamanho máximo (DECF-XXXX-XXXX = 14 caracteres)
    if (formatted.length > 14) {
      formatted = formatted.slice(0, 14);
    }
    
    // Validação visual básica
    if (formatted.length === 14 && formatted.match(/^DECF-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      setInputState('valid');
    } else if (formatted.length === 14) {
      setInputState('invalid');
    } else {
      setInputState('default');
    }
    
    return formatted;
  };

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validarCodigo = async () => {
    // Validação do formato DECF-XXXX-XXXX
    if (!codigo || !codigo.match(/^DECF-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      shake();
      setInputState('invalid');
      Alert.alert('Código inválido', 'Por favor, insira um código no formato DECF-XXXX-XXXX');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data: codigoData, error: codigoError } = await supabase
        .from('codigos')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (codigoError || !codigoData) {
        shake();
        setInputState('invalid');
        Alert.alert('Código inválido', 'O código informado não existe.');
        setLoading(false);
        return;
      }

      if (codigoData.usado) {
        // Código já utilizado - verificar se tem resultado para redirecionar
        if (!codigoData.cliente_id) {
          shake();
          setInputState('invalid');
          Alert.alert('Código já utilizado', 'Este código já foi usado, mas não foi possível encontrar os dados do cliente.');
          setLoading(false);
          return;
        }

        // Buscar resultado do cliente
        const { data: resultadoData, error: resultadoError } = await supabase
          .from('resultados')
          .select('id')
          .eq('cliente_id', codigoData.cliente_id)
          .single();

        if (resultadoError || !resultadoData) {
          // Código usado mas sem resultado (teste em andamento)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(
            'Teste em andamento',
            'Este código já foi utilizado, mas o teste ainda não foi concluído. Entre em contato com sua treinadora para mais informações.'
          );
          setLoading(false);
          return;
        }

        // Código usado com resultado disponível - redirecionar para resultado
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setInputState('valid');
        
        Alert.alert(
          'Código já utilizado',
          'Redirecionando para seu resultado...',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push({
                  pathname: '/cliente/resultado',
                  params: {
                    clienteId: codigoData.cliente_id,
                    resultadoId: resultadoData.id,
                  },
                });
              },
            },
          ]
        );
        setLoading(false);
        return;
      }

      const validoAte = new Date(codigoData.valido_ate);
      if (validoAte < new Date()) {
        shake();
        setInputState('invalid');
        Alert.alert('Código expirado', 'Este código expirou. Solicite um novo código à sua treinadora.');
        setLoading(false);
        return;
      }

      // Verificação extra: mesmo que usado=false, checar se já existe cliente/resultado para esse código
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('codigo_id', codigoData.id)
        .maybeSingle();

      if (clienteExistente) {
        const { data: resultadoExistente } = await supabase
          .from('resultados')
          .select('id')
          .eq('cliente_id', clienteExistente.id)
          .maybeSingle();

        if (resultadoExistente) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setInputState('valid');
          router.push({
            pathname: '/cliente/resultado',
            params: {
              clienteId: clienteExistente.id,
              resultadoId: resultadoExistente.id,
            },
          });
          setLoading(false);
          return;
        }
      }

      // Código válido!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInputState('valid');
      
      router.push({
        pathname: '/cliente/cadastro',
        params: {
          codigoId: codigoData.id,
          codigo: codigoData.codigo,
          treinadoraId: codigoData.treinadora_id,
        },
      });
    } catch (error: any) {
      console.error('Erro ao validar código:', error);
      shake();
      Alert.alert('Erro', 'Ocorreu um erro ao validar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = () => {
    switch (inputState) {
      case 'valid':
        return COLORS.success;
      case 'invalid':
        return COLORS.error;
      default:
        return COLORS.inputBorder;
    }
  };

  const getInputBackgroundColor = () => {
    switch (inputState) {
      case 'valid':
        return 'rgba(76, 175, 80, 0.1)';
      case 'invalid':
        return 'rgba(255, 82, 82, 0.1)';
      default:
        return COLORS.inputBg;
    }
  };

  return (
    <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Insira o código fornecido pela sua treinadora para iniciar sua jornada de autoconhecimento
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Código de Acesso</Text>
              
              <Animated.View style={[
                styles.inputContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: getInputBorderColor(),
                      backgroundColor: getInputBackgroundColor(),
                    }
                  ]}
                  placeholder="DECF-XXXX-XXXX"
                  placeholderTextColor={COLORS.textMuted}
                  value={codigo}
                  onChangeText={(text) => setCodigo(formatarCodigo(text))}
                  autoCapitalize="characters"
                  maxLength={14}
                  editable={!loading}
                />
                
                {inputState === 'valid' && (
                  <Text style={styles.validationIcon}>✓</Text>
                )}
                {inputState === 'invalid' && (
                  <Text style={[styles.validationIcon, styles.validationIconError]}>✕</Text>
                )}
              </Animated.View>

              <Text style={styles.hint}>
                Formato: DECF-XXXX-XXXX
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || codigo.length < 8) && styles.buttonDisabled
                ]}
                onPress={validarCodigo}
                disabled={loading || codigo.length < 14}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.creamLight} />
                ) : (
                  <LinearGradient
                    colors={[...COLORS.gradientButton]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Continuar</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={loading}
              >
                <Text style={styles.backText}>← Voltar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Sobre o código</Text>
              <Text style={styles.infoText}>
                O código é válido por 30 dias após a geração.{'\n'}
                Cada código pode ser usado apenas uma vez.{'\n'}
                <Text style={{ fontWeight: '600', color: COLORS.accent }}>
                  Você pode usar o mesmo código para acessar seu resultado a qualquer momento.
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.cream,
    opacity: 0.95,
    marginBottom: 44,
    textAlign: 'center',
    lineHeight: 26,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 17,
    color: COLORS.cream,
    marginBottom: 14,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 14,
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    textAlign: 'center',
    letterSpacing: 2,
  },
  validationIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -14,
    fontSize: 22,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  validationIconError: {
    color: COLORS.error,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 28,
    textAlign: 'center',
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  backButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  backText: {
    color: COLORS.cream,
    fontSize: 17,
    opacity: 0.85,
  },
  infoBox: {
    marginTop: 44,
    padding: 22,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
});
