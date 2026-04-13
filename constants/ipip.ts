// Fatores do Big Five
  export const FATORES = {
    N: 'Neuroticismo',
    E: 'Extroversão',
    O: 'Abertura',
    A: 'Amabilidade',
    C: 'Conscienciosidade',
  } as const;

  // Facetas (6 por fator = 30 total)
  export const FACETAS = {
    // Neuroticismo
    N1: 'Ansiedade',
    N2: 'Raiva/Hostilidade',
    N3: 'Depressão',
    N4: 'Autoconsciência',
    N5: 'Imoderação',
    N6: 'Vulnerabilidade',
    
    // Extroversão
    E1: 'Cordialidade',
    E2: 'Gregariedade',
    E3: 'Assertividade',
    E4: 'Nível de Atividade',
    E5: 'Busca de Sensações',
    E6: 'Emoções Positivas',
    
    // Abertura
    O1: 'Fantasia',
    O2: 'Estética',
    O3: 'Sentimentos',
    O4: 'Ações',
    O5: 'Ideias',
    O6: 'Valores',
    
    // Amabilidade
    A1: 'Confiança',
    A2: 'Franqueza',
    A3: 'Altruísmo',
    A4: 'Complacência',
    A5: 'Modéstia',
    A6: 'Sensibilidade',
    
    // Conscienciosidade
    C1: 'Competência',
    C2: 'Ordem',
    C3: 'Senso de Dever',
    C4: 'Esforço por Realizações',
    C5: 'Autodisciplina',
    C6: 'Ponderação',
  } as const;

  // Mapeamento de questões para facetas (120 itens, 4 por faceta)
  export const QUESTAO_FACETA_MAP: Record<number, keyof typeof FACETAS> = {
    // Neuroticismo
    1: 'N1', 31: 'N1', 61: 'N1', 91: 'N1',
    2: 'N2', 32: 'N2', 62: 'N2', 92: 'N2',
    3: 'N3', 33: 'N3', 63: 'N3', 93: 'N3',
    4: 'N4', 34: 'N4', 64: 'N4', 94: 'N4',
    5: 'N5', 35: 'N5', 65: 'N5', 95: 'N5',
    6: 'N6', 36: 'N6', 66: 'N6', 96: 'N6',
    
    // Extroversão
    7: 'E1', 37: 'E1', 67: 'E1', 97: 'E1',
    8: 'E2', 38: 'E2', 68: 'E2', 98: 'E2',
    9: 'E3', 39: 'E3', 69: 'E3', 99: 'E3',
    10: 'E4', 40: 'E4', 70: 'E4', 100: 'E4',
    11: 'E5', 41: 'E5', 71: 'E5', 101: 'E5',
    12: 'E6', 42: 'E6', 72: 'E6', 102: 'E6',
    
    // Abertura
    13: 'O1', 43: 'O1', 73: 'O1', 103: 'O1',
    14: 'O2', 44: 'O2', 74: 'O2', 104: 'O2',
    15: 'O3', 45: 'O3', 75: 'O3', 105: 'O3',
    16: 'O4', 46: 'O4', 76: 'O4', 106: 'O4',
    17: 'O5', 47: 'O5', 77: 'O5', 107: 'O5',
    18: 'O6', 48: 'O6', 78: 'O6', 108: 'O6',
    
    // Amabilidade
    19: 'A1', 49: 'A1', 79: 'A1', 109: 'A1',
    20: 'A2', 50: 'A2', 80: 'A2', 110: 'A2',
    21: 'A3', 51: 'A3', 81: 'A3', 111: 'A3',
    22: 'A4', 52: 'A4', 82: 'A4', 112: 'A4',
    23: 'A5', 53: 'A5', 83: 'A5', 113: 'A5',
    24: 'A6', 54: 'A6', 84: 'A6', 114: 'A6',
    
    // Conscienciosidade
    25: 'C1', 55: 'C1', 85: 'C1', 115: 'C1',
    26: 'C2', 56: 'C2', 86: 'C2', 116: 'C2',
    27: 'C3', 57: 'C3', 87: 'C3', 117: 'C3',
    28: 'C4', 58: 'C4', 88: 'C4', 118: 'C4',
    29: 'C5', 59: 'C5', 89: 'C5', 119: 'C5',
    30: 'C6', 60: 'C6', 90: 'C6', 120: 'C6',
  };

  // Questões invertidas (pontuação reversa)
  export const QUESTOES_INVERTIDAS = [
    1, 3, 7, 9, 13, 19, 23, 25, 31, 33, 37, 39, 43, 49, 53, 55, 61, 63, 67, 69,
    73, 79, 83, 85, 91, 93, 97, 99, 103, 109, 113, 115
  ];

  // Estações temáticas (30 questões cada)
  export const ESTACOES = {
    1: { nome: 'Autoconhecimento', questoes: Array.from({length: 30}, (_, i) => i + 1) },
    2: { nome: 'Relacionamentos', questoes: Array.from({length: 30}, (_, i) => i + 31) },
    3: { nome: 'Realizações', questoes: Array.from({length: 30}, (_, i) => i + 61) },
    4: { nome: 'Equilíbrio', questoes: Array.from({length: 30}, (_, i) => i + 91) },
  };

// Descrições das facetas para exibição detalhada
export const FACETAS_DESCRICAO: Record<keyof typeof FACETAS, string> = {
  // Neuroticismo
  N1: 'Tendência a sentir tensão, preocupação e nervosismo. Pessoas com score alto experimentam ansiedade frequente.',
  N2: 'Tendência a sentir raiva, frustração e hostilidade quando as coisas não vão como desejado.',
  N3: 'Tendência a sentir tristeza, desesperança e desinteresse pelas atividades da vida.',
  N4: 'Consciência de como outros a percebem; sensibilidade a situações sociais desconfortáveis.',
  N5: 'Tendência a agir por impulso sem considerar as consequências; dificuldade em resistir às tentações.',
  N6: 'Capacidade de lidar com estresse e situações difíceis; sensibilidade a pressões externas.',
  
  // Extroversão
  E1: 'Afeição genuína e calorosa pelos outros; tendência a expressar afeto de forma sincera.',
  E2: 'Gosto pela companhia de outras pessoas; busca ativa por interação social e grupos.',
  E3: 'Disposição para falar, liderar e expressar opiniões; capacidade de impor-se socialmente.',
  E4: 'Nível de energia e ritmo de vida; preferência por um estilo de vida acelerado e dinâmico.',
  E5: 'Busca por experiências emocionantes, variedade e aventura; abertura a novidades.',
  E6: 'Tendência a experimentar emoções positivas como alegria, entusiasmo e otimismo.',
  
  // Abertura
  O1: 'Imaginação vívida e criativa; tendência a sonhar acordado e criar mundos mentais.',
  O2: 'Apreciação pela arte, beleza e estética; sensibilidade a experiências sensoriais refinadas.',
  O3: 'Reconhecimento dos próprios sentimentos e emoções; capacidade de compreender estados internos.',
  O4: 'Abertura a novas experiências e atividades; disposição para tentar coisas diferentes.',
  O5: 'Curiosidade intelectual e interesse por ideias complexas; gosto por discussões filosóficas.',
  O6: 'Disposição a reconsiderar valores sociais, políticos e religiosos; tolerância a diferentes visões.',
  
  // Amabilidade
  A1: 'Presunção de que os outros são bem-intencionados; tendência a confiar nas pessoas.',
  A2: 'Franqueza e sinceridade nas interações; disposição para ser direto sem ser rude.',
  A3: 'Preocupação com o bem-estar dos outros; disposição para ajudar sem esperar retorno.',
  A4: 'Tendência a cooperar e evitar conflitos; capacidade de ceder e ser flexível.',
  A5: 'Modéstia e humildade; disposição para subestimar conquistas e não buscar destaque.',
  A6: 'Sensibilidade às emoções dos outros; capacidade de simpatizar e compadecer-se.',
  
  // Conscienciosidade
  C1: 'Confiança nas próprias habilidades; sensação de competência e eficácia pessoal.',
  C2: 'Organização e ordem pessoal; preferência por ambientes estruturados e planejados.',
  C3: 'Senso de obrigação e dever; compromisso com responsabilidades e promessas.',
  C4: 'Aspiração por excelência e realização; disposição para trabalhar duro para atingir metas.',
  C5: 'Capacidade de persistir em tarefas difíceis; autocontrole e resistência à procrastinação.',
  C6: 'Reflexão cuidadosa antes de agir; tendência a pensar nas consequências das ações.',
};

export type FatorKey = keyof typeof FATORES;
export type FacetaKey = keyof typeof FACETAS;
  