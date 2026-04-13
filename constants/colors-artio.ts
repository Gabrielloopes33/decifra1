/**
 * Sistema de Cores - Identidade Visual Ártio
 * 
 * Paleta extraída do ícone oficial do DECIFRA
 * Terracota → Vinho escuro (gradiente principal)
 */

// Cores primárias (do ícone)
export const COLORS_ARTIO = {
  // Terracota (quente, energia, ação)
  terracota: '#C45A3D',
  terracotaLight: '#E86645',
  terracotaDark: '#A04025',
  
  // Vinho (profundidade, introspecção, mistério)
  vinho: '#6B2D3A',
  vinhoDark: '#3D1A1E',
  vinhoDeep: '#2D1518',
  vinhoLight: '#8B3D4A',
  
  // Ocre/Sepia (terra, estabilidade)
  ocre: '#C4A77D',
  ocreLight: '#D9BE94',
  ocreDark: '#8A7555',
  
  // Neutros (do ícone - off-white)
  cream: '#F5F0E6',
  creamDark: '#E8E0D1',
  creamLight: '#FAF8F3',
  offWhite: '#FAF8F3',
  
  // Cores das 4 estações (elementos)
  air: '#5B8A8A',      // Estação 1 - Como você pensa (Ar)
  earth: '#C4A77D',    // Estação 2 - Como você age (Terra)
  water: '#4A6FA5',    // Estação 3 - Como você conecta (Água)
  fire: '#B85C38',     // Estação 4 - Como você reage (Fogo)
  
  // Semânticas
  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FFA726',
  warningLight: '#FFB74D',
  error: '#FF5252',
  errorLight: '#FF867C',
  info: '#4A6FA5',
  infoLight: '#7B9BC0',
  
  // Utilitários
  overlay: 'rgba(45, 21, 24, 0.7)',
  overlayLight: 'rgba(245, 240, 230, 0.1)',
  border: 'rgba(196, 90, 61, 0.3)',
  borderLight: 'rgba(245, 240, 230, 0.2)',
} as const;

// Gradientes pré-definidos
export const GRADIENTS = {
  // Principal: fundo das telas
  primary: ['#C45A3D', '#6B2D3A', '#3D1A1E'] as const,
  
  // Dark: para cards e elementos elevados
  dark: ['#3D1A1E', '#2D1518'] as const,
  
  // Button: para botões primários
  button: ['#E86645', '#C45A3D'] as const,
  buttonHover: ['#C45A3D', '#A04025'] as const,
  
  // Splash screen
  splash: ['#C45A3D', '#6B2D3A', '#3D1A1E', '#2D1518'] as const,
  
  // Estações
  station1: ['#5B8A8A', '#3D5A5A'] as const,  // Ar
  station2: ['#C4A77D', '#8A7555'] as const,  // Terra
  station3: ['#4A6FA5', '#2D4569'] as const,  // Água
  station4: ['#B85C38', '#7A3D24'] as const,  // Fogo
} as const;

// Sombras
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
} as const;

// Bordas
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// Espaçamento
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Tipografia
export const TYPOGRAPHY = {
  hero: { size: 40, weight: '700' as const, lineHeight: 48, letterSpacing: 2 },
  h1: { size: 32, weight: '700' as const, lineHeight: 40, letterSpacing: 0.5 },
  h2: { size: 24, weight: '600' as const, lineHeight: 32, letterSpacing: 0 },
  h3: { size: 20, weight: '600' as const, lineHeight: 28, letterSpacing: 0 },
  body: { size: 16, weight: '400' as const, lineHeight: 24, letterSpacing: 0 },
  bodySmall: { size: 14, weight: '400' as const, lineHeight: 20, letterSpacing: 0 },
  caption: { size: 12, weight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
  button: { size: 16, weight: '600' as const, lineHeight: 24, letterSpacing: 0.5 },
} as const;

// Animação
export const ANIMATION = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  breathe: 800,
  meditative: 1200,
  ceremony: 2000,
} as const;

// Temas das estações
export const STATION_THEMES = {
  1: {
    id: 1,
    name: 'Como você pensa',
    subtitle: 'Cognição e Perspectiva',
    color: COLORS_ARTIO.air,
    gradient: GRADIENTS.station1,
    icon: 'cloud',
    element: 'air',
    description: 'Exploramos seus padrões de pensamento, criatividade e forma de processar informações.',
    textPrimary: COLORS_ARTIO.vinhoDeep,
    textSecondary: COLORS_ARTIO.vinhoDark,
  },
  2: {
    id: 2,
    name: 'Como você age',
    subtitle: 'Ação e Comportamento',
    color: COLORS_ARTIO.earth,
    gradient: GRADIENTS.station2,
    icon: 'mountain',
    element: 'earth',
    description: 'Entendemos seus hábitos, ritmos e maneira de se relacionar com o mundo físico.',
    textPrimary: COLORS_ARTIO.vinhoDeep,
    textSecondary: COLORS_ARTIO.vinhoDark,
  },
  3: {
    id: 3,
    name: 'Como você conecta',
    subtitle: 'Relacionamentos e Emoções',
    color: COLORS_ARTIO.water,
    gradient: GRADIENTS.station3,
    icon: 'water',
    element: 'water',
    description: 'Mapeamos sua forma de criar vínculos, expressar emoções e se conectar com outros.',
    textPrimary: COLORS_ARTIO.creamLight,
    textSecondary: COLORS_ARTIO.cream,
  },
  4: {
    id: 4,
    name: 'Como você reage',
    subtitle: 'Instintos e Energia',
    color: COLORS_ARTIO.fire,
    gradient: GRADIENTS.station4,
    icon: 'flame',
    element: 'fire',
    description: 'Revelamos seus padrões de reação, impulsos e forma de lidar com desafios.',
    textPrimary: COLORS_ARTIO.creamLight,
    textSecondary: COLORS_ARTIO.cream,
  },
} as const;

// Helper para obter tema da estação
export function getStationTheme(estacao: 1 | 2 | 3 | 4) {
  return STATION_THEMES[estacao];
}
