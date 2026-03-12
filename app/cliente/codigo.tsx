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
        Alert.alert('Código inválido', 'O código informado não existe ou já foi utilizado.');
        setLoading(false);
        return;
      }

      if (codigoData.usado) {
        shake();
        setInputState('invalid');
        Alert.alert('Código já utilizado', 'Este código já foi usado por outro cliente.');
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
                Cada código pode ser usado apenas uma vez.
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
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.cream,
    opacity: 0.9,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: COLORS.cream,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    textAlign: 'center',
    letterSpacing: 2,
  },
  validationIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
    fontSize: 20,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  validationIconError: {
    color: COLORS.error,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: COLORS.cream,
    fontSize: 16,
    opacity: 0.8,
  },
  infoBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
