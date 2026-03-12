/**
 * Compras Hotmart - Integração com Hotmart
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { COLORS_ARTIO } from '@/constants/colors-artio';

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

// Dados placeholder de compras
const COMPRAS = [
  { 
    id: 1, 
    transacao: 'HOT-2025-78945', 
    cliente: 'João Silva', 
    email: 'joao@email.com', 
    produto: 'DECIFRA Completo',
    valor: 'R$ 297,00',
    status: 'aprovado',
    data: '11/03/2025',
    comissao: 'R$ 89,10'
  },
  { 
    id: 2, 
    transacao: 'HOT-2025-78946', 
    cliente: 'Maria Santos', 
    email: 'maria@email.com', 
    produto: 'DECIFRA Completo',
    valor: 'R$ 297,00',
    status: 'aprovado',
    data: '11/03/2025',
    comissao: 'R$ 89,10'
  },
  { 
    id: 3, 
    transacao: 'HOT-2025-78947', 
    cliente: 'Pedro Costa', 
    email: 'pedro@email.com', 
    produto: 'DECIFRA Básico',
    valor: 'R$ 147,00',
    status: 'pendente',
    data: '10/03/2025',
    comissao: 'R$ 44,10'
  },
  { 
    id: 4, 
    transacao: 'HOT-2025-78948', 
    cliente: 'Ana Pereira', 
    email: 'ana@email.com', 
    produto: 'DECIFRA Completo',
    valor: 'R$ 297,00',
    status: 'reembolsado',
    data: '09/03/2025',
    comissao: '-R$ 89,10'
  },
  { 
    id: 5, 
    transacao: 'HOT-2025-78949', 
    cliente: 'Carlos Lima', 
    email: 'carlos@email.com', 
    produto: 'DECIFRA Completo',
    valor: 'R$ 297,00',
    status: 'aprovado',
    data: '09/03/2025',
    comissao: 'R$ 89,10'
  },
  { 
    id: 6, 
    transacao: 'HOT-2025-78950', 
    cliente: 'Fernanda Dias', 
    email: 'fernanda@email.com', 
    produto: 'DECIFRA Básico',
    valor: 'R$ 147,00',
    status: 'aprovado',
    data: '08/03/2025',
    comissao: 'R$ 44,10'
  },
];

export default function ComprasScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Compras Hotmart</Text>
          <Text style={styles.headerSubtitle}>
            Transações e vendas integradas com Hotmart
          </Text>
        </View>
        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncButtonText}>↻ Sincronizar</Text>
        </TouchableOpacity>
      </View>

      {/* Cards de resumo financeiro */}
      <View style={styles.financialCards}>
        <View style={styles.finCard}>
          <Text style={styles.finLabel}>Receita Total (Mês)</Text>
          <Text style={styles.finValue}>R$ 45.678,00</Text>
          <View style={styles.finTrend}>
            <Text style={styles.finTrendUp}>↑ +12%</Text>
            <Text style={styles.finTrendLabel}>vs mês anterior</Text>
          </View>
        </View>
        <View style={styles.finCard}>
          <Text style={styles.finLabel}>Comissões (Mês)</Text>
          <Text style={styles.finValue}>R$ 13.703,40</Text>
          <View style={styles.finTrend}>
            <Text style={styles.finTrendUp}>↑ +8%</Text>
            <Text style={styles.finTrendLabel}>vs mês anterior</Text>
          </View>
        </View>
        <View style={styles.finCard}>
          <Text style={styles.finLabel}>Taxa de Reembolso</Text>
          <Text style={styles.finValue}>3.2%</Text>
          <View style={styles.finTrend}>
            <Text style={styles.finTrendDown}>↓ -1.5%</Text>
            <Text style={styles.finTrendLabel}>vs mês anterior</Text>
          </View>
        </View>
      </View>

      {/* Status da integração */}
      <View style={styles.integrationStatus}>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Integração Hotmart ativa</Text>
        </View>
        <Text style={styles.lastSync}>Última sincronização: há 5 minutos</Text>
      </View>

      {/* Barra de busca e filtros */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>◐</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar transação..."
            placeholderTextColor={ADMIN_COLORS.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Status ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Período ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de compras */}
      <View style={styles.tableCard}>
        {/* Cabeçalho */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colTransacao]}>Transação</Text>
          <Text style={[styles.tableHeaderCell, styles.colCliente]}>Cliente</Text>
          <Text style={[styles.tableHeaderCell, styles.colProduto]}>Produto</Text>
          <Text style={[styles.tableHeaderCell, styles.colValor]}>Valor</Text>
          <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
          <Text style={[styles.tableHeaderCell, styles.colData]}>Data</Text>
        </View>

        {/* Linhas */}
        {COMPRAS.map((compra, index) => (
          <View 
            key={compra.id} 
            style={[
              styles.tableRow, 
              index === COMPRAS.length - 1 && styles.tableRowLast
            ]}
          >
            <View style={[styles.tableCell, styles.colTransacao]}>
              <Text style={styles.transacaoText}>{compra.transacao}</Text>
            </View>
            <View style={[styles.tableCell, styles.colCliente]}>
              <Text style={styles.clienteNome}>{compra.cliente}</Text>
              <Text style={styles.clienteEmail}>{compra.email}</Text>
            </View>
            <Text style={[styles.tableCell, styles.colProduto, styles.produtoText]}>
              {compra.produto}
            </Text>
            <Text style={[styles.tableCell, styles.colValor, styles.valorText]}>
              {compra.valor}
            </Text>
            <View style={[styles.tableCell, styles.colStatus]}>
              <View style={[
                styles.statusBadge,
                compra.status === 'aprovado' && styles.statusAprovado,
                compra.status === 'pendente' && styles.statusPendente,
                compra.status === 'reembolsado' && styles.statusReembolsado,
              ]}>
                <Text style={[
                  styles.statusText,
                  compra.status === 'aprovado' && styles.statusTextAprovado,
                  compra.status === 'pendente' && styles.statusTextPendente,
                  compra.status === 'reembolsado' && styles.statusTextReembolsado,
                ]}>
                  {compra.status}
                </Text>
              </View>
            </View>
            <Text style={[styles.tableCell, styles.colData, styles.dataText]}>
              {compra.data}
            </Text>
          </View>
        ))}
      </View>

      {/* Ações em lote */}
      <View style={styles.bulkActions}>
        <TouchableOpacity style={styles.bulkBtn}>
          <Text style={styles.bulkBtnText}>📊 Gerar Relatório</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkBtn}>
          <Text style={styles.bulkBtnText}>📥 Exportar Excel</Text>
        </TouchableOpacity>
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
  syncButton: {
    backgroundColor: ADMIN_COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  financialCards: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    marginBottom: 20,
    gap: 16,
  },
  finCard: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  finLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 8,
  },
  finTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  finTrendUp: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.success,
  },
  finTrendDown: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS_ARTIO.error,
  },
  finTrendLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  integrationStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ADMIN_COLORS.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: ADMIN_COLORS.success,
    fontWeight: '500',
  },
  lastSync: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    color: ADMIN_COLORS.textMuted,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  filterButton: {
    backgroundColor: ADMIN_COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  filterText: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
  },
  tableCard: {
    marginHorizontal: 32,
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  colTransacao: {
    flex: 1.2,
  },
  colCliente: {
    flex: 1.5,
  },
  colProduto: {
    flex: 1.2,
  },
  colValor: {
    flex: 0.8,
  },
  colStatus: {
    flex: 1,
  },
  colData: {
    flex: 0.8,
  },
  transacaoText: {
    fontSize: 13,
    fontWeight: '500',
    color: ADMIN_COLORS.info,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  clienteNome: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
    marginBottom: 2,
  },
  clienteEmail: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  produtoText: {
    fontSize: 13,
    color: ADMIN_COLORS.text,
  },
  valorText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusAprovado: {
    backgroundColor: `${ADMIN_COLORS.success}20`,
  },
  statusPendente: {
    backgroundColor: `${ADMIN_COLORS.warning}20`,
  },
  statusReembolsado: {
    backgroundColor: `${COLORS_ARTIO.error}20`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextAprovado: {
    color: ADMIN_COLORS.success,
  },
  statusTextPendente: {
    color: ADMIN_COLORS.warning,
  },
  statusTextReembolsado: {
    color: COLORS_ARTIO.error,
  },
  dataText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  bulkActions: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    marginTop: 24,
    gap: 12,
  },
  bulkBtn: {
    backgroundColor: ADMIN_COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  bulkBtnText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  footer: {
    height: 40,
  },
});
