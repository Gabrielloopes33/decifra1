/**
 * Card de Protocolo - DECIFRA
 * 
 * Exibe um protocolo de intervenção
 * Versão simplificada sem Reanimated
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Protocolo } from '@/constants/protocolos';
import { COLORS } from '@/constants/colors';
import { COLORS_ARTIO } from '@/constants/colors-artio';

// Habilitar LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProtocoloCardProps {
  protocolo: Protocolo;
  index: number;
  prioridade: 'alta' | 'media' | 'baixa';
}

export function ProtocoloCard({ protocolo, prioridade }: ProtocoloCardProps) {
  const [expandido, setExpandido] = useState(false);

  const formatarExercicioTexto = (exercicio: Protocolo['exercicios'][number]) => {
    if (typeof exercicio === 'string') {
      return exercicio;
    }

    const partes = [
      exercicio.titulo?.trim(),
      exercicio.descricao?.trim(),
      exercicio.frequencia ? `Frequencia: ${exercicio.frequencia}` : '',
      exercicio.duracao ? `Duracao: ${exercicio.duracao}` : '',
    ].filter(Boolean);

    return partes.join(' | ');
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Layout animation para expandir
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  const getIcon = () => {
    switch (protocolo.icon) {
      case 'wind': return '🌬️';
      case 'search': return '🔍';
      case 'balance': return '⚖️';
      case 'shield': return '🛡️';
      case 'heart': return '❤️';
      case 'trophy': return '🏆';
      case 'zap-off': return '⚡';
      case 'message-circle': return '💬';
      case 'smile': return '😊';
      case 'users': return '👥';
      case 'user-plus': return '➕';
      case 'user-check': return '✅';
      case 'crown': return '👑';
      case 'mic': return '🎤';
      case 'message-square': return '📝';
      default: return '📋';
    }
  };

  const getPrioridadeLabel = () => {
    switch (prioridade) {
      case 'alta': return { label: 'Alta Prioridade', cor: COLORS_ARTIO.error };
      case 'media': return { label: 'Média Prioridade', cor: COLORS_ARTIO.warning };
      case 'baixa': return { label: 'Manutenção', cor: COLORS_ARTIO.success };
    }
  };

  const prioridadeInfo = getPrioridadeLabel();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.titulo}>{protocolo.titulo}</Text>
          <Text style={styles.subtitulo}>{protocolo.subtitulo}</Text>
          
          <View style={styles.tags}>
            <View style={[styles.tagPrioridade, { backgroundColor: prioridadeInfo.cor }]}>
              <Text style={styles.tagText}>{prioridadeInfo.label}</Text>
            </View>
            <View style={styles.tagDuracao}>
              <Text style={styles.tagDuracaoText}>⏱️ {protocolo.duracao}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.expandIcon}>{expandido ? '▲' : '▼'}</Text>
      </View>

      {/* Conteúdo expandido */}
      {expandido && (
        <View style={styles.conteudo}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Objetivo</Text>
            <Text style={styles.sectionText}>{protocolo.objetivo}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Descrição</Text>
            <Text style={styles.sectionText}>{protocolo.descricao}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Exercícios</Text>
            {protocolo.exercicios.map((exercicio, idx) => (
              <View key={idx} style={styles.exercicioItem}>
                <Text style={styles.exercicioNumero}>{idx + 1}</Text>
                <Text style={styles.exercicioTexto}>{formatarExercicioTexto(exercicio)}</Text>
              </View>
            ))}
          </View>

          {protocolo.recursos && protocolo.recursos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛠️ Recursos</Text>
              <View style={styles.recursosContainer}>
                {protocolo.recursos.map((recurso, idx) => (
                  <View key={idx} style={styles.recursoTag}>
                    <Text style={styles.recursoText}>{recurso}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(45, 21, 24, 0.7)',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 90, 61, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  headerContent: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.creamLight,
    marginBottom: 3,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPrioridade: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  tagDuracao: {
    backgroundColor: 'rgba(196, 167, 125, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagDuracaoText: {
    fontSize: 11,
    color: COLORS_ARTIO.ocre,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.6,
  },
  conteudo: {
    padding: 18,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 240, 230, 0.1)',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_ARTIO.ocre,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    color: COLORS.cream,
    opacity: 0.95,
    lineHeight: 24,
  },
  exercicioItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(245, 240, 230, 0.05)',
    padding: 14,
    borderRadius: 10,
  },
  exercicioNumero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS_ARTIO.terracota,
    color: COLORS.creamLight,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  exercicioTexto: {
    flex: 1,
    fontSize: 15,
    color: COLORS.cream,
    opacity: 0.95,
    lineHeight: 22,
  },
  recursosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recursoTag: {
    backgroundColor: 'rgba(245, 240, 230, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recursoText: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.9,
  },
});

export default ProtocoloCard;
