/**
 * Dashboard Overview - Página inicial do painel administrativo
 * Cards com estatísticas reais do sistema
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS_ARTIO } from '@/constants/colors-artio';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// Cores específicas do admin
const ADMIN_COLORS = {
  background: '#2D1518',
  sidebar: '#1A0C0E',
  card: 'rgba(255, 255, 255, 0.05)',
  accent: '#C45A3D',
  text: '#F5F0E6',
  textMuted: 'rgba(245, 240, 230, 0.6)',
  border: 'rgba(245, 240, 230, 0.1)',
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#4A6FA5',
};

// Stats config (valores dinâmicos do hook)
const STATS_CONFIG = [
  { 
    id: 'treinadoras', 
    label: 'Treinadoras', 
    key: 'totalTreinadoras',
    change: 'cadastradas',
    icon: '◎',
    color: ADMIN_COLORS.accent 
  },
  { 
    id: 'codigos', 
    label: 'Códigos Totais', 
    key: 'totalCodigos',
    change: 'no sistema',
    icon: '◉',
    color: ADMIN_COLORS.success 
  },
  { 
    id: 'clientes', 
    label: 'Clientes', 
    key: 'totalClientes',
    change: 'registrados',
    icon: '◐',
    color: ADMIN_COLORS.info 
  },
  { 
    id: 'completos', 
    label: 'Testes Completos', 
    key: 'totalClientesCompletos',
    change: 'finalizados',
    icon: '◈',
    color: ADMIN_COLORS.warning 
  },
];

// Ações rápidas
const QUICK_ACTIONS = [
  { id: 'add-treinadora', label: 'Nova Treinadora', icon: '+' },
  { id: 'add-codigo', label: 'Gerar Códigos', icon: '⚡' },
  { id: 'relatorio', label: 'Relatórios', icon: '◎' },
];

// Componente de card de estatística
function StatCard({ stat }: { stat: typeof STATS[0] }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
        <Text style={[styles.statIcon, { color: stat.color }]}>{stat.icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
      <View style={styles.statChangeContainer}>
        <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
      </View>
    </View>
  );
}

// Componente de ação rápida
function QuickActionButton({ action, onPress }: { action: typeof QUICK_ACTIONS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.actionIcon}>{action.icon}</Text>
      <Text style={styles.actionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardOverviewScreen() {
  const router = useRouter();
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  // Helper para formatar valores
  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '—';
    return value.toLocaleString('pt-BR');
  };

  // Handler para ações rápidas
  const handleQuickAction = (id: string, router: ReturnType<typeof useRouter>) => {
    switch (id) {
      case 'add-treinadora':
        router.push('/(admin)/(dashboard)/treinadoras');
        break;
      case 'add-codigo':
        router.push('/(admin)/(dashboard)/codigos');
        break;
      case 'relatorio':
        router.push('/(admin)/(dashboard)/relatorios');
        break;
    }
  };

  // Monta os stats com dados reais
  const statsData = STATS_CONFIG.map(stat => ({
    ...stat,
    value: formatValue(stats?.[stat.key as keyof typeof stats]),
  }));

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={ADMIN_COLORS.accent}
          colors={[ADMIN_COLORS.accent]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Visão geral do sistema • {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      {/* Cards de estatísticas */}
      {isLoading && !stats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.accent} />
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar dados</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </View>
      )}

      {/* Ações rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionButton 
              key={action.id} 
              action={action} 
              onPress={() => handleQuickAction(action.id, router)}
            />
          ))}
        </View>
      </View>

      {/* Gráfico de Códigos - Dados Reais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade Recentes</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Códigos Gerados vs Utilizados</Text>
            <TouchableOpacity style={styles.chartFilter}>
              <Text style={styles.chartFilterText}>Últimos 30 dias ▼</Text>
            </TouchableOpacity>
          </View>
          
          {/* Gráfico de Barras Horizontais com dados reais */}
          <View style={styles.barChartContainer}>
            {isLoading || !stats ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
                <Text style={styles.chartLoadingText}>Carregando dados...</Text>
              </View>
            ) : (
              <>
                {/* Barra: Total Gerados */}
                <View style={styles.barRow}>
                  <View style={styles.barLabelContainer}>
                    <View style={[styles.barLegendDot, { backgroundColor: ADMIN_COLORS.accent }]} />
                    <Text style={styles.barLabel}>Gerados</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          backgroundColor: ADMIN_COLORS.accent,
                          width: `${Math.min(((stats?.totalCodigos || 0) / Math.max(stats?.totalCodigos || 1, 1)) * 100, 100)}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{stats?.totalCodigos || 0}</Text>
                </View>

                {/* Barra: Utilizados */}
                <View style={styles.barRow}>
                  <View style={styles.barLabelContainer}>
                    <View style={[styles.barLegendDot, { backgroundColor: ADMIN_COLORS.success }]} />
                    <Text style={styles.barLabel}>Utilizados</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          backgroundColor: ADMIN_COLORS.success,
                          width: `${Math.min(((stats?.totalCodigosUsados || 0) / Math.max(stats?.totalCodigos || 1, 1)) * 100, 100)}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{stats?.totalCodigosUsados || 0}</Text>
                </View>

                {/* Barra: Ativos */}
                <View style={styles.barRow}>
                  <View style={styles.barLabelContainer}>
                    <View style={[styles.barLegendDot, { backgroundColor: ADMIN_COLORS.info }]} />
                    <Text style={styles.barLabel}>Ativos</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          backgroundColor: ADMIN_COLORS.info,
                          width: `${Math.min(((stats?.codigosAtivos || 0) / Math.max(stats?.totalCodigos || 1, 1)) * 100, 100)}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barValue}>{stats?.codigosAtivos || 0}</Text>
                </View>

                {/* Legenda resumida */}
                <View style={styles.barChartLegend}>
                  <Text style={styles.barChartLegendText}>
                    {stats?.totalCodigosUsados || 0} utilizados / {stats?.totalCodigos || 0} gerados
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Atividades recentes placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas Atividades</Text>
        <View style={styles.activityCard}>
          {[
            { action: 'Nova treinadora cadastrada', user: 'Maria Silva', time: '2 min atrás' },
            { action: 'Códigos gerados em lote', user: 'Sistema', time: '15 min atrás' },
            { action: 'Compra confirmada Hotmart', user: 'João Santos', time: '1 hora atrás' },
            { action: 'Código ativado', user: 'Ana Costa', time: '3 horas atrás' },
            { action: 'Relatório exportado', user: 'Admin', time: '5 horas atrás' },
          ].map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{item.action}</Text>
                <Text style={styles.activityMeta}>{item.user} • {item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
    ...Platform.select({
      web: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      },
    }),
  },
  statCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 240,
    ...Platform.select({
      web: {
        flex: 'unset',
        minWidth: 'unset',
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  statChangeContainer: {
    alignSelf: 'flex-start',
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 160,
  },
  actionIcon: {
    fontSize: 16,
    color: ADMIN_COLORS.accent,
    marginRight: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
  },
  chartCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  chartFilter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  chartFilterText: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  barChartContainer: {
    paddingVertical: 8,
  },
  chartLoadingContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  barLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  barLabel: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barValue: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
    textAlign: 'right',
  },
  barChartLegend: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
    alignItems: 'center',
  },
  barChartLegendText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  activityCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ADMIN_COLORS.accent,
    marginRight: 12,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  footer: {
    height: 40,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS_ARTIO.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ADMIN_COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
});
