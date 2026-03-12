/**
 * Mandala Interativa - DECIFRA
 * 
 * Gráfico radar dos 5 fatores Big Five com toque para detalhes
 * Versão simplificada sem Reanimated
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { FATORES } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';
import { getInterpretacao, FATOR_CORES, FATOR_ICONES } from '@/constants/interpretacoes';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');
const SIZE = Math.min(width * 0.9, 380);
const CENTER = SIZE / 2;
const MAX_RADIUS = (SIZE / 2) - 60;

interface MandalaInterativaProps {
  scores: Array<{
    fator: FatorKey;
    percentil: number;
    classificacao: string;
  }>;
  facetas?: Array<{
    faceta: string;
    score: number;
    percentil: number;
    classificacao: string;
  }>;
  onFatorPress?: (fator: FatorKey) => void;
}

interface FatorDetail {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: string;
  cor: string;
  icone: string;
}

export function MandalaInterativa({
  scores,
  facetas = [],
  onFatorPress,
}: MandalaInterativaProps) {
  const [fatorSelecionado, setFatorSelecionado] = useState<FatorDetail | null>(null);
  
  const fatoresOrdenados: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = fatoresOrdenados.map(fator =>
    scores.find(s => s.fator === fator) || { fator, percentil: 50, classificacao: 'Médio' }
  );

  const calcularPonto = (percentil: number, index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = (percentil / 100) * MAX_RADIUS;
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    };
  };

  const calcularLabelPonto = (index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = MAX_RADIUS + 35;
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    };
  };

  const handleFatorPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const fator = fatoresOrdenados[index];
    const score = scoresOrdenados[index];
    
    const detail: FatorDetail = {
      fator,
      nome: FATORES[fator],
      percentil: score.percentil,
      classificacao: score.classificacao,
      cor: FATOR_CORES[fator],
      icone: FATOR_ICONES[fator],
    };
    
    setFatorSelecionado(detail);
    
    if (onFatorPress) {
      onFatorPress(fator);
    }
  }, [scoresOrdenados, onFatorPress]);

  // Obter facetas de um fator
  const getFacetasDoFator = (fator: FatorKey) => {
    const prefixo = fator;
    return facetas.filter(f => f.faceta.startsWith(prefixo));
  };

  // Componente de tooltip/modal
  const FatorModal = () => {
    if (!fatorSelecionado) return null;
    
    const interpretacao = getInterpretacao(
      fatorSelecionado.fator, 
      fatorSelecionado.classificacao as any
    );
    const facetasDoFator = getFacetasDoFator(fatorSelecionado.fator);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!fatorSelecionado}
        onRequestClose={() => setFatorSelecionado(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFatorSelecionado(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <View style={[styles.modalHeader, { borderColor: fatorSelecionado.cor }]}>
              <Text style={styles.modalIcon}>{fatorSelecionado.icone}</Text>
              <View>
                <Text style={styles.modalTitle}>{fatorSelecionado.nome}</Text>
                <Text style={[styles.modalPercentil, { color: fatorSelecionado.cor }]}>
                  {fatorSelecionado.percentil}º percentil
                </Text>
              </View>
            </View>

            <Text style={styles.modalClassificacao}>
              {interpretacao.titulo}
            </Text>
            <Text style={styles.modalSubtitulo}>
              {interpretacao.subtitulo}
            </Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescricao}>
                {interpretacao.descricao}
              </Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💪 Pontos Fortes</Text>
                {interpretacao.pontosFortes.map((ponto, idx) => (
                  <Text key={idx} style={styles.sectionItem}>• {ponto}</Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Atenção</Text>
                {interpretacao.atencao.map((item, idx) => (
                  <Text key={idx} style={styles.sectionItem}>• {item}</Text>
                ))}
              </View>

              {facetasDoFator.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 Facetas</Text>
                  {facetasDoFator.map((faceta, idx) => (
                    <View key={idx} style={styles.facetaItem}>
                      <Text style={styles.facetaCodigo}>{faceta.faceta}</Text>
                      <Text style={styles.facetaScore}>{faceta.percentil}%</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 Na Carreira</Text>
                <Text style={styles.sectionText}>{interpretacao.carreira}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌱 Crescimento</Text>
                <Text style={styles.sectionText}>{interpretacao.crescimento}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Calcular pontos do polígono
  const pontosPoligono = scoresOrdenados.map((score, index) => {
    const ponto = calcularPonto(score.percentil, index);
    return `${ponto.x},${ponto.y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={SIZE} height={SIZE}>
          {/* Círculos de fundo */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
            <Circle
              key={`grid-${i}`}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * ratio}
              stroke="rgba(245, 240, 230, 0.1)"
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* Linhas do grid */}
          {fatoresOrdenados.map((_, index) => {
            const ponto = calcularLabelPonto(index);
            return (
              <Line
                key={`line-${index}`}
                x1={CENTER}
                y1={CENTER}
                x2={ponto.x}
                y2={ponto.y}
                stroke="rgba(245, 240, 230, 0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Polígono de dados */}
          <Polygon
            points={pontosPoligono}
            fill="rgba(196, 90, 61, 0.3)"
            stroke={COLORS.accent}
            strokeWidth="2"
          />

          {/* Pontos interativos */}
          {fatoresOrdenados.map((fator, index) => {
            const ponto = calcularPonto(scoresOrdenados[index].percentil, index);
            
            return (
              <TouchableOpacity
                key={`point-${index}`}
                onPress={() => handleFatorPress(index)}
                style={{
                  position: 'absolute',
                  left: ponto.x - 20,
                  top: ponto.y - 20,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Circle
                  cx={ponto.x}
                  cy={ponto.y}
                  r="8"
                  fill={FATOR_CORES[fator]}
                  stroke={COLORS.creamLight}
                  strokeWidth="2"
                />
              </TouchableOpacity>
            );
          })}

          {/* Labels */}
          {fatoresOrdenados.map((fator, index) => {
            const labelPonto = calcularLabelPonto(index);
            const nomeFator = FATORES[fator];
            
            return (
              <SvgText
                key={`label-${index}`}
                x={labelPonto.x}
                y={labelPonto.y}
                fill={COLORS.cream}
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                {nomeFator}
              </SvgText>
            );
          })}
        </Svg>

        {/* Hint de interação */}
        <Text style={styles.hint}>Toque nos pontos para detalhes</Text>
      </View>

      <FatorModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svgContainer: {
    alignItems: 'center',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.cream,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2D1518',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 240, 230, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 2,
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.creamLight,
  },
  modalPercentil: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  modalClassificacao: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.creamLight,
    marginBottom: 4,
  },
  modalSubtitulo: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.7,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalDescricao: {
    fontSize: 15,
    color: COLORS.cream,
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  sectionItem: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
    marginBottom: 4,
    paddingLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 22,
  },
  facetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 240, 230, 0.1)',
  },
  facetaCodigo: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.7,
  },
  facetaScore: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.cream,
  },
});

export default MandalaInterativa;
