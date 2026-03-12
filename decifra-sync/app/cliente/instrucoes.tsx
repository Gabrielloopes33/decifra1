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
                Voce respondera 120 questoes divididas em 4 estacoes tematicas. Cada estacao contem 30 questoes.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Duracao</Text>
              <Text style={styles.text}>
                O teste leva cerca de 15-20 minutos para ser concluido. Nao ha tempo limite, responda com calma.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Instrucoes</Text>
              <Text style={styles.text}>
                {"- Responda com honestidade\n- Nao ha respostas certas ou erradas\n- Use a escala de 1 a 5:\n\n1 = Discordo totalmente\n2 = Discordo\n3 = Neutro\n4 = Concordo\n5 = Concordo totalmente"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>As 4 Estacoes</Text>
              <Text style={styles.text}>
                {"1. Autoconhecimento (30 questoes)\n2. Relacionamentos (30 questoes)\n3. Realizacoes (30 questoes)\n4. Equilibrio (30 questoes)"}
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleIniciar}>
              <LinearGradient
                colors={[...COLORS.gradientButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Comecar Teste</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footer}>
              Suas respostas sao salvas automaticamente apos cada estacao
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
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.creamLight,
    marginBottom: 32,
    textAlign: 'center' as const,
    lineHeight: 36,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.accent,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: COLORS.cream,
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center' as const,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.creamLight,
  },
  footer: {
    fontSize: 13,
    color: COLORS.cream,
    textAlign: 'center' as const,
    marginTop: 24,
    opacity: 0.9,
    lineHeight: 20,
  },
});
