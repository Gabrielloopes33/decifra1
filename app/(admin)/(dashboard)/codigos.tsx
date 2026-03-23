/**
 * Gerenciamento de Códigos - Geração e gestão de códigos de acesso
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { COLORS_ARTIO } from '@/constants/colors-artio';
import { useCodigosAdmin } from '@/hooks/useCodigosAdmin';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTreinadorasAdmin } from '@/hooks/useTreinadorasAdmin';
import { supabase } from '@/lib/supabase/client';
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

export default function CodigosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'usados' | 'ativos'>('todos');
  
  // Estados para o modal de geração de códigos
  const [modalVisible, setModalVisible] = useState(false);
  const [geracaoConfig, setGeracaoConfig] = useState({
    treinadoraId: '',
    quantidade: '10',
    validadeDias: '30'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para busca de treinadoras no modal
  const [buscaTreinadora, setBuscaTreinadora] = useState('');

  // Para listar treinadoras no dropdown
  const { treinadoras: listaTreinadoras } = useTreinadorasAdmin();

  // Filtrar treinadoras baseado na busca
  const treinadorasFiltradas = useMemo(() => {
    if (!buscaTreinadora.trim()) return listaTreinadoras;
    const query = buscaTreinadora.toLowerCase();
    return listaTreinadoras.filter(t => 
      t.nome.toLowerCase().includes(query) || 
      t.email.toLowerCase().includes(query)
    );
  }, [listaTreinadoras, buscaTreinadora]);
  
  const { 
    codigos, 
    isLoading, 
    isError, 
    refetch,
    filtrarPorStatus 
  } = useCodigosAdmin({ filtroStatus: filterStatus });
  
  const { data: stats } = useDashboardStats();

  // Filtra códigos pela busca
  const filteredCodigos = useMemo(() => {
    if (!searchQuery.trim()) return codigos;
    const query = searchQuery.toLowerCase();
    return codigos.filter(c => 
      c.codigo.toLowerCase().includes(query) || 
      c.treinadora_nome.toLowerCase().includes(query) ||
      c.cliente_nome?.toLowerCase().includes(query)
    );
  }, [codigos, searchQuery]);

  // Formata data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Verifica se código está expirado
  const isExpirado = (validoAte: string) => {
    return new Date(validoAte) < new Date();
  };

  const handleFilterChange = (filtro: 'todos' | 'usados' | 'ativos') => {
    setFilterStatus(filtro);
    filtrarPorStatus(filtro);
  };

  const getFilterLabel = () => {
    if (filterStatus === 'usados') return 'Usados';
    if (filterStatus === 'ativos') return 'Ativos';
    return 'Todos';
  };

  // Função para gerar código aleatório (formato DECF-XXXX-XXXX conforme schema)
  // Caracteres válidos: A-H, J-N, P-Z, 2-9 (sem I, O, 0, 1 para evitar confusão)
  const gerarCodigoAleatorio = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let parte1 = '';
    let parte2 = '';
    for (let i = 0; i < 4; i++) {
      parte1 += chars.charAt(Math.floor(Math.random() * chars.length));
      parte2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DECF-${parte1}-${parte2}`;
  };

  // Handler para gerar códigos em lote
  const handleGerarCodigos = async () => {
    if (!geracaoConfig.treinadoraId) {
      Alert.alert('Erro', 'Selecione uma treinadora');
      return;
    }

    const quantidade = parseInt(geracaoConfig.quantidade);
    if (!quantidade || quantidade < 1 || quantidade > 100) {
      Alert.alert('Erro', 'Quantidade deve ser entre 1 e 100');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validadeDias = parseInt(geracaoConfig.validadeDias) || 30;
      const validoAte = new Date();
      validoAte.setDate(validoAte.getDate() + validadeDias);

      // Gera os códigos - tenta inserir um por um para melhor tratamento de erro
      const codigosGerados = [];
      const erros = [];

      for (let i = 0; i < quantidade; i++) {
        const codigo = gerarCodigoAleatorio();
        
        const { error } = await supabase
          .from('codigos')
          .insert({
            codigo: codigo,
            treinadora_id: geracaoConfig.treinadoraId,
            valido_ate: validoAte.toISOString(),
            usado: false
          });

        if (error) {
          console.error(`Erro ao gerar código ${i + 1}:`, error);
          erros.push({ codigo, erro: error.message });
        } else {
          codigosGerados.push(codigo);
        }
      }

      if (erros.length > 0) {
        Alert.alert(
          'Atenção', 
          `${codigosGerados.length} códigos gerados com sucesso.\n${erros.length} falhas:\n${erros.map(e => e.erro).join('\n')}`
        );
      } else {
        Alert.alert('Sucesso', `${codigosGerados.length} códigos gerados com sucesso!`);
      }
      
      setModalVisible(false);
      setGeracaoConfig({ treinadoraId: '', quantidade: '10', validadeDias: '30' });
      setBuscaTreinadora('');
      refetch();
    } catch (error: any) {
      console.error('Erro ao gerar códigos:', error);
      Alert.alert('Erro', error.message || 'Erro ao gerar códigos. Verifique as políticas RLS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={ADMIN_COLORS.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Códigos de Acesso</Text>
          <Text style={styles.headerSubtitle}>
            Gere e gerencie códigos para acesso ao DECIFRA
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Gerar Códigos</Text>
        </TouchableOpacity>
      </View>

      {/* Estatísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats?.totalCodigos || 0}</Text>
          <Text style={styles.statBoxLabel}>Códigos Totais</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats?.totalCodigosUsados || 0}</Text>
          <Text style={styles.statBoxLabel}>Utilizados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats?.codigosAtivos || 0}</Text>
          <Text style={styles.statBoxLabel}>Ativos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {Math.round(((stats?.totalCodigosUsados || 0) / (stats?.totalCodigos || 1)) * 100)}%
          </Text>
          <Text style={styles.statBoxLabel}>Taxa de Uso</Text>
        </View>
      </View>

      {/* Barra de busca e filtros */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>◉</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar código..."
            placeholderTextColor={ADMIN_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus !== 'todos' && styles.filterButtonActive]}
          onPress={() => handleFilterChange(filterStatus === 'todos' ? 'usados' : filterStatus === 'usados' ? 'ativos' : 'todos')}
        >
          <Text style={[styles.filterText, filterStatus !== 'todos' && styles.filterTextActive]}>
            {getFilterLabel()} ▼
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de códigos */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.accent} />
          <Text style={styles.loadingText}>Carregando códigos...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar dados</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tableCard}>
          {/* Cabeçalho */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colCodigo]}>Código</Text>
            <Text style={[styles.tableHeaderCell, styles.colTreinadora]}>Treinadora</Text>
            <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.tableHeaderCell, styles.colUso]}>Uso</Text>
            <Text style={[styles.tableHeaderCell, styles.colData]}>Validade</Text>
            <Text style={[styles.tableHeaderCell, styles.colAcoes]}>Ações</Text>
          </View>

          {/* Linhas */}
          {filteredCodigos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhum código encontrado' : 'Nenhum código cadastrado'}
              </Text>
            </View>
          ) : (
            filteredCodigos.map((codigo, index) => (
              <View 
                key={codigo.id} 
                style={[
                  styles.tableRow, 
                  index === filteredCodigos.length - 1 && styles.tableRowLast
                ]}
              >
                <View style={[styles.tableCell, styles.colCodigo]}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{codigo.codigo}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.colTreinadora]}>
                  {codigo.treinadora_nome}
                </Text>
                <View style={[styles.tableCell, styles.colStatus]}>
                  <View style={[
                    styles.statusBadge,
                    isExpirado(codigo.valido_ate) ? styles.statusExpirado : styles.statusAtivo,
                  ]}>
                    <Text style={[
                      styles.statusText,
                      isExpirado(codigo.valido_ate) ? styles.statusTextExpirado : styles.statusTextAtivo,
                    ]}>
                      {isExpirado(codigo.valido_ate) ? 'Expirado' : 'Ativo'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.tableCell, styles.colUso]}>
                  <View style={[
                    styles.usoBadge,
                    codigo.usado ? styles.usoBadgeUsado : styles.usoBadgeLivre
                  ]}>
                    <Text style={[
                      styles.usoText,
                      codigo.usado ? styles.usoTextUsado : styles.usoTextLivre
                    ]}>
                      {codigo.usado ? (codigo.cliente_nome || 'Usado') : 'Livre'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.colData, styles.dataText]}>
                  {formatDate(codigo.valido_ate)}
                </Text>
                <View style={[styles.tableCell, styles.colAcoes]}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>◉</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Bulk actions */}
      {!isLoading && !isError && (
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.bulkBtn}>
            <Text style={styles.bulkBtnText}>📋 Copiar Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkBtn}>
            <Text style={styles.bulkBtnText}>📥 Exportar CSV</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer} />

      {/* Modal para gerar códigos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerar Códigos</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Treinadora</Text>
                
                {/* Campo de busca */}
                <View style={styles.searchTreinadoraContainer}>
                  <Text style={styles.searchTreinadoraIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchTreinadoraInput}
                    placeholder="Buscar treinadora..."
                    placeholderTextColor={ADMIN_COLORS.textMuted}
                    value={buscaTreinadora}
                    onChangeText={setBuscaTreinadora}
                  />
                  {buscaTreinadora !== '' && (
                    <TouchableOpacity onPress={() => setBuscaTreinadora('')}>
                      <Text style={styles.searchClear}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Lista filtrada */}
                <View style={styles.selectContainer}>
                  {listaTreinadoras.length === 0 ? (
                    <Text style={styles.selectPlaceholder}>Carregando treinadoras...</Text>
                  ) : treinadorasFiltradas.length === 0 ? (
                    <Text style={styles.selectPlaceholder}>Nenhuma treinadora encontrada</Text>
                  ) : (
                    treinadorasFiltradas.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.selectOption,
                          geracaoConfig.treinadoraId === t.id && styles.selectOptionActive
                        ]}
                        onPress={() => setGeracaoConfig({...geracaoConfig, treinadoraId: t.id})}
                      >
                        <View>
                          <Text style={[
                            styles.selectOptionText,
                            geracaoConfig.treinadoraId === t.id && styles.selectOptionTextActive
                          ]}>
                            {t.nome}
                          </Text>
                          <Text style={styles.selectOptionEmail}>{t.email}</Text>
                        </View>
                        {geracaoConfig.treinadoraId === t.id && (
                          <Text style={styles.selectCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
                
                {geracaoConfig.treinadoraId && (
                  <Text style={styles.treinadoraSelecionada}>
                    Selecionada: {listaTreinadoras.find(t => t.id === geracaoConfig.treinadoraId)?.nome}
                  </Text>
                )}
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Quantidade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor={ADMIN_COLORS.textMuted}
                    keyboardType="number-pad"
                    value={geracaoConfig.quantidade}
                    onChangeText={(text) => setGeracaoConfig({...geracaoConfig, quantidade: text})}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Validade (dias)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor={ADMIN_COLORS.textMuted}
                    keyboardType="number-pad"
                    value={geracaoConfig.validadeDias}
                    onChangeText={(text) => setGeracaoConfig({...geracaoConfig, validadeDias: text})}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalBtnSecondary} 
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnPrimary, isSubmitting && styles.modalBtnDisabled]}
                onPress={handleGerarCodigos}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={ADMIN_COLORS.text} />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Gerar Códigos</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: ADMIN_COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    marginBottom: 24,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 4,
  },
  statBoxLabel: {
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
  filterButtonActive: {
    borderColor: ADMIN_COLORS.accent,
    backgroundColor: `${ADMIN_COLORS.accent}15`,
  },
  filterText: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
  },
  filterTextActive: {
    color: ADMIN_COLORS.accent,
    fontWeight: '600',
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
  colCodigo: {
    flex: 1.5,
  },
  colTreinadora: {
    flex: 1.5,
  },
  colStatus: {
    flex: 0.8,
  },
  colUso: {
    flex: 1.5,
  },
  colData: {
    flex: 1,
  },
  colAcoes: {
    flex: 0.8,
    flexDirection: 'row',
    gap: 8,
  },
  codeBadge: {
    backgroundColor: `${ADMIN_COLORS.info}20`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '600',
    color: ADMIN_COLORS.info,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusAtivo: {
    backgroundColor: `${ADMIN_COLORS.success}20`,
  },
  statusExpirado: {
    backgroundColor: `${ADMIN_COLORS.textMuted}20`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextAtivo: {
    color: ADMIN_COLORS.success,
  },
  statusTextExpirado: {
    color: ADMIN_COLORS.textMuted,
  },
  usoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  usoBadgeUsado: {
    backgroundColor: `${ADMIN_COLORS.warning}20`,
  },
  usoBadgeLivre: {
    backgroundColor: `${ADMIN_COLORS.success}20`,
  },
  usoText: {
    fontSize: 11,
    fontWeight: '500',
  },
  usoTextUsado: {
    color: ADMIN_COLORS.warning,
  },
  usoTextLivre: {
    color: ADMIN_COLORS.success,
  },
  dataText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  actionBtnText: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  actionBtnTextDanger: {
    color: COLORS_ARTIO.error,
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
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
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
  bulkBtnDanger: {
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  bulkBtnTextDanger: {
    color: COLORS_ARTIO.error,
  },
  footer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: ADMIN_COLORS.sidebar,
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  modalClose: {
    fontSize: 20,
    color: ADMIN_COLORS.textMuted,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
  },
  input: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  selectContainer: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    maxHeight: 200,
    overflow: 'hidden',
  },
  selectPlaceholder: {
    padding: 16,
    color: ADMIN_COLORS.textMuted,
    fontSize: 14,
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },
  selectOptionActive: {
    backgroundColor: `${ADMIN_COLORS.accent}20`,
  },
  selectOptionText: {
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  selectOptionTextActive: {
    color: ADMIN_COLORS.accent,
    fontWeight: '600',
  },
  selectCheck: {
    color: ADMIN_COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: ADMIN_COLORS.border,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
  },
  modalBtnPrimary: {
    backgroundColor: ADMIN_COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
  // Novos estilos para busca de treinadoras
  searchTreinadoraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchTreinadoraIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchTreinadoraInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: ADMIN_COLORS.text,
  },
  searchClear: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
    padding: 4,
  },
  selectOptionEmail: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginTop: 2,
  },
  treinadoraSelecionada: {
    fontSize: 12,
    color: ADMIN_COLORS.accent,
    marginTop: 8,
    fontWeight: '500',
  },
});
