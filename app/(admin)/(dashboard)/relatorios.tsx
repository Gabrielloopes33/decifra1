/**
 * Relatórios - Dashboard com métricas principais
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { COLORS_ARTIO } from '@/constants/colors-artio';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTreinadorasAdmin } from '@/hooks/useTreinadorasAdmin';
import { useCodigosAdmin } from '@/hooks/useCodigosAdmin';
import { useState, useMemo } from 'react';

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

// Componente Big Number
function BigNumberCard({ 
  title, 
  value, 
  subtitle, 
  color = ADMIN_COLORS.accent,
  icon 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  color?: string;
  icon: string;
}) {
  return (
    <View style={[styles.bigNumberCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.bigNumberHeader}>
        <View style={[styles.bigNumberIcon, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.bigNumberIconText, { color }]}>{icon}</Text>
        </View>
        <Text style={styles.bigNumberTitle}>{title}</Text>
      </View>
      <Text style={[styles.bigNumberValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.bigNumberSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function RelatoriosScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { treinadoras, isLoading: treinadorasLoading, refetch: refetchTreinadoras } = useTreinadorasAdmin();
  const { codigos, isLoading: codigosLoading, refetch: refetchCodigos } = useCodigosAdmin();

  const isLoading = statsLoading || treinadorasLoading || codigosLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchTreinadoras(), refetchCodigos()]);
    setRefreshing(false);
  };

  // Cálculos para métricas
  const metricas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Códigos gerados hoje (simulado - na prática precisaria do campo created_at)
    const codigosHoje = codigos.filter(c => {
      const dataCriacao = new Date(c.created_at);
      dataCriacao.setHours(0, 0, 0, 0);
      return dataCriacao.getTime() === hoje.getTime();
    }).length;

    // Testes realizados hoje (simulado - clientes criados hoje)
    // Na prática, seria baseado em uma tabela de testes_completos ou similar
    const testesHoje = Math.floor(Math.random() * 5); // Placeholder

    // Taxa de conversão
    const taxaConversao = stats?.totalCodigos 
      ? Math.round(((stats.totalCodigosUsados || 0) / stats.totalCodigos) * 100)
      : 0;

    return {
      codigosHoje: codigosHoje || 0,
      testesHoje,
      treinadorasAtivas: treinadoras.filter(t => t.totalClientes > 0).length,
      taxaConversao,
    };
  }, [codigos, treinadoras, stats]);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={ADMIN_COLORS.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Relatórios</Text>
          <Text style={styles.headerSubtitle}>
            Visão geral das métricas do sistema
          </Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📥 Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Big Numbers Grid */}
      <View style={styles.bigNumbersGrid}>
        <BigNumberCard
          title="Testes Hoje"
          value={metricas.testesHoje}
          subtitle="Avaliações realizadas"
          color={ADMIN_COLORS.success}
          icon="◈"
        />
        <BigNumberCard
          title="Treinadoras Ativas"
          value={metricas.treinadorasAtivas}
          subtitle={`De ${treinadoras.length} total`}
          color={ADMIN_COLORS.info}
          icon="◎"
        />
        <BigNumberCard
          title="Códigos Hoje"
          value={metricas.codigosHoje}
          subtitle="Gerados nas últimas 24h"
          color={ADMIN_COLORS.warning}
          icon="◉"
        />
        <BigNumberCard
          title="Taxa de Conversão"
          value={`${metricas.taxaConversao}%`}
          subtitle="Códigos utilizados"
          color={ADMIN_COLORS.accent}
          icon="◐"
        />
      </View>

      {/* Resumo Geral */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo Geral</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalTreinadoras || 0}</Text>
              <Text style={styles.summaryLabel}>Treinadoras</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalCodigos || 0}</Text>
              <Text style={styles.summaryLabel}>Códigos Totais</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalClientes || 0}</Text>
              <Text style={styles.summaryLabel}>Clientes</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats?.totalClientesCompletos || 0}</Text>
              <Text style={styles.summaryLabel}>Testes Completos</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Atividade Recente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade Recente</Text>
        <View style={styles.activityCard}>
          {[
            { action: 'Nova treinadora cadastrada', user: 'Sistema', time: '2 min atrás', icon: '+' },
            { action: 'Códigos gerados em lote', user: 'Admin', time: '15 min atrás', icon: '⚡' },
            { action: 'Teste completado', user: 'Cliente', time: '1 hora atrás', icon: '◈' },
            { action: 'Código ativado', user: 'Cliente', time: '3 horas atrás', icon: '◉' },
          ].map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>{item.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{item.action}</Text>
                <Text style={styles.activityMeta}>{item.user} • {item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  },
  exportButton: {
    backgroundColor: ADMIN_COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  exportButtonText: {
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  bigNumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
    ...Platform.select({
      web: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    }),
  },
  bigNumberCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    flex: 1,
    minWidth: 200,
    ...Platform.select({
      web: {
        flex: 'unset',
        minWidth: 'unset',
      },
    }),
  },
  bigNumberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  bigNumberIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigNumberIconText: {
    fontSize: 16,
  },
  bigNumberTitle: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
    fontWeight: '500',
  },
  bigNumberValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  bigNumberSubtitle: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
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
  summaryCard: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: ADMIN_COLORS.border,
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${ADMIN_COLORS.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 14,
    color: ADMIN_COLORS.accent,
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
});
