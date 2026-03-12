/**
 * Layout raiz do painel administrativo web
 * Verifica autenticação e redireciona para login se necessário
 */
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS_ARTIO } from '@/constants/colors-artio';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminRootLayout() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inLoginPage = segments[segments.length - 1] === 'login';

    if (!isAuthenticated && !inLoginPage) {
      router.replace('/(admin)/login');
    } else if (isAuthenticated && inLoginPage) {
      router.replace('/(admin)/(dashboard)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS_ARTIO.terracota} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(dashboard)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_ARTIO.vinhoDeep,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
