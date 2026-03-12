/**
 * Card de Detecção de Padrões - DECIFRA
 * 
 * Exibe alertas sobre padrões suspeitos nas respostas do teste
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { AnalisePadroes, AlertaPadrao } from '@/utils/deteccaoPadroes';
import { COLORS } from '@/constants/colors';
import { COLORS_ARTIO } from '@/constants/colors-artio';

// Habilitar LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DeteccaoPadroesCardProps {
  analise: AnalisePadroes;
}

export function DeteccaoPadroesCard({ analise }: DeteccaoPadroesCardProps) {
  const [expandido, setExpandido] = useState(false);

  if (analise.alertas.length === 0) {
    return (
      <View style={[styles.container, styles.containerSucesso]}>
        <View style={styles.headerSucesso}>
          <Text style={styles.iconSucesso}>✓</Text>
          <View style={styles.headerContent}>
            <Text style={styles.tituloSucesso}>Respostas Consistentes</Text>
            <Text style={styles.subtituloSucesso}>
              Não detectamos padrões suspeitos nas suas respostas
            </Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreBar, { backgroundColor: COLORS_ARTIO.success }]}>
            <View style={[styles.scoreFill, { width: `${analise.scoreConsistencia}%` }]} />
          </View>
          <Text style={styles.scoreText}>{analise.scoreConsistencia}% consistente</Text>
        </View>
      </View>
    );
  }

  const handleExpandir = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  const getAlertaColor = (tipo: AlertaPadrao['tipo']) => {
    switch (tipo) {
      case 'critico':
        return COLORS_ARTIO.error;
      case 'alerta':
        return COLORS_ARTIO.warning;
      case 'atencao':
        return COLORS_ARTIO.info;
    }
  };

  const getAlertaIcon = (tipo: AlertaPadrao['tipo']) => {
    switch (tipo) {
      case 'critico':
        return '⚠️';
      case 'alerta':
        return '⚡';
      case 'atencao':
        return 'ℹ️';
    }
  };

  const maisGrave = analise.alertas[0];
  const corMaisGrave = getAlertaColor(maisGrave.tipo);

  return (
    <View style={[styles.container, { borderColor: corMaisGrave }]}>
      <TouchableOpacity style={styles.header} onPress={handleExpandir}>
        <View style={[styles.iconContainer, { backgroundColor: `${corMaisGrave}20` }]}>
          <Text style={styles.icon}>{getAlertaIcon(maisGrave.tipo)}</Text>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={[styles.titulo, { color: corMaisGrave }]}>
            {maisGrave.tipo === 'critico' ? 'Atenção Necessária' : 
             maisGrave.tipo === 'alerta' ? 'Observação' : 'Informação'}
          </Text>
          <Text style={styles.subtitulo} numberOfLines={expandido ? undefined : 2}>
            {analise.recomendacao}
          </Text>
        </View>

        <Text style={styles.expandIcon}>{expandido ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Score de consistência */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreBar, { backgroundColor: `${corMaisGrave}30` }]}>
          <View 
            style={[
              styles.scoreFill, 
              { 
                width: `${analise.scoreConsistencia}%`,
                backgroundColor: corMaisGrave,
              }
            ]} 
          />
        </View>
        <Text style={[styles.scoreText, { color: corMaisGrave }]}>
          {analise.scoreConsistencia}% consistência
        </Text>
      </View>

      {/* Lista de alertas expandida */}
      {expandido && (
        <View style={styles.alertasContainer}>
          <Text style={styles.alertasTitulo}>Detalhes:</Text>
          
          {analise.alertas.map((alerta, index) => (
            <View 
              key={index} 
              style={[
                styles.alertaItem,
                { borderLeftColor: getAlertaColor(alerta.tipo) }
              ]}
            >
              <View style={styles.alertaHeader}>
                <Text style={styles.alertaIcon}>{getAlertaIcon(alerta.tipo)}</Text>
                <Text style={[styles.alertaTitulo, { color: getAlertaColor(alerta.tipo) }]}>
                  {alerta.titulo}
                </Text>
              </View>
              
              <Text style={styles.alertaDescricao}>{alerta.descricao}</Text>
              
              {alerta.detalhes && alerta.detalhes.length > 0 && (
                <View style={styles.detalhesContainer}>
                  {alerta.detalhes.map((detalhe, idx) => (
                    <Text key={idx} style={styles.detalheItem}>• {detalhe}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          {analise.scoreConsistencia < 60 && (
            <View style={styles.recomendacaoBox}>
              <Text style={styles.recomendacaoTitulo}>💡 Recomendação</Text>
              <Text style={styles.recomendacaoTexto}>
                Considerando os padrões detectados, recomendamos refazer o teste 
                em outro momento, dedicando mais tempo para cada questão e refletindo 
                sobre suas respostas.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(45, 21, 24, 0.7)',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
    overflow: 'hidden',
  },
  containerSucesso: {
    borderColor: COLORS_ARTIO.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  headerSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  iconSucesso: {
    fontSize: 24,
    color: COLORS_ARTIO.success,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tituloSucesso: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS_ARTIO.success,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 18,
  },
  subtituloSucesso: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.8,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.cream,
    opacity: 0.5,
  },
  scoreSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scoreContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertasContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 240, 230, 0.1)',
  },
  alertasTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cream,
    marginBottom: 12,
  },
  alertaItem: {
    backgroundColor: 'rgba(245, 240, 230, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  alertaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertaIcon: {
    fontSize: 14,
  },
  alertaTitulo: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertaDescricao: {
    fontSize: 12,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 18,
  },
  detalhesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 240, 230, 0.1)',
  },
  detalheItem: {
    fontSize: 11,
    color: COLORS.cream,
    opacity: 0.7,
    marginBottom: 3,
  },
  recomendacaoBox: {
    backgroundColor: 'rgba(196, 167, 125, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 167, 125, 0.3)',
  },
  recomendacaoTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS_ARTIO.ocre,
    marginBottom: 6,
  },
  recomendacaoTexto: {
    fontSize: 12,
    color: COLORS.cream,
    opacity: 0.9,
    lineHeight: 18,
  },
});

export default DeteccaoPadroesCard;
