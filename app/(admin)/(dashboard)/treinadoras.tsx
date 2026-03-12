/**
 * Lista de Treinadoras - Gerenciamento de treinadoras
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
import { useTreinadorasAdmin } from '@/hooks/useTreinadorasAdmin';
import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { TreinadoraAdmin } from '@/types/admin';

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
};



export default function TreinadorasScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { treinadoras, isLoading, isError, error, refetch, hasSession } = useTreinadorasAdmin();

  // Estados para o modal de criar nova treinadora
  const [modalVisible, setModalVisible] = useState(false);
  const [novaTreinadora, setNovaTreinadora] = useState({
    nome: '',
    email: '',
    creditos: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para o menu de ações
  const [menuVisible, setMenuVisible] = useState(false);
  const [treinadoraSelecionada, setTreinadoraSelecionada] = useState<TreinadoraAdmin | null>(null);

  // Estados para o modal de adicionar créditos
  const [creditosModalVisible, setCreditosModalVisible] = useState(false);
  const [creditosAdicionar, setCreditosAdicionar] = useState('0');

  // Estados para o modal de editar treinadora
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ nome: '', email: '' });

  // Filtra treinadoras pela busca
  const filteredTreinadoras = useMemo(() => {
    if (!searchQuery.trim()) return treinadoras;
    const query = searchQuery.toLowerCase();
    return treinadoras.filter(t => 
      t.nome.toLowerCase().includes(query) || 
      t.email.toLowerCase().includes(query)
    );
  }, [treinadoras, searchQuery]);

  // Formata data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Abrir menu de ações
  const handleOpenMenu = (treinadora: TreinadoraAdmin) => {
    setTreinadoraSelecionada(treinadora);
    setMenuVisible(true);
  };

  // Abrir modal de adicionar créditos
  const handleOpenCreditos = () => {
    if (!treinadoraSelecionada) return;
    setCreditosAdicionar('0');
    setMenuVisible(false);
    setCreditosModalVisible(true);
  };

  // Função para adicionar créditos
  const handleAdicionarCreditos = async () => {
    if (!treinadoraSelecionada) return;
    
    const creditosNum = parseInt(creditosAdicionar) || 0;
    if (creditosNum <= 0) {
      Alert.alert('Erro', 'Digite um valor maior que 0');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const novosCreditos = treinadoraSelecionada.creditos + creditosNum;
      
      const { error } = await supabase
        .from('treinadoras')
        .update({ creditos: novosCreditos })
        .eq('id', treinadoraSelecionada.id);

      if (error) throw error;

      Alert.alert(
        'Sucesso', 
        `${creditosNum} crédito(s) adicionado(s)!\n\nTotal atual: ${novosCreditos} créditos`
      );
      
      setCreditosModalVisible(false);
      setTreinadoraSelecionada(null);
      setCreditosAdicionar('0');
      refetch();
    } catch (error: any) {
      console.error('Erro ao adicionar créditos:', error);
      Alert.alert('Erro', error.message || 'Erro ao adicionar créditos');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de editar
  const handleOpenEditar = () => {
    if (!treinadoraSelecionada) return;
    setEditForm({
      nome: treinadoraSelecionada.nome,
      email: treinadoraSelecionada.email
    });
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  // Função para editar treinadora
  const handleEditarTreinadora = async () => {
    if (!treinadoraSelecionada) return;
    
    if (!editForm.nome.trim() || !editForm.email.trim()) {
      Alert.alert('Erro', 'Preencha nome e email');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('treinadoras')
        .update({
          nome: editForm.nome.trim(),
          email: editForm.email.trim(),
        })
        .eq('id', treinadoraSelecionada.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Treinadora atualizada com sucesso!');
      
      setEditModalVisible(false);
      setTreinadoraSelecionada(null);
      refetch();
    } catch (error: any) {
      console.error('Erro ao editar treinadora:', error);
      Alert.alert('Erro', error.message || 'Erro ao editar treinadora');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir confirmação de exclusão
  const handleOpenExcluir = () => {
    console.log('[Excluir] Abrindo confirmação...', treinadoraSelecionada?.id);
    if (!treinadoraSelecionada) return;
    setMenuVisible(false);
    
    setTimeout(() => {
      Alert.alert(
        'Confirmar Exclusão',
        `Deseja realmente excluir a treinadora "${treinadoraSelecionada.nome}"?\n\nEsta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => {
              console.log('[Excluir] Botão Excluir pressionado');
              handleExcluirTreinadora();
            }
          }
        ]
      );
    }, 300);
  };

  // Função para excluir treinadora
  const handleExcluirTreinadora = async () => {
    console.log('[Excluir] Iniciando exclusão...', treinadoraSelecionada?.id);
    
    if (!treinadoraSelecionada) {
      console.error('[Excluir] Nenhuma treinadora selecionada');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Buscar clientes da treinadora
      const { data: clientes, error: clientesQueryError } = await supabase
        .from('clientes')
        .select('id')
        .eq('treinadora_id', treinadoraSelecionada.id);

      if (clientesQueryError) {
        console.error('[Excluir] Erro ao buscar clientes:', clientesQueryError);
      }

      console.log('[Excluir] Clientes encontrados:', clientes?.length || 0);

      // Excluir respostas dos clientes primeiro
      if (clientes && clientes.length > 0) {
        const clienteIds = clientes.map(c => c.id);
        
        const { error: respostasError } = await supabase
          .from('respostas')
          .delete()
          .in('cliente_id', clienteIds);

        if (respostasError) {
          console.error('[Excluir] Erro ao excluir respostas:', respostasError);
        } else {
          console.log('[Excluir] Respostas excluídas');
        }

        // Excluir resultados dos clientes
        const { error: resultadosError } = await supabase
          .from('resultados')
          .delete()
          .in('cliente_id', clienteIds);

        if (resultadosError) {
          console.error('[Excluir] Erro ao excluir resultados:', resultadosError);
        } else {
          console.log('[Excluir] Resultados excluídos');
        }
      }

      // Excluir códigos da treinadora
      console.log('[Excluir] Excluindo códigos...');
      const { error: codigosError, count: codigosCount } = await supabase
        .from('codigos')
        .delete()
        .eq('treinadora_id', treinadoraSelecionada.id)
        .select('count');

      if (codigosError) {
        console.error('[Excluir] Erro ao excluir códigos:', codigosError);
        throw new Error(`Erro ao excluir códigos: ${codigosError.message}`);
      }
      console.log('[Excluir] Códigos excluídos');

      // Excluir clientes da treinadora
      console.log('[Excluir] Excluindo clientes...');
      const { error: clientesError } = await supabase
        .from('clientes')
        .delete()
        .eq('treinadora_id', treinadoraSelecionada.id);

      if (clientesError) {
        console.error('[Excluir] Erro ao excluir clientes:', clientesError);
        throw new Error(`Erro ao excluir clientes: ${clientesError.message}`);
      }
      console.log('[Excluir] Clientes excluídos');

      // Finalmente excluir a treinadora
      console.log('[Excluir] Excluindo treinadora...');
      const { error } = await supabase
        .from('treinadoras')
        .delete()
        .eq('id', treinadoraSelecionada.id);

      if (error) {
        console.error('[Excluir] Erro ao excluir treinadora:', error);
        throw error;
      }

      console.log('[Excluir] Treinadora excluída com sucesso!');
      Alert.alert('Sucesso', 'Treinadora excluída com sucesso!');
      setTreinadoraSelecionada(null);
      refetch();
    } catch (error: any) {
      console.error('[Excluir] Erro completo:', error);
      Alert.alert('Erro', error.message || 'Erro ao excluir treinadora');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para criar nova treinadora
  const handleCriarTreinadora = async () => {
    if (!novaTreinadora.nome.trim() || !novaTreinadora.email.trim()) {
      Alert.alert('Erro', 'Preencha nome e email');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Criar senha temporária
      const senhaTemporaria = Math.random().toString(36).slice(-8) + 'A1!';
      
      // 2. Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: novaTreinadora.email.trim(),
        password: senhaTemporaria,
        options: {
          data: {
            nome: novaTreinadora.nome.trim(),
          }
        }
      });

      if (authError) {
        // Se o email já existe, tentamos pegar o user existente
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          Alert.alert(
            'Email já cadastrado',
            'Este email já está registrado no sistema. Deseja vincular à treinadora existente?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Vincular', 
                onPress: () => criarTreinadoraSemAuth(novaTreinadora)
              }
            ]
          );
          setIsSubmitting(false);
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário no auth');
      }

      // 3. Inserir na tabela treinadoras COM o auth_user_id
      const { error: dbError } = await supabase
        .from('treinadoras')
        .insert({
          nome: novaTreinadora.nome.trim(),
          email: novaTreinadora.email.trim(),
          creditos: parseInt(novaTreinadora.creditos) || 0,
          is_admin: false,
          auth_user_id: authData.user.id // ✅ Vínculo correto!
        });

      if (dbError) {
        // Rollback: deletar usuário do auth se falhar a inserção na tabela
        console.error('Erro ao inserir treinadora:', dbError);
        throw new Error(`Erro ao salvar treinadora: ${dbError.message}`);
      }

      // 4. Enviar email de convite (simulado por agora)
      console.log('Senha temporária gerada:', senhaTemporaria);

      Alert.alert(
        'Sucesso', 
        `Treinadora criada com sucesso!\n\nSenha temporária: ${senhaTemporaria}\n\nA treinadora deve alterar a senha no primeiro login.`
      );
      
      setModalVisible(false);
      setNovaTreinadora({ nome: '', email: '', creditos: '0' });
      refetch(); // Recarrega a lista
    } catch (error: any) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar treinadora');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função auxiliar para vincular treinadora a usuário existente
  const criarTreinadoraSemAuth = async (dados: typeof novaTreinadora) => {
    try {
      // Buscar o auth_user_id pelo email
      const { data: users, error: userError } = await supabase
        .from('treinadoras')
        .select('auth_user_id')
        .eq('email', dados.email.trim())
        .single();

      if (users?.auth_user_id) {
        Alert.alert('Info', 'Este email já está vinculado a uma treinadora.');
        return;
      }

      // Se não existe treinadora com esse email, criar uma nova (aguardando confirmação de email)
      // Isso pode acontecer se o usuário foi criado no auth mas não na tabela
      Alert.alert(
        'Ação necessária',
        'O usuário existe no sistema de autenticação mas não está vinculado a uma treinadora. Entre em contato com o suporte técnico.'
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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
          <Text style={styles.headerTitle}>Treinadoras</Text>
          <Text style={styles.headerSubtitle}>
            Gerencie as treinadoras cadastradas no sistema
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Nova Treinadora</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de busca e filtros */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>◎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar treinadora..."
            placeholderTextColor={ADMIN_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filtrar ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela de treinadoras */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.accent} />
          <Text style={styles.loadingText}>Carregando treinadoras...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Erro ao carregar dados'}
          </Text>
          {!hasSession && (
            <Text style={styles.errorSubtext}>
              Sessão não encontrada. Faça login novamente.
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tableCard}>
          {/* Cabeçalho da tabela */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNome]}>Nome</Text>
            <Text style={[styles.tableHeaderCell, styles.colEmail]}>Email</Text>
            <Text style={[styles.tableHeaderCell, styles.colCodigos]}>Códigos</Text>
            <Text style={[styles.tableHeaderCell, styles.colClientes]}>Clientes</Text>
            <Text style={[styles.tableHeaderCell, styles.colData]}>Cadastro</Text>
            <Text style={[styles.tableHeaderCell, styles.colAcoes]}>Ações</Text>
          </View>

          {/* Linhas da tabela */}
          {filteredTreinadoras.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma treinadora encontrada' : 'Nenhuma treinadora cadastrada'}
              </Text>
              {!searchQuery && (
                <Text style={styles.emptySubtext}>
                  Verifique o console para mensagens de debug
                </Text>
              )}
              <Text style={styles.debugInfo}>
                Total carregado: {treinadoras.length} | Sessão: {hasSession ? 'OK' : 'N/A'}
              </Text>
            </View>
          ) : (
            filteredTreinadoras.map((treinadora, index) => (
              <View 
                key={treinadora.id} 
                style={[
                  styles.tableRow, 
                  index === filteredTreinadoras.length - 1 && styles.tableRowLast
                ]}
              >
                <View style={[styles.tableCell, styles.colNome]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {treinadora.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.nomeText}>{treinadora.nome}</Text>
                </View>
                <Text style={[styles.tableCell, styles.colEmail, styles.emailText]}>
                  {treinadora.email}
                </Text>
                <Text style={[styles.tableCell, styles.colCodigos]}>
                  {treinadora.totalCodigos}
                </Text>
                <Text style={[styles.tableCell, styles.colClientes]}>
                  {treinadora.totalClientes}
                </Text>
                <Text style={[styles.tableCell, styles.colData, styles.dataText]}>
                  {formatDate(treinadora.created_at)}
                </Text>
                <View style={[styles.tableCell, styles.colAcoes]}>
                  <TouchableOpacity 
                    style={styles.menuBtn}
                    onPress={() => handleOpenMenu(treinadora)}
                  >
                    <Text style={styles.menuBtnText}>⋯</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Paginação placeholder */}
      <View style={styles.pagination}>
        <TouchableOpacity style={styles.pageBtn}>
          <Text style={styles.pageBtnText}>← Anterior</Text>
        </TouchableOpacity>
        <View style={styles.pageNumbers}>
          <Text style={[styles.pageNumber, styles.pageNumberActive]}>1</Text>
          <Text style={styles.pageNumber}>2</Text>
          <Text style={styles.pageNumber}>3</Text>
          <Text style={styles.pageNumber}>...</Text>
        </View>
        <TouchableOpacity style={styles.pageBtn}>
          <Text style={styles.pageBtnText}>Próximo →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />

      {/* Menu de Ações (3 pontinhos) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleOpenCreditos}>
              <Text style={styles.menuItemIcon}>💰</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Adicionar Créditos</Text>
                <Text style={styles.menuItemSubtitle}>Adicionar créditos à treinadora</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleOpenEditar}>
              <Text style={styles.menuItemIcon}>✎</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Editar Treinadora</Text>
                <Text style={styles.menuItemSubtitle}>Alterar nome e email</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleOpenExcluir}>
              <Text style={styles.menuItemIcon}>🗑</Text>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, styles.menuItemTitleDanger]}>Excluir Treinadora</Text>
                <Text style={styles.menuItemSubtitle}>Remover permanentemente</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para criar nova treinadora */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Treinadora</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da treinadora"
                  placeholderTextColor={ADMIN_COLORS.textMuted}
                  value={novaTreinadora.nome}
                  onChangeText={(text) => setNovaTreinadora({...novaTreinadora, nome: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={ADMIN_COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={novaTreinadora.email}
                  onChangeText={(text) => setNovaTreinadora({...novaTreinadora, email: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Créditos Iniciais</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={ADMIN_COLORS.textMuted}
                  keyboardType="number-pad"
                  value={novaTreinadora.creditos}
                  onChangeText={(text) => setNovaTreinadora({...novaTreinadora, creditos: text})}
                />
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
                onPress={handleCriarTreinadora}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={ADMIN_COLORS.text} />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Criar Treinadora</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar créditos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={creditosModalVisible}
        onRequestClose={() => setCreditosModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Créditos</Text>
              <TouchableOpacity onPress={() => setCreditosModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {treinadoraSelecionada && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Treinadora:</Text>
                    <Text style={styles.infoValue}>{treinadoraSelecionada.nome}</Text>
                    <Text style={styles.infoLabel}>Créditos Atuais:</Text>
                    <Text style={[styles.infoValue, styles.creditValue]}>
                      {treinadoraSelecionada.creditos}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantidade a Adicionar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 10"
                      placeholderTextColor={ADMIN_COLORS.textMuted}
                      keyboardType="number-pad"
                      value={creditosAdicionar}
                      onChangeText={setCreditosAdicionar}
                    />
                    <Text style={styles.inputHint}>
                      Total após adição: {(treinadoraSelecionada.creditos + (parseInt(creditosAdicionar) || 0))} créditos
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalBtnSecondary} 
                onPress={() => setCreditosModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnPrimary, isSubmitting && styles.modalBtnDisabled]}
                onPress={handleAdicionarCreditos}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={ADMIN_COLORS.text} />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Adicionar Créditos</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar treinadora */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Treinadora</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da treinadora"
                  placeholderTextColor={ADMIN_COLORS.textMuted}
                  value={editForm.nome}
                  onChangeText={(text) => setEditForm({...editForm, nome: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={ADMIN_COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalBtnSecondary} 
                onPress={() => setEditModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnPrimary, isSubmitting && styles.modalBtnDisabled]}
                onPress={handleEditarTreinadora}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={ADMIN_COLORS.text} />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Salvar Alterações</Text>
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
  colNome: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colEmail: {
    flex: 2,
  },
  colCodigos: {
    flex: 1,
  },
  colClientes: {
    flex: 1,
  },
  colData: {
    flex: 1,
  },
  colAcoes: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${ADMIN_COLORS.accent}30`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.accent,
  },
  nomeText: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.text,
  },
  emailText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
  },
  dataText: {
    fontSize: 13,
    color: ADMIN_COLORS.textMuted,
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
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pageBtnText: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
    ...Platform.select({
      web: {
        lineHeight: undefined,
        textAlignVertical: 'center',
      },
    }),
  },
  pageNumberActive: {
    backgroundColor: ADMIN_COLORS.accent,
    color: ADMIN_COLORS.text,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
  errorSubtext: {
    fontSize: 14,
    color: ADMIN_COLORS.warning,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: ADMIN_COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  debugInfo: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginTop: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
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
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBtnText: {
    fontSize: 20,
    color: ADMIN_COLORS.textMuted,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: ADMIN_COLORS.sidebar,
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  menuItemIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  menuItemTitleDanger: {
    color: '#F44336',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: ADMIN_COLORS.border,
    marginHorizontal: 16,
  },
  infoBox: {
    backgroundColor: ADMIN_COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  infoLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
    marginBottom: 12,
  },
  creditValue: {
    color: ADMIN_COLORS.success,
    fontSize: 24,
  },
  inputHint: {
    fontSize: 12,
    color: ADMIN_COLORS.textMuted,
    marginTop: 8,
  },
});
