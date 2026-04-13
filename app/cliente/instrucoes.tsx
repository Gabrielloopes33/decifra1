import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

export default function ClienteInstrucoesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { clienteId } = params;

  const handleIniciar = () => {
    router.push({
      pathname: '/cliente/teste',
      params: {
        clienteId,
        estacao: '1',
      },
    });
  };

  return (
    <LinearGradient colors={[...COLORS.gradient]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {"Teste de Personalidade\nIPIP-NEO-120"}
            </Text>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Como funciona</Text>
              <Text style={styles.text}>
                Você responderá 120 questões divididas em 4 estações temáticas. Cada estação contém 30 questões.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Duração</Text>
              <Text style={styles.text}>
                O teste leva cerca de 15-20 minutos para ser concluído. Não há tempo limite, responda com calma.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Instruções</Text>
              <Text style={styles.text}>
                {"- Responda com honestidade\n- Não há respostas certas ou erradas\n- Use a escala de 1 a 5:\n\n1 = Discordo totalmente\n2 = Discordo\n3 = Neutro\n4 = Concordo\n5 = Concordo totalmente"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>As 4 Estações</Text>
              <Text style={styles.text}>
                {"1. Autoconhecimento (30 questões)\n2. Relacionamentos (30 questões)\n3. Realizações (30 questões)\n4. Equilíbrio (30 questões)"}
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleIniciar}>
              <LinearGradient
                colors={[...COLORS.gradientButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Começar Teste</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footer}>
              Suas respostas são salvas automaticamente após cada estação
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
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 36,
    textAlign: 'center' as const,
    lineHeight: 40,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.accent,
    marginBottom: 14,
  },
  text: {
    fontSize: 17,
    color: COLORS.cream,
    lineHeight: 26,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 28,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center' as const,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.creamLight,
  },
  footer: {
    fontSize: 15,
    color: COLORS.cream,
    textAlign: 'center' as const,
    marginTop: 28,
    opacity: 0.95,
    lineHeight: 22,
  },
});
