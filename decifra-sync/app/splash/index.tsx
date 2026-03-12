import { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, COLORS_ARTIO, GRADIENTS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

/**
 * Tela de Splash Animada - DECIFRA
 * 
 * Animação de entrada com:
 * - Pulsação suave do ícone (efeito respiração)
 * - Fade in do nome DECIFRA
 * - Transição suave para tela principal
 */
export default function SplashScreen() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Valores animados
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  const glowAnim = useState(new Animated.Value(0))[0];
  const textOpacityAnim = useState(new Animated.Value(0))[0];
  const textSlideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    // Sequência de animação
    const animationSequence = Animated.sequence([
      // 1. Fade in do ícone com scale
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // 2. Animação de pulsação (respiração)
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // 3. Fade in do texto DECIFRA
      Animated.parallel([
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // 4. Pausa para leitura
      Animated.delay(800),

      // 5. Fade out completo
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      setAnimationComplete(true);
      // Navegar para tela principal
      router.replace('/');
    });

    return () => {
      animationSequence.stop();
    };
  }, []);

  // Interpolação para o glow
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <LinearGradient
      colors={[...GRADIENTS.splash]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Glow effect behind icon */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Icon container */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Eye icon - simplified version */}
          <View style={styles.icon}>
            <View style={styles.eyeOuter}>
              <View style={styles.eyeInner}>
                <View style={styles.pupil}>
                  <View style={styles.highlight} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacityAnim,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <Animated.Text style={styles.title}>DECIFRA</Animated.Text>
          <Animated.Text style={styles.subtitle}>
            Arquitetura Emocional
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Loading indicator at bottom */}
      <Animated.View
        style={[
          styles.loadingContainer,
          { opacity: textOpacityAnim },
        ]}
      >
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: textOpacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
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
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS_ARTIO.terracota,
    opacity: 0.3,
  },
  iconContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOuter: {
    width: 140,
    height: 80,
    borderRadius: 70,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  eyeInner: {
    width: 120,
    height: 60,
    borderRadius: 60,
    backgroundColor: GRADIENTS.splash[1],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS_ARTIO.terracota,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cream,
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    letterSpacing: 8,
    textShadowColor: COLORS_ARTIO.terracota,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.cream,
    opacity: 0.8,
    marginTop: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: 200,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(245, 240, 230, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: COLORS_ARTIO.terracota,
    borderRadius: 2,
  },
});
