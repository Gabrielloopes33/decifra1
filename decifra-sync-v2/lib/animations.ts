/**
 * Animações - DECIFRA
 * 
 * Configurações de animação (versão simplificada sem Reanimated)
 * Usando Animated API do React Native quando necessário
 */

// ============================================
// TIMING CONSTANTS
// ============================================

export const DURATION = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  breathe: 800,
  meditative: 1200,
  ceremony: 2000,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcula o delay para animações escalonadas
 */
export function calculateStaggerDelay(
  index: number, 
  baseDelay: number = 0.1,
  initialDelay: number = 0
): number {
  return initialDelay + index * baseDelay;
}

// ============================================
// STAGGER CONFIGURATIONS
// ============================================

export const staggerConfig = {
  fast: { staggerChildren: 0.05 },
  normal: { staggerChildren: 0.1 },
  slow: { staggerChildren: 0.15 },
  ritual: { staggerChildren: 0.2, delayChildren: 0.3 }
} as const;
