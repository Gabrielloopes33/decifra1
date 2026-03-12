/**
 * Configurações - Página de configurações administrativas
 */
import { View, Text, StyleSheet } from 'react-native';

// Cores específicas do admin
const ADMIN_COLORS = {
  background: '#2D1518',
  text: '#F5F0E6',
  textMuted: 'rgba(245, 240, 230, 0.6)',
};

export default function ConfiguracoesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Em breve...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: ADMIN_COLORS.textMuted,
    marginTop: 8,
  },
});
