import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { FATORES } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';
import { COLORS } from '@/constants/colors';

interface MandalaProps {
  scores: Array<{
    fator: FatorKey;
    percentil: number;
  }>;
  size?: number;
}

export function Mandala({ scores, size = 260 }: MandalaProps) {
  const graphSize = size * 0.6; // Gráfico ocupa 60% do espaço
  const center = size / 2;
  const maxRadius = graphSize / 2;
  
  const fatoresOrdenados: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = fatoresOrdenados.map(fator =>
    scores.find(s => s.fator === fator) || { fator, percentil: 50 }
  );

  const calcularPontoSvg = (percentil: number, index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const radius = (percentil / 100) * maxRadius;
    return {
      x: maxRadius + radius * Math.cos(angle),
      y: maxRadius + radius * Math.sin(angle),
    };
  };

  const pontos = scoresOrdenados.map((score, index) =>
    calcularPontoSvg(score.percentil, index)
  );

  const pontosString = pontos.map(p => `${p.x},${p.y}`).join(' ');

  // Calcular posição dos labels ao redor - alinhados com as pontas do pentágono
  const getLabelStyle = (index: number) => {
    // Posições calculadas para alinhar com as pontas do gráfico
    const styles = [
      { top: 8, alignSelf: 'center' },                                    // N - topo
      { right: -10, top: '34%', position: 'absolute' as const },          // E - direita (mais descido)
      { right: '2%', bottom: '8%', position: 'absolute' as const },       // O - baixo direita
      { left: '2%', bottom: '8%', position: 'absolute' as const },        // A - baixo esquerda  
      { left: -18, top: '30%', position: 'absolute' as const },           // C - esquerda (mais pra fora e descido)
    ];
    return styles[index];
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Labels ao redor */}
      {scoresOrdenados.map((score, index) => (
        <Text
          key={`label-${index}`}
          style={[
            styles.label,
            getLabelStyle(index),
          ]}
          numberOfLines={1}
        >
          {FATORES[score.fator]}
        </Text>
      ))}

      {/* Gráfico SVG no centro */}
      <View style={styles.graphContainer}>
        <Svg width={graphSize} height={graphSize}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
            <Circle
              key={i}
              cx={maxRadius}
              cy={maxRadius}
              r={maxRadius * ratio}
              stroke={COLORS.inputBorder}
              strokeWidth="1"
              fill="none"
            />
          ))}

          {scoresOrdenados.map((_, index) => {
            const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
            const x2 = maxRadius + maxRadius * Math.cos(angle);
            const y2 = maxRadius + maxRadius * Math.sin(angle);
            return (
              <Line
                key={index}
                x1={maxRadius}
                y1={maxRadius}
                x2={x2}
                y2={y2}
                stroke={COLORS.inputBorder}
                strokeWidth="1"
              />
            );
          })}

          <Polygon
            points={pontosString}
            fill="rgba(232, 75, 43, 0.3)"
            stroke={COLORS.accent}
            strokeWidth="3"
          />

          {pontos.map((ponto, index) => (
            <Circle
              key={index}
              cx={ponto.x}
              cy={ponto.y}
              r="5"
              fill={COLORS.accent}
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  graphContainer: {
    position: 'absolute',
    top: '22%',
    left: '22%',
    width: '56%',
    height: '56%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.cream,
    textAlign: 'center',
    paddingHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
