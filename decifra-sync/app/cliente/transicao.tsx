/**
 * Tela de Transição entre Estações - DECIFRA
 * 
 * Experiência ritualística de pausa entre as estações do teste
 * Com animações suaves e mensagens inspiradoras
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { STATION_THEMES } from '@/constants/colors-artio';
import { COLORS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

const MENSAGENS_TRANSICAO: Record<number, string> = {
  1: 'Você explorou como pensa e processa o mundo. Agora vamos descobrir como você age.',
  2: 'Você revelou seus padrões de ação. Prepare-se para explorar suas conexões.',
  3: 'Você mergulhou em suas relações. A última estação revelará como você reage aos desafios.',
};

export default function TransicaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { clienteId, estacaoAtual, proximaEstacao } = params;
  const estacaoNum = parseInt(proximaEstacao as string) as 1 | 2 | 3 | 4;
  const temaEstacao = STATION_THEMES[estacaoNum];
  
  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const iconAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Feedback tátil de transição
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Sequência de animação
    const sequence = Animated.sequence([
      // Fade in inicial
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Pausa para leitura
      Animated.delay(2000),
      
      // Ícone aparece
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      
      // Pausa com pulsação
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        Animated.delay(3000),
      ]),
      
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(() => {
      // Navegar para próxima estação
      router.replace({
        pathname: '/cliente/teste',
        params: {
          clienteId: clienteId as string,
          estacao: String(proximaEstacao),
        },
      });
    });

    return () => {
      sequence.stop();
    };
  }, []);

  const getIcon = () => {
    switch (temaEstacao.icon) {
      case 'cloud': return '☁️';
      case 'mountain': return '⛰️';
      case 'water': return '💧';
      case 'flame': return '🔥';
      default: return '✨';
    }
  };

  const mensagem = MENSAGENS_TRANSICAO[parseInt(estacaoAtual as string)] || 
    'Preparando a próxima etapa da sua jornada...';

  return (
    <LinearGradient colors={temaEstacao.gradient} style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          }
        ]}
      >
        {/* Elemento decorativo */}
        <Animated.View 
          style={[
            styles.elementIcon,
            { 
              opacity: iconAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <Text style={[styles.iconText, { color: temaEstacao.color }]}>
            {getIcon()}
          </Text>
        </Animated.View>

        {/* Informação da estação */}
        <View style={styles.stationInfo}>
          <Text style={styles.estacaoLabel}>
            Estação {estacaoNum} de 4
          </Text>
          <Text style={styles.estacaoNome}>{temaEstacao.name}</Text>
          <Text style={styles.estacaoSubtitulo}>{temaEstacao.subtitle}</Text>
        </View>

        {/* Mensagem de transição */}
        <View style={styles.mensagemContainer}>
          <Text style={styles.mensagem}>{mensagem}</Text>
        </View>

        {/* Barra de progresso visual */}
        <View style={styles.progressoVisual}>
          {[1, 2, 3, 4].map((num) => (
            <View 
              key={num}
              style={[
                styles.progressoDot,
                num <= estacaoNum && [
                  styles.progressoDotAtivo,
                  { backgroundColor: temaEstacao.color }
                ]
              ]}
            />
          ))}
        </View>

        {/* Texto de espera */}
        <Text style={styles.textoEspera}>
          Preparando sua experiência...
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 400,
  },
  elementIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconText: {
    fontSize: 80,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  stationInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  estacaoLabel: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  estacaoNome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  estacaoSubtitulo: {
    fontSize: 16,
    color: COLORS.cream,
    opacity: 0.9,
    textAlign: 'center',
  },
  mensagemContainer: {
    backgroundColor: 'rgba(45, 21, 24, 0.5)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(245, 240, 230, 0.1)',
  },
  mensagem: {
    fontSize: 16,
    color: COLORS.cream,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  progressoVisual: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  progressoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
  },
  progressoDotAtivo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textoEspera: {
    fontSize: 14,
    color: COLORS.cream,
    opacity: 0.6,
    letterSpacing: 1,
  },
});
