/**
 * Layout do dashboard administrativo
 * Sidebar fixa à esquerda com navegação
 */
import { Stack, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS_ARTIO } from '@/constants/colors-artio';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Cores específicas do admin
const ADMIN_COLORS = {
  background: '#2D1518',
  sidebar: '#1A0C0E',
  card: 'rgba(255, 255, 255, 0.05)',
  accent: '#C45A3D',
  text: '#F5F0E6',
  textMuted: 'rgba(245, 240, 230, 0.6)',
  border: 'rgba(245, 240, 230, 0.1)',
  hover: 'rgba(196, 90, 61, 0.15)',
};

// Itens de navegação da sidebar
const MENU_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    path: '/(admin)/(dashboard)',
    icon: '◈'
  },
  { 
    id: 'treinadoras', 
    label: 'Treinadoras', 
    path: '/(admin)/(dashboard)/treinadoras',
    icon: '◎'
  },
  { 
    id: 'codigos', 
    label: 'Códigos', 
    path: '/(admin)/(dashboard)/codigos',
    icon: '◉'
  },
  { 
    id: 'compras', 
    label: 'Compras Hotmart', 
    path: '/(admin)/(dashboard)/compras',
    icon: '◐'
  },
];

// Componente de item de menu
function MenuItem({ 
  item, 
  isActive, 
  onPress 
}: { 
  item: typeof MENU_ITEMS[0]; 
  isActive: boolean; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.menuIcon, isActive && styles.menuIconActive]}>
        {item.icon}
      </Text>
      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
        {item.label}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}

export default function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAdminAuth();

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      router.replace('/(admin)/login');
    }
  };

  // Pega iniciais do nome do usuário
  const getInitials = (name: string | undefined) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.sidebarHeader}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.sidebarTitle}>Admin</Text>
            <Text style={styles.sidebarSubtitle}>DECIFRA</Text>
          </View>
        </View>

        {/* Menu de navegação */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.menuSectionTitle}>Menu Principal</Text>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={pathname === item.path || pathname.startsWith(item.path + '/')}
              onPress={() => router.push(item.path as any)}
            />
          ))}
        </ScrollView>

        {/* Footer da sidebar */}
        <View style={styles.sidebarFooter}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              {isLoading ? (
                <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
              ) : (
                <Text style={styles.userAvatarText}>{getInitials(user?.nome)}</Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.nome || 'Administrador'}</Text>
              <Text style={styles.userRole}>{user?.is_admin ? 'Super Admin' : 'Admin'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Área de conteúdo */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="treinadoras" />
          <Stack.Screen name="codigos" />
          <Stack.Screen name="compras" />
          <Stack.Screen name="relatorios" />
          <Stack.Screen name="configuracoes" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: ADMIN_COLORS.background,
  },
  sidebar: {
    width: 260,
    backgroundColor: ADMIN_COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: ADMIN_COLORS.border,
    paddingVertical: 24,
    ...Platform.select({
      web: {
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      },
    }),
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  sidebarSubtitle: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    letterSpacing: 1,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: ADMIN_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: ADMIN_COLORS.hover,
  },
  menuIcon: {
    fontSize: 16,
    color: ADMIN_COLORS.textMuted,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuIconActive: {
    color: ADMIN_COLORS.accent,
  },
  menuLabel: {
    fontSize: 15,
    color: ADMIN_COLORS.textMuted,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: ADMIN_COLORS.text,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: ADMIN_COLORS.accent,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 90, 61, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.accent,
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.accent,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  userRole: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.textMuted,
  },
  content: {
    flex: 1,
    marginLeft: 260,
    backgroundColor: ADMIN_COLORS.background,
  },
});
