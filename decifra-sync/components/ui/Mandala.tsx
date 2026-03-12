import { View, Dimensions } from 'react-native';
  import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
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

  export function Mandala({ scores, size = 300 }: MandalaProps) {
    const center = size / 2;
    const maxRadius = (size / 2) - 40;
    
    const fatoresOrdenados: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
    const scoresOrdenados = fatoresOrdenados.map(fator =>
      scores.find(s => s.fator === fator) || { fator, percentil: 50 }
    );

    const calcularPonto = (percentil: number, index: number) => {
      const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
      const radius = (percentil / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    };

    const pontos = scoresOrdenados.map((score, index) =>
      calcularPonto(score.percentil, index)
    );

    const pontosString = pontos.map(p => `${p.x},${p.y}`).join(' ');

    const calcularLabelPonto = (index: number) => {
      const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
      const radius = maxRadius + 20;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    };

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={maxRadius * ratio}
              stroke={COLORS.inputBorder}
              strokeWidth="1"
              fill="none"
            />
          ))}

          {scoresOrdenados.map((_, index) => {
            const ponto = calcularLabelPonto(index);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={ponto.x}
                y2={ponto.y}
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
              r="6"
              fill={COLORS.accent}
            />
          ))}

          {scoresOrdenados.map((score, index) => {
            const labelPonto = calcularLabelPonto(index);
            const nomeFator = FATORES[score.fator];
            
            return (
              <SvgText
                key={index}
                x={labelPonto.x}
                y={labelPonto.y}
                fill={COLORS.cream}
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                {nomeFator}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  }
