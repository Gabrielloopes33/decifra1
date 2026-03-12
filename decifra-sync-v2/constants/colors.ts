/**
 * Sistema de Cores DECIFRA
 * 
 * @deprecated Use constants/colors-artio.ts para novos desenvolvimentos
 * Este arquivo é mantido para compatibilidade com código existente
 */

import { COLORS_ARTIO, GRADIENTS } from './colors-artio';

// Re-exportar da nova paleta Ártio
export const COLORS = {
  // Mapeamento das cores antigas para a nova paleta
  dark1: COLORS_ARTIO.vinhoDeep,
  dark2: COLORS_ARTIO.vinhoDark,
  dark3: COLORS_ARTIO.vinho,
  dark4: COLORS_ARTIO.vinhoLight,
  accent: COLORS_ARTIO.terracota,
  accentGlow: COLORS_ARTIO.terracotaLight,
  accentSoft: COLORS_ARTIO.terracotaDark,
  cream: COLORS_ARTIO.cream,
  creamLight: COLORS_ARTIO.creamLight,
  creamDark: COLORS_ARTIO.creamDark,
  white: '#FFFFFF',
  textPrimary: COLORS_ARTIO.cream,
  textSecondary: 'rgba(245, 240, 230, 0.7)',
  textMuted: 'rgba(245, 240, 230, 0.5)',
  cardBg: 'rgba(61, 26, 30, 0.7)',
  cardBorder: 'rgba(196, 90, 61, 0.3)',
  inputBg: 'rgba(45, 21, 24, 0.5)',
  inputBorder: 'rgba(245, 240, 230, 0.2)',
  success: COLORS_ARTIO.success,
  warning: COLORS_ARTIO.warning,
  error: COLORS_ARTIO.error,
  gradient: GRADIENTS.primary,
  gradientAccent: GRADIENTS.dark,
  gradientButton: GRADIENTS.button,
  
  // Novas cores Ártio (adicione conforme necessário)
  terracota: COLORS_ARTIO.terracota,
  vinho: COLORS_ARTIO.vinho,
  ocre: COLORS_ARTIO.ocre,
};

// Re-exportar a paleta completa
export { COLORS_ARTIO, GRADIENTS } from './colors-artio';

// SHADOWS para compatibilidade
export const SHADOWS = {
  card: {
    shadowColor: '#2D1518',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#C45A3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    shadowColor: '#C45A3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  floating: {
    shadowColor: '#2D1518',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#E86645',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
};
