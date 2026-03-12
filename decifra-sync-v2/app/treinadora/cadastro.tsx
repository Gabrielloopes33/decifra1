import { useState } from 'react';
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
    ScrollView,
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { useAuth } from '@/lib/supabase/useAuth';
  import { supabase } from '@/lib/supabase/client';
  import { COLORS } from '@/constants/colors';

  export default function TreinadoraCadastroScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async () => {
      if (!nome || !email || !password || !confirmPassword) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await signUp(email, password, nome);
        
        if (error) {
          Alert.alert('Erro ao criar conta', error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { error: dbError } = await supabase
            .from('treinadoras')
            .insert({
              auth_user_id: data.user.id,
              email: email,
              nome: nome,
              creditos: 5,
            });

          if (dbError) {
            console.error('Erro ao criar registro de treinadora:', dbError);
            Alert.alert(
              'Conta criada',
              'Sua conta foi criada com sucesso! Faça login para continuar.'
            );
          } else {
            Alert.alert(
              'Conta criada com sucesso!',
              'Você ganhou 5 créditos de boas-vindas. Faça login para começar.',
              [{ text: 'OK', onPress: () => router.replace('/treinadora/login') }]
            );
          }
        }
      } catch (error: any) {
        Alert.alert('Erro', error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                <Text style={styles.title}>Cadastro Treinadora</Text>
                <Text style={styles.subtitle}>
                  Crie sua conta e ganhe 5 créditos grátis
                </Text>

                <View style={styles.form}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor={COLORS.textMuted}
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Senha (mínimo 6 caracteres)"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password-new"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity
                    style={[styles.buttonWrapper, loading && styles.buttonDisabled]}
                    onPress={handleCadastro}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[...COLORS.gradientButton]}
                      style={styles.button}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <ActivityIndicator color={COLORS.creamLight} />
                      ) : (
                        <Text style={styles.buttonText}>Criar Conta</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.linkContainer}
                  >
                    <Text style={styles.linkText}>
                      Já tem conta? <Text style={styles.linkBold}>Faça login</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    content: {
      width: '100%',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: COLORS.creamLight,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.cream,
      opacity: 0.9,
      marginBottom: 40,
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    input: {
      backgroundColor: COLORS.inputBg,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      fontSize: 16,
      color: COLORS.cream,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
    },
    buttonWrapper: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 8,
      shadowColor: COLORS.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    button: {
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: COLORS.creamLight,
    },
    linkContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    linkText: {
      color: COLORS.cream,
      fontSize: 16,
    },
    linkBold: {
      fontWeight: 'bold' as const,
      color: COLORS.accentGlow,
    },
  });
