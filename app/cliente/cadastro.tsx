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
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { supabase } from '@/lib/supabase/client';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { COLORS } from '@/constants/colors';

  export default function ClienteCadastroScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { codigoId, codigo, treinadoraId } = params;
    
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async () => {
      if (!nome.trim()) {
        Alert.alert('Erro', 'Por favor, informe seu nome');
        return;
      }

      const emailValue = email.trim() || null;

      setLoading(true);

      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .insert({
            nome: nome.trim(),
            email: emailValue,
            codigo_id: codigoId,
            treinadora_id: treinadoraId,
            status: 'ativo',
          })
          .select()
          .single();

        if (clienteError || !clienteData) {
          console.error('Erro ao criar cliente:', clienteError);
          Alert.alert('Erro', 'Não foi possível criar seu cadastro');
          setLoading(false);
          return;
        }

        const { error: codigoUpdateError } = await supabase
          .from('codigos')
          .update({
            usado: true,
            cliente_id: clienteData.id,
          })
          .eq('id', codigoId);

        if (codigoUpdateError) {
          console.error('Erro ao atualizar código:', codigoUpdateError);
          Alert.alert('Erro', 'Não foi possível ativar seu código. Tente novamente.');
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('clienteId', clienteData.id);

        router.replace({
          pathname: '/cliente/instrucoes',
          params: {
            clienteId: clienteData.id,
          },
        });
      } catch (error: any) {
        console.error('Erro ao cadastrar cliente:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao criar seu cadastro');
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
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Código: {codigo}</Text>
                </View>

                <Text style={styles.title}>Cadastro Rápido</Text>
                <Text style={styles.subtitle}>
                  Precisamos de algumas informações antes de iniciar o teste
                </Text>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome Completo *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Seu nome"
                      placeholderTextColor={COLORS.textMuted}
                      value={nome}
                      onChangeText={setNome}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="seuemail@exemplo.com"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleCadastro}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.accent} />
                    ) : (
                      <LinearGradient
                        colors={[...COLORS.gradientButton]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>Iniciar Teste</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.privacyBox}>
                  <Text style={styles.privacyText}>
                    Seus dados são privados e serão compartilhados apenas com sua treinadora
                  </Text>
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
    badge: {
      alignSelf: 'center',
      backgroundColor: COLORS.cardBg,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      marginBottom: 28,
    },
    badgeText: {
      fontSize: 15,
      fontWeight: '600',
      color: COLORS.accent,
      letterSpacing: 1,
    },
    title: {
      fontSize: 34,
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
    inputGroup: {
      marginBottom: 22,
    },
    label: {
      fontSize: 15,
      color: COLORS.cream,
      marginBottom: 10,
      fontWeight: '600',
    },
    input: {
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 14,
      fontSize: 17,
      color: COLORS.creamLight,
    },
    button: {
      borderRadius: 14,
      overflow: 'hidden',
      marginTop: 10,
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
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: '600',
      color: COLORS.creamLight,
    },
    privacyBox: {
      marginTop: 36,
      padding: 18,
      backgroundColor: COLORS.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    privacyText: {
      fontSize: 14,
      color: COLORS.cream,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
