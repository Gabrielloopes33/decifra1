/**
 * Busca de Clientes - DECIFRA
 * 
 * Componente de busca e filtro para lista de clientes
 * Versão simplificada sem Reanimated
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { COLORS_ARTIO } from '@/constants/colors-artio';

type ClienteStatus = 'todos' | 'pendente' | 'em_andamento' | 'completo';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  status: 'pendente' | 'em_andamento' | 'completo';
  data_criacao: string;
  progresso?: number;
}

interface ClienteSearchProps {
  clientes: Cliente[];
  onClientePress: (cliente: Cliente) => void;
}

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  pendente: { label: 'Pendente', cor: COLORS_ARTIO.warning },
  em_andamento: { label: 'Em Andamento', cor: COLORS_ARTIO.info },
  completo: { label: 'Completo', cor: COLORS_ARTIO.success },
};

export function ClienteSearch({ clientes, onClientePress }: ClienteSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClienteStatus>('todos');

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      // Filtro de busca por nome
      const matchesSearch = cliente.nome
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      // Filtro por status
      const matchesStatus = 
        statusFilter === 'todos' || cliente.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchQuery, statusFilter]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleStatusFilter = useCallback((status: ClienteStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatusFilter(status);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente por nome..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="words"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de status */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['todos', 'pendente', 'em_andamento', 'completo'] as ClienteStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.filterButtonActive,
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status && styles.filterTextActive,
              ]}
            >
              {status === 'todos' && 'Todos'}
              {status === 'pendente' && 'Pendentes'}
              {status === 'em_andamento' && 'Em Andamento'}
              {status === 'completo' && 'Completos'}
            </Text>
            {status !== 'todos' && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {clientes.filter(c => c.status === status).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contador de resultados */}
      <Text style={styles.resultsText}>
        {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
        {searchQuery && ` para "${searchQuery}"`}
      </Text>

      {/* Lista de clientes */}
      <ScrollView style={styles.listContainer}>
        {filteredClientes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Tente buscar com outro termo'
                : 'Não há clientes com este status'}
            </Text>
          </View>
        ) : (
          filteredClientes.map((cliente, index) => (
            <TouchableOpacity
              key={cliente.id}
              style={[
                styles.clienteCard,
                index === filteredClientes.length - 1 && styles.clienteCardLast,
              ]}
              onPress={() => onClientePress(cliente)}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getIniciais(cliente.nome)}
                </Text>
              </View>

              <View style={styles.clienteInfo}>
                <Text style={styles.clienteNome}>{cliente.nome}</Text>
                {cliente.email && (
                  <Text style={styles.clienteEmail}>{cliente.email}</Text>
                )}
                
                {cliente.status === 'em_andamento' && cliente.progresso !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${cliente.progresso}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{cliente.progresso}%</Text>
                  </View>
                )}
              </View>

              <View style={styles.clienteMeta}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_LABELS[cliente.status].cor },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {STATUS_LABELS[cliente.status].label}
                  </Text>
                </View>
                <Text style={styles.dataText}>
                  {formatDate(cliente.data_criacao)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 21, 24, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.cream,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.5,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 21, 24, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.8,
  },
  filterTextActive: {
    color: COLORS.creamLight,
    opacity: 1,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  resultsText: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.6,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  clienteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 21, 24, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
  },
  clienteCardLast: {
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.creamLight,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.creamLight,
    marginBottom: 2,
  },
  clienteEmail: {
    fontSize: 12,
    color: COLORS.cream,
    opacity: 0.7,
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS_ARTIO.ocre,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.cream,
    opacity: 0.7,
  },
  clienteMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  dataText: {
    fontSize: 11,
    color: COLORS.cream,
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default ClienteSearch;
