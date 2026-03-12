/**
 * Mandala - DECIFRA
 * 
 * Gráfico radar dos 5 fatores Big Five
 * Versão simplificada sem Reanimated
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { FATORES } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';
import { COLORS } from '@/constants/colors';
import { COLORS_ARTIO } from '@/constants/colors-artio';

const { width } = Dimensions.get('window');
const SIZE = width * 0.85;

// Cores para cada fator
const FATOR_COLORS: Record<FatorKey, string> = {
  N: '#E74C3C',  // Vermelho - Neuroticismo
  E: '#F39C12',  // Laranja - Extroversão
  O: '#9B59B6',  // Roxo - Abertura
  A: '#27AE60',  // Verde - Amabilidade
  C: '#3498DB',  // Azul - Conscienciosidade
};

interface MandalaAnimadaProps {
  scores: Array<{
    fator: FatorKey;
    percentil: number;
  }>;
  animated?: boolean;
  size?: number;
  duration?: number;
}

export function MandalaAnimada({
  scores,
  size = SIZE,
}: MandalaAnimadaProps) {
  const center = size / 2;
  const maxRadius = (size / 2) - 40;
  
  const fatoresOrdenados: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = fatoresOrdenados.map(fator =>
    scores.find(s => s.fator === fator) || { fator, percentil: 50 }
  );

  // Calcular pontos
  const calcularPonto = (percentil: number, index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = (percentil / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Pontos para labels
  const calcularLabelPonto = (index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = maxRadius + 25;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Pontos dos círculos de dados
  const pontosDados = scoresOrdenados.map((score, index) =>
    calcularPonto(score.percentil, index)
  );

  // Pontos do polígono
  const polygonPoints = pontosDados.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Círculos de fundo (grid) */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
          <Circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={maxRadius * ratio}
            stroke="rgba(245, 240, 230, 0.15)"
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
              x1={center}
              y1={center}
              x2={ponto.x}
              y2={ponto.y}
              stroke="rgba(245, 240, 230, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Polígono de dados */}
        <Polygon
          points={polygonPoints}
          fill={COLORS_ARTIO.terracota}
          fillOpacity={0.4}
          stroke={COLORS_ARTIO.terracotaLight}
          strokeWidth="2.5"
        />

        {/* Círculos nos vértices */}
        {pontosDados.map((ponto, index) => (
          <Circle
            key={`point-${index}`}
            cx={ponto.x}
            cy={ponto.y}
            r="6"
            fill={FATOR_COLORS[fatoresOrdenados[index]]}
            stroke={COLORS.creamLight}
            strokeWidth="2"
          />
        ))}

        {/* Labels dos fatores */}
        {scoresOrdenados.map((score, index) => {
          const labelPonto = calcularLabelPonto(index);
          const nomeFator = FATORES[score.fator];
          
          return (
            <SvgText
              key={`label-${index}`}
              x={labelPonto.x}
              y={labelPonto.y}
              fill={COLORS.cream}
              fontSize="13"
              fontWeight="600"
              textAnchor="middle"
            >
              {nomeFator}
            </SvgText>
          );
        })}

        {/* Centro */}
        <Circle
          cx={center}
          cy={center}
          r="4"
          fill={COLORS.cream}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MandalaAnimada;
