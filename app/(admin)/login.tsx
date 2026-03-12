/**
 * Tela de login do painel administrativo
 * Design clean com identidade visual Ártio
 */
import { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS_ARTIO, GRADIENTS } from '@/constants/colors-artio';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Cores específicas do admin
const ADMIN_COLORS = {
  background: '#2D1518',
  sidebar: '#1A0C0E',
  card: 'rgba(255, 255, 255, 0.05)',
  accent: '#C45A3D',
  text: '#F5F0E6',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(245, 240, 230, 0.15)',
};

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Ref para o campo de senha (para focar ao pressionar Enter no email)
  const passwordRef = useRef<TextInput>(null);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(admin)/(dashboard)');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    const { success, error } = await login(email, password);
    
    setLoading(false);
    
    if (!success) {
      Alert.alert('Erro de login', error?.message || 'Não foi possível fazer login');
    }
  };

  return (
    <LinearGradient 
      colors={[ADMIN_COLORS.background, ADMIN_COLORS.sidebar]} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo/Ícone */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>A</Text>
              </View>
            </View>

            <Text style={styles.title}>Área Administrativa</Text>
            <Text style={styles.subtitle}>
              Painel de controle DECIFRA
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin@decifra.com"
                  placeholderTextColor="rgba(245, 240, 230, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(245, 240, 230, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[GRADIENTS.button[0], GRADIENTS.button[1]]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading || authLoading ? (
                    <ActivityIndicator color={ADMIN_COLORS.text} />
                  ) : (
                    <Text style={styles.buttonText}>Entrar no Painel</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>
              © 2025 DECIFRA. Todos os direitos reservados.
            </Text>
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
    paddingHorizontal: 32,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ADMIN_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ADMIN_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(245, 240, 230, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: ADMIN_COLORS.inputBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    color: ADMIN_COLORS.text,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.inputBorder,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: ADMIN_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  forgotPassword: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: 'rgba(245, 240, 230, 0.6)',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: 'rgba(245, 240, 230, 0.4)',
    fontSize: 12,
  },
});
