/**
 * Nova Interpretação Principal - DECIFRA
 * 
 * Gera uma interpretação completa e empoderadora do perfil Big Five
 * Inclui: perfil dominante, características secundárias, combinações,
 * traços a desenvolver, visão geral dos 5 fatores e resumo do perfil.
 */

import { getInterpretacao, FatorKey, Faixa, FATOR_TITULOS, FATOR_ICONES } from '@/constants/interpretacoes';
import { FATORES, FACETAS } from '@/constants/ipip';
import { COLORS } from '@/constants/colors';

// ============================================
// TIPOS E INTERFACES
// ============================================

export type Classificacao = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';

export interface ScoreFator {
  fator: FatorKey;
  score: number;
  percentil: number;
  classificacao: Classificacao;
}

export interface ScoreFaceta {
  faceta: string;
  score: number;
  percentil: number;
  classificacao: Classificacao;
}

export interface ProtocoloRecomendado {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: number;
}

export interface PerfilDominante {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  titulo: string;
  subtitulo: string;
  descricao: string;
  textoComplementar: string; // Texto que menciona outros aspectos
}

export interface VisaoGeralFator {
  fator: FatorKey;
  nome: string;
  icone: string;
  percentil: number;
  classificacao: Classificacao;
  descricaoBreve: string;
  precisaAtencao: boolean;
  corIndicador: string;
}

export interface CaracteristicaSecundaria {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  tipo: 'forte_alta' | 'forte_baixa' | 'equilibrio';
  descricaoCurta: string;
  comoComplementa: string;
  precisaAtencao: boolean;
}

export interface CombinacaoFator {
  id: string;
  nome: string;
  fatores: FatorKey[];
  descricao: string;
  implicacoes: string[];
  corDestaque: string;
}

export interface TraçoDesenvolver {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  descricaoEmpoderada: string;
  beneficios: string[];
  protocolosRelacionados: string[];
}

export interface ResumoPerfil {
  fraseSintese: string;
  arquetipo: string;
  emojiPerfil: string;
  palavrasChave: string[];
}

export interface InterpretacaoPrincipalCompleta {
  perfilDominante: PerfilDominante;
  visaoGeral: VisaoGeralFator[]; // Todos os 5 fatores
  caracteristicasSecundarias: CaracteristicaSecundaria[];
  combinacoesDetectadas: CombinacaoFator[];
  tracosDesenvolver: TraçoDesenvolver[];
  resumo: ResumoPerfil;
  geradoEm: Date;
  versaoAlgoritmo: string;
}

// ============================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================

const CONFIG = {
  LIMITE_FORTE_ALTA: 75,
  LIMITE_FORTE_BAIXA: 25,
  LIMITE_COMBINACAO_ALTA: 65,
  LIMITE_COMBINACAO_BAIXA: 35,
  MAX_CARACTERISTICAS_SECUNDARIAS: 4, // Mostrar todos os 4 outros fatores
  MAX_COMBINACOES: 2,
  MAX_TRACOS_DESENVOLVER: 3,
};

// ============================================
// DICIONÁRIO DE ÍCONES E CORES POR FATOR
// ============================================

const FATOR_VISUAL: Record<FatorKey, { icone: string; cor: string }> = {
  N: { icone: '🧠', cor: '#9B59B6' }, // Neuroticismo - Roxo
  E: { icone: '⚡', cor: '#F39C12' }, // Extroversão - Laranja
  O: { icone: '🔮', cor: '#3498DB' }, // Abertura - Azul
  A: { icone: '❤️', cor: '#E91E63' }, // Amabilidade - Rosa
  C: { icone: '📋', cor: '#27AE60' }, // Conscienciosidade - Verde
};

// Cores para classificações
const CORES_CLASSIFICACAO: Record<Classificacao, string> = {
  'Muito Alto': '#27AE60',
  'Alto': '#2ECC71',
  'Médio': '#F39C12',
  'Baixo': '#E67E22',
  'Muito Baixo': '#E74C3C',
};

// ============================================
// DICIONÁRIO DE COMBINAÇÕES
// ============================================

const COMBINACOES: Record<string, CombinacaoFator> = {
  'VISIONARIA_REALIZADORA': {
    id: 'VISIONARIA_REALIZADORA',
    nome: 'A Visionária Realizadora',
    fatores: ['O', 'C'],
    descricao: 'A combinação rara de alta criatividade com alta disciplina. Você imagina o impossível e tem a determinação para torná-lo real.',
    implicacoes: [
      'Você pode ver oportunidades onde outros veem obstáculos',
      'Tende a ter altos padrões para si mesma',
      'Pode ficar frustrada quando outros não acompanham seu ritmo',
      'Ideal para liderar transformações e inovações'
    ],
    corDestaque: '#9B59B6'
  },
  'SONHADOR_CRIATIVO': {
    id: 'SONHADOR_CRIATIVO',
    nome: 'A Sonhadora Criativa',
    fatores: ['O', 'C'],
    descricao: 'Você tem imaginação fértil e sensibilidade artística, embora às vezes a execução das ideias seja desafiadora.',
    implicacoes: [
      'Ideias abundantes, mas pode ter dificuldade em concluir projetos',
      'Criatividade emocional é seu diferencial',
      'Sistemas leves de organização podem ajudar a materializar suas visões',
      'Colaborar com pessoas organizadas pode ser muito produtivo'
    ],
    corDestaque: '#E67E22'
  },
  'SENSIVEL_DESORGANIZADA': {
    id: 'SENSIVEL_DESORGANIZADA',
    nome: 'A Sensível em Desenvolvimento',
    fatores: ['N', 'C'],
    descricao: 'Emoções intensas combinadas com dificuldade em manter estrutura. Necessita de apoio para organizar a vida interna e externa.',
    implicacoes: [
      'Pode sentir-se sobrecarregada facilmente',
      'A desorganização aumenta a ansiedade',
      'Rotinas simples trazem grande alívio',
      'Terapeutas ou coaches podem acelerar seu desenvolvimento'
    ],
    corDestaque: '#E74C3C'
  },
  'PERFEICIONISTA_ANSIOSA': {
    id: 'PERFEICIONISTA_ANSIOSA',
    nome: 'A Perfeccionista Comprometida',
    fatores: ['N', 'C'],
    descricao: 'Alto padrão de excelência combinado com autoexigência intensa. Cuidado com burnout.',
    implicacoes: [
      'Excelente para qualidade, mas pode paralisar-se com perfeccionismo',
      'Precisa aprender a dizer "bom o suficiente"',
      'Autocrítica pode ser muito severa',
      'Descanso é essencial, não luxo'
    ],
    corDestaque: '#8E44AD'
  },
  'CONECTORA_SOCIAL': {
    id: 'CONECTORA_SOCIAL',
    nome: 'A Conectora Social',
    fatores: ['E', 'A'],
    descricao: 'Energia social combinada com calor humano genuíno. Naturalmente cria comunidade e conecta pessoas.',
    implicacoes: [
      'Pessoas se sentem bem na sua presença',
      'Networking acontece naturalmente',
      'Precisa aprender a estabelecer limites para não se sobrecarregar',
      'Ideal para papéis de acolhimento e integração'
    ],
    corDestaque: '#F39C12'
  },
  'LIDER_DETERMINADA': {
    id: 'LIDER_DETERMINADA',
    nome: 'A Líder Determinada',
    fatores: ['E', 'A'],
    descricao: 'Carisma e assertividade combinados com foco em resultados. Excelente para liderança executiva.',
    implicacoes: [
      'Capacidade natural de influenciar outros',
      'Atenção para não sobrecarregar pessoas mais sensíveis',
      'Honestidade direta pode ser percebida como frieza',
      'Empatia estratégica fortalece sua liderança'
    ],
    corDestaque: '#E74C3C'
  },
  'APOIADORA_SILENCIOSA': {
    id: 'APOIADORA_SILENCIOSA',
    nome: 'A Apoiadora Silenciosa',
    fatores: ['E', 'A'],
    descricao: 'Prefere ajudar nos bastidores. Profundidade em poucas relações.',
    implicacoes: [
      'Amizades duradouras e significativas',
      'Pode ser subestimada por não se promover',
      'Importante expressar necessidades aos outros',
      'Equipes precisam reconhecer sua contribuição'
    ],
    corDestaque: '#27AE60'
  },
  'TRADICIONALISTA_RESERVADA': {
    id: 'TRADICIONALISTA_RESERVADA',
    nome: 'A Tradicionalista Reservada',
    fatores: ['E', 'O'],
    descricao: 'Valoriza estabilidade, rotina e grupos próximos. Mudanças precisam de tempo.',
    implicacoes: [
      'Confiável e previsível',
      'Excelente em manter sistemas funcionando',
      'Mudanças abruptas causam desconforto',
      'Segurança é valor fundamental'
    ],
    corDestaque: '#3498DB'
  },
  'EXPLORADORA_ENTUSIASTA': {
    id: 'EXPLORADORA_ENTUSIASTA',
    nome: 'A Exploradora Entusiasta',
    fatores: ['O', 'E'],
    descricao: 'Curiosidade intelectual + energia social = sempre buscando novas experiências. Não suporta tédio.',
    implicacoes: [
      'Ampla rede de contatos diversificada',
      'Pode ter dificuldade em aprofundar',
      'Ideal para papéis de inovação e descoberta',
      'Rotina é desafiadora'
    ],
    corDestaque: '#9B59B6'
  },
  'EMPATICA_SENSIVEL': {
    id: 'EMPATICA_SENSIVEL',
    nome: 'A Empática Sensível',
    fatores: ['N', 'A'],
    descricao: 'Sente intensamente o que outros sentem. Fronteira emocional tênue. Cuidado com exaustão empática.',
    implicacoes: [
      'Conexões profundas são naturais',
      'Pode absorver emoções alheias',
      'Necessita de tempo sozinha para recarregar',
      'Terapia e mindfulness são aliados importantes'
    ],
    corDestaque: '#E91E63'
  },
  'ROCHA_CONFIAVEL': {
    id: 'ROCHA_CONFIAVEL',
    nome: 'A Rocha Confiável',
    fatores: ['N', 'C'],
    descricao: 'Estabilidade emocional + disciplina = pilar em qualquer equipe ou relacionamento.',
    implicacoes: [
      'Outros confiam em você em crises',
      'Pode ser percebida como distante emocionalmente',
      'Importante expressar vulnerabilidade ocasionalmente',
      'Base sólida para grandes realizações'
    ],
    corDestaque: '#607D8B'
  },
  'OTIMISTA_RESILIENTE': {
    id: 'OTIMISTA_RESILIENTE',
    nome: 'A Otimista Resiliente',
    fatores: ['N', 'E'],
    descricao: 'Energia social sem o drama. Recupera-se rapidamente e contagia positividade.',
    implicacoes: [
      'Ambiente melhora com sua presença',
      'Pode subestimar riscos legítimos',
      'Ideal para liderar mudanças positivas',
      'Resiliência natural inspira outros'
    ],
    corDestaque: '#F1C40F'
  }
};

// ============================================
// ARQUÉTIPOS
// ============================================

const ARQUETIPOS: Record<string, { nome: string; emoji: string }> = {
  'VISIONARIA_REALIZADORA': { nome: 'Visionária Realizadora', emoji: '🚀' },
  'SONHADOR_CRIATIVO': { nome: 'Sonhadora Criativa', emoji: '🌈' },
  'CONECTORA_SOCIAL': { nome: 'Conectora Social', emoji: '🌟' },
  'LIDER_DETERMINADA': { nome: 'Líder Determinada', emoji: '⚡' },
  'EMPATICA_SENSIVEL': { nome: 'Empática Sensível', emoji: '🦋' },
  'EXPLORADORA_ENTUSIASTA': { nome: 'Exploradora Entusiasta', emoji: '🧭' },
  'ROCHA_CONFIAVEL': { nome: 'Rocha Confiável', emoji: '🪨' },
  'OTIMISTA_RESILIENTE': { nome: 'Otimista Resiliente', emoji: '☀️' },
  'APOIADORA_SILENCIOSA': { nome: 'Apoiadora Silenciosa', emoji: '🌙' },
  'TRADICIONALISTA_RESERVADA': { nome: 'Tradicionalista Reservada', emoji: '🏛️' },
  'PERFEICIONISTA_ANSIOSA': { nome: 'Perfeccionista Comprometida', emoji: '💎' },
  'SENSIVEL_DESORGANIZADA': { nome: 'Sensível em Desenvolvimento', emoji: '🌸' },
  'DEFAULT': { nome: 'Potencial Versátil', emoji: '🌱' }
};

// ============================================
// DESCRIÇÕES CURTAS POR FATOR
// ============================================

const DESCRICOES_CURTAS: Record<FatorKey, { alta: string; baixa: string; medio: string }> = {
  N: {
    alta: 'Você experimenta emoções com intensidade e tem consciência aguçada das nuances emocionais.',
    baixa: 'Você mantém a calma em situações de pressão e recupera-se rapidamente de contratempos.',
    medio: 'Você mantém um equilíbrio saudável entre sensibilidade emocional e estabilidade.'
  },
  E: {
    alta: 'Você é energética, comunicativa e ganha energia com interações sociais.',
    baixa: 'Você recupera energia na solidão e prefere ambientes tranquilos e profundos.',
    medio: 'Você se adapta bem tanto a situações sociais quanto a momentos de introspecção.'
  },
  O: {
    alta: 'Você tem curiosidade intelectual, apreciação estética e mente aberta para novas ideias.',
    baixa: 'Você valoriza o concreto, o prático e o testado, trazendo estabilidade e confiabilidade.',
    medio: 'Você equilibra criatividade com praticidade, sabendo quando inovar e quando manter.'
  },
  A: {
    alta: 'Você é naturalmente cooperativa, empática e atenta ao bem-estar dos outros.',
    baixa: 'Você prioriza seus próprios interesses e mantém honestidade direta nas relações.',
    medio: 'Você equilibra seus interesses com os dos outros, sendo flexível nas relações.'
  },
  C: {
    alta: 'Você é altamente organizada, disciplinada e orientada para metas.',
    baixa: 'Você é flexível, espontânea e adapta-se facilmente a mudanças.',
    medio: 'Você equilibra organização com flexibilidade, adaptando-se conforme necessário.'
  }
};

// ============================================
// DESCRIÇÕES BREVES PARA VISÃO GERAL
// ============================================

const DESCRICOES_BREVES: Record<FatorKey, Record<Classificacao, string>> = {
  N: {
    'Muito Alto': 'Você sente emoções com grande intensidade e profundidade.',
    'Alto': 'Você é sensível e percebe nuances emocionais facilmente.',
    'Médio': 'Você equilibra sensibilidade com estabilidade emocional.',
    'Baixo': 'Você mantém a calma e se recupera rapidamente de estresses.',
    'Muito Baixo': 'Você tem base emocional sólida e raramente se abala.'
  },
  E: {
    'Muito Alto': 'Você é naturalmente magnética e energética socialmente.',
    'Alto': 'Você ganha energia com interações e é comunicativa.',
    'Médio': 'Você se adapta a diferentes contextos sociais.',
    'Baixo': 'Você valoriza momentos de tranquilidade e profundidade.',
    'Muito Baixo': 'Você tem riqueza interior e prefere poucas conexões profundas.'
  },
  O: {
    'Muito Alto': 'Você tem visão extraordinária e mente inovadora.',
    'Alto': 'Você é curiosa e aprecia novas experiências.',
    'Médio': 'Você equilibra criatividade com praticidade.',
    'Baixo': 'Você valoriza o concreto e o testado.',
    'Muito Baixo': 'Você traz estabilidade e confiabilidade com foco no prático.'
  },
  A: {
    'Muito Alto': 'Você tem compaixão profunda e cuida intensamente dos outros.',
    'Alto': 'Você é naturalmente cooperativa e empática.',
    'Médio': 'Você equilibra seus interesses com os dos outros.',
    'Baixo': 'Você prioriza seus interesses com honestidade direta.',
    'Muito Baixo': 'Você é autêntica, independente e verdadeira.'
  },
  C: {
    'Muito Alto': 'Você tem padrões excepcionais de organização e disciplina.',
    'Alto': 'Você é confiável, organizada e orientada a metas.',
    'Médio': 'Você equilibra organização com flexibilidade.',
    'Baixo': 'Você é flexível, espontânea e adaptável.',
    'Muito Baixo': 'Você flui naturalmente com as mudanças sem rigidez.'
  }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function classificarParaFaixa(classificacao: string): Faixa {
  const normalized = classificacao.toLowerCase().trim();
  if (normalized.includes('muito') && normalized.includes('baixo')) return 'Muito Baixo';
  if (normalized.includes('baixo')) return 'Baixo';
  if (normalized.includes('muito') && normalized.includes('alto')) return 'Muito Alto';
  if (normalized.includes('alto')) return 'Alto';
  return 'Médio';
}

function getClassificacaoSimplificada(percentil: number): 'alto' | 'medio' | 'baixo' {
  if (percentil >= CONFIG.LIMITE_COMBINACAO_ALTA) return 'alto';
  if (percentil <= CONFIG.LIMITE_COMBINACAO_BAIXA) return 'baixo';
  return 'medio';
}

function precisaAtencao(score: ScoreFator): boolean {
  // Fatores que precisam de atenção para desenvolvimento
  // N muito alto = problemático
  // A muito baixo = problemático
  // C muito baixo = problemático
  // Qualquer fator extremo também merece atenção
  if (score.fator === 'N' && (score.classificacao === 'Muito Alto' || score.classificacao === 'Alto')) {
    return true;
  }
  if (score.fator === 'A' && (score.classificacao === 'Muito Baixo' || score.classificacao === 'Baixo')) {
    return true;
  }
  if (score.fator === 'C' && (score.classificacao === 'Muito Baixo' || score.classificacao === 'Baixo')) {
    return true;
  }
  // Outros extremos também merecem atenção
  if (score.classificacao === 'Muito Alto' || score.classificacao === 'Muito Baixo') {
    return true;
  }
  return false;
}

function calcularComplementariedade(
  fatorDominante: FatorKey,
  fatorSecundario: FatorKey,
  tipo: 'alta' | 'baixa' | 'media'
): string {
  const complementaridades: Record<string, Record<string, string>> = {
    'N': {
      'E_alta': 'Sua energia social pode criar conexões que ajudam a processar emoções intensas de forma construtiva.',
      'E_baixa': 'Sua tendência à introspecção permite processar emoções profundamente antes de expressá-las.',
      'E_media': 'Você equilibra processamento interno com conexões sociais quando necessário.',
      'O_alta': 'Sua mente aberta permite processar emoções complexas de maneiras criativas. Canais artísticos são excelentes vias de expressão.',
      'O_baixa': 'Sua praticidade ajuda a ancorar suas emoções em ações concretas e realistas.',
      'O_media': 'Você equilibra criatividade com praticidade no processamento emocional.',
      'A_alta': 'Sua alta sensibilidade emocional se combina com empatia genuína, tornando você profundamente compreensiva.',
      'A_baixa': 'Sua independência emocional permite processar sentimentos sem depender excessivamente da aprovação alheia.',
      'A_media': 'Você equilibra independência com conexão emocional nos relacionamentos.',
      'C_alta': 'Sua disciplina pode criar estruturas que trazem segurança emocional, reduzindo a ansiedade.',
      'C_baixa': 'Sua flexibilidade permite fluir com as emoções sem julgamentos rígidos.',
      'C_media': 'Você equilibra estrutura com flexibilidade emocional.'
    },
    'E': {
      'N_alta': 'Sua energia social é temperada por sensibilidade, criando conexões significativas.',
      'N_baixa': 'Sua estabilidade emocional torna você uma presença confiável e sem drama social.',
      'N_media': 'Você equilibra expressividade com estabilidade emocional.',
      'O_alta': 'Sua energia se direciona para explorar novas ideias e experiências fascinantes.',
      'O_baixa': 'Sua energia social foca em conexões práticas e concretas do dia a dia.',
      'O_media': 'Você equilibra busca por novidade com valorização do conhecido.',
      'A_alta': 'Você usa sua energia social para criar comunidade e conectar pessoas.',
      'A_baixa': 'Sua assertividade social ajuda a defender suas ideias e liderar com clareza.',
      'A_media': 'Você adapta sua energia social conforme a situação exige.',
      'C_alta': 'Sua energia é canalizada para realizações concretas e metas ambiciosas.',
      'C_baixa': 'Sua espontaneidade traz leveza e diversão para os grupos dos quais participa.',
      'C_media': 'Você equilibra produtividade com momentos de leveza.'
    },
    'O': {
      'N_alta': 'Sua criatividade é alimentada por profundidade emocional, resultando em expressão autêntica.',
      'N_baixa': 'Sua criatividade flui sem ser interrompida por preocupações excessivas.',
      'N_media': 'Você equilibra sensibilidade criativa com estabilidade.',
      'E_alta': 'Você compartilha suas ideias visionárias com entusiasmo e conecta pessoas através delas.',
      'E_baixa': 'Sua criatividade floresce na introspecção, resultando em obras profundas e pessoais.',
      'E_media': 'Você compartilha ideias quando relevante, sem forçar expressão.',
      'A_alta': 'Suas ideias inovadoras são compartilhadas com sensibilidade ao impacto nos outros.',
      'A_baixa': 'Você defende suas ideias visionárias com independência e originalidade.',
      'A_media': 'Você adapta a comunicação de suas ideias conforme o público.',
      'C_alta': 'Você não apenas imagina o futuro - tem a disciplina para construí-lo. Rara combinação!',
      'C_baixa': 'Sua mente cria livremente sem limitações. Colaborar com executores ajuda a materializar visões.',
      'C_media': 'Você equilibra visão criativa com capacidade de execução.'
    },
    'A': {
      'N_alta': 'Você sente profundamente o que outros sentem - uma dádiva e um desafio. Cuidado com exaustão.',
      'N_baixa': 'Você apoia os outros a partir de uma base emocional estável e confiável.',
      'N_media': 'Você combina empatia com estabilidade emocional.',
      'E_alta': 'Você cria conexões calorosas e genuínas com facilidade. Pessoas se sentem acolhidas.',
      'E_baixa': 'Você demonstra cuidado através de presença atenta e apoio consistente.',
      'E_media': 'Você adapta sua expressão de cuidado conforme o contexto.',
      'O_alta': 'Você compreende perspectivas diversas e aceita diferenças com verdadeira abertura.',
      'O_baixa': 'Você demonstra cuidado de formas práticas e concretas, no dia a dia.',
      'O_media': 'Você equilibra aceitação de diferenças com valores próprios.',
      'C_alta': 'Você é confiável e dedicada - outros sabem que podem contar com seu apoio consistente.',
      'C_baixa': 'Você apoia os outros com flexibilidade e sem julgamentos rígidos.',
      'C_media': 'Você equilibra consistência com flexibilidade no apoio aos outros.'
    },
    'C': {
      'N_alta': 'Sua autoexigência busca excelência, mas cuidado para não ser excessivamente crítica consigo mesma.',
      'N_baixa': 'Você executa com excelência mantendo calma e perspectiva equilibrada.',
      'N_media': 'Você equilibra ambição com bem-estar emocional.',
      'E_alta': 'Você lidera com energia e determinação, inspirando outros a alcançarem metas.',
      'E_baixa': 'Você trabalha com foco profundo e consistência, sem necessidade de reconhecimento constante.',
      'E_media': 'Você alterna trabalho focado com colaboração quando necessário.',
      'O_alta': 'Você inova com estrutura - transforma ideias criativas em realizações concretas.',
      'O_baixa': 'Você executa com eficiência e confiabilidade, valorizando o que funciona.',
      'O_media': 'Você equilibra inovação com métodos confiáveis.',
      'A_alta': 'Você é o pilar em que outros confiam - responsável e sempre presente.',
      'A_baixa': 'Você persegue suas metas com independência e foco em resultados.',
      'A_media': 'Você equilibra autonomia com colaboração em equipe.'
    }
  };

  const key = `${fatorSecundario}_${tipo}`;
  return complementaridades[fatorDominante]?.[key] || 
    `Essa característica complementa seu perfil de formas únicas.`;
}

function gerarDescricaoEmpoderada(score: ScoreFator): string {
  const descricoes: Record<FatorKey, Record<Classificacao, string>> = {
    N: {
      'Muito Baixo': 'Você tem uma base emocional extremamente sólida. Sua serenidade é uma âncora para si mesma e para outros.',
      'Baixo': 'Você mantém a calma na maioria das situações. Fortalecer ainda mais sua inteligência emocional pode ajudar a navegar situações complexas com confiança.',
      'Médio': 'Você tem uma base emocional equilibrada. Aprofundar sua consciência emocional pode aumentar sua resiliência.',
      'Alto': 'Você tem sensibilidade emocional aguçada. Desenvolver técnicas de regulação pode ajudar a canalizar essa intensidade de forma construtiva.',
      'Muito Alto': 'Você vive emoções com profundidade rara. Fortalecer sua base emocional permite que sua sensibilidade se expresse como força, não vulnerabilidade.'
    },
    E: {
      'Muito Baixo': 'Você tem uma riqueza interior profunda. Expandir gradualmente sua energia social pode abrir portas para conexões alinhadas com seus valores.',
      'Baixo': 'Você valoriza conexões significativas. Fortalecer sua presença social gradualmente pode ampliar seu impacto.',
      'Médio': 'Você se adapta a diferentes contextos sociais. Desenvolver mais energia social pode abrir oportunidades enriquecedoras.',
      'Alto': 'Você já tem energia social natural. Aprofundar a qualidade das conexões pode tornar seu networking ainda mais significativo.',
      'Muito Alto': 'Você é naturalmente magnética. Desenvolver introspecção pode ajudar a criar relacionamentos mais profundos além das conexões amplas.'
    },
    O: {
      'Muito Baixo': 'Você traz estabilidade e confiabilidade. Abrir-se ocasionalmente a novas experiências pode trazer insights surpreendentes.',
      'Baixo': 'Você equilibra tradição com necessidade de mudança. Cultivar mais curiosidade pode expandir suas perspectivas.',
      'Médio': 'Você equilibra criatividade com praticidade. Explorar mais sua criatividade pode revelar talentos ocultos.',
      'Alto': 'Você já tem mente aberta e curiosa. Desenvolver disciplina para execução pode transformar suas ideias em realidade.',
      'Muito Alto': 'Você tem visão extraordinária. Criar estruturas de apoio pode ajudar a materializar suas visões no mundo físico.'
    },
    A: {
      'Muito Baixo': 'Você é autêntica e independente. Desenvolver empatia ativa pode tornar sua honestidade ainda mais eficaz.',
      'Baixo': 'Você valoriza a verdade. Aprofundar sua consciência sobre o impacto emocional pode fortalecer sua influência.',
      'Médio': 'Você equilibra seus interesses com os dos outros. Desenvolver mais assertividade pode potencializar sua liderança.',
      'Alto': 'Você já é naturalmente cooperativa. Desenvolver limites saudáveis permite sustentar seu cuidado com outros.',
      'Muito Alto': 'Você tem compaixão profunda. Aprender a dizer não e cuidar de si é essencial para sustentar seu cuidado com o mundo.'
    },
    C: {
      'Muito Baixo': 'Você é flexível e espontânea. Criar sistemas mínimos de organização pode liberar energia para o que você ama.',
      'Baixo': 'Você se adapta facilmente. Estabelecer pequenas rotinas pode reduzir a ansiedade e aumentar sua produtividade.',
      'Médio': 'Você equilibra organização com flexibilidade. Refinar seus sistemas pode ajudar a alcançar metas maiores.',
      'Alto': 'Você já é disciplinada e confiável. Praticar flexibilidade estratégica pode aumentar sua adaptabilidade.',
      'Muito Alto': 'Você tem padrões excepcionais. Aprender a aceitar "bom o suficiente" protege contra burnout e aumenta seu alcance.'
    }
  };

  return descricoes[score.fator][score.classificacao];
}

function obterBeneficiosDesenvolvimento(fator: FatorKey, classificacao: Classificacao): string[] {
  const beneficios: Record<FatorKey, string[]> = {
    N: [
      'Maior clareza em momentos de pressão',
      'Melhor regulação do estresse',
      'Relacionamentos mais harmoniosos',
      'Tomada de decisão mais equilibrada'
    ],
    E: [
      'Rede de apoio mais ampla',
      'Oportunidades profissionais expandidas',
      'Diversidade de experiências',
      'Maior impacto de suas ideias'
    ],
    O: [
      'Soluções mais criativas para problemas',
      'Experiências de vida mais ricas',
      'Adaptação mais fácil a mudanças',
      'Conexões com perspectivas diversas'
    ],
    A: [
      'Comunicação mais eficaz',
      'Relacionamentos mais colaborativos',
      'Redução de conflitos desnecessários',
      'Maior influência positiva'
    ],
    C: [
      'Maior produtividade e foco',
      'Projetos concluídos com consistência',
      'Menos ansiedade por desorganização',
      'Realização de metas de longo prazo'
    ]
  };

  return beneficios[fator];
}

function encontrarProtocolosRelacionados(
  protocolos: ProtocoloRecomendado[],
  fator: FatorKey,
  scoresFacetas: ScoreFaceta[]
): string[] {
  // Filtrar facetas do fator em questão
  const facetasFator = scoresFacetas.filter(sf => sf.faceta.startsWith(fator));
  
  // Ordenar por prioridade (menor percentil para fatores desejáveis maiores, 
  // maior percentil para fatores indesejáveis maiores)
  const facetasOrdenadas = facetasFator.sort((a, b) => {
    // Para N, queremos menores percentis (menos neuroticismo é melhor)
    // Para outros, queremos maiores percentis
    if (fator === 'N') {
      return a.percentil - b.percentil;
    }
    return b.percentil - a.percentil;
  });

  // Pegar as 2 facetas mais relevantes
  const topFacetas = facetasOrdenadas.slice(0, 2);
  
  // Mapear para protocolos (simplificado - pode ser expandido)
  const protocolosRelacionados = protocolos
    .filter(p => p.id.startsWith(fator))
    .slice(0, 2)
    .map(p => p.titulo);

  return protocolosRelacionados.length > 0 
    ? protocolosRelacionados 
    : [`Protocolos de ${FATORES[fator]} recomendados`];
}

function determinarArquetipo(
  fatorDominante: ScoreFator,
  caracteristicasSecundarias: CaracteristicaSecundaria[],
  combinacoesDetectadas: CombinacaoFator[]
): { nome: string; emoji: string } {
  // Se tem combinação detectada, usar ela
  if (combinacoesDetectadas.length > 0) {
    const combinacao = combinacoesDetectadas[0];
    return ARQUETIPOS[combinacao.id] || ARQUETIPOS['DEFAULT'];
  }

  // Se não, basear no fator dominante e características secundárias
  const fatoresAltos = [
    fatorDominante.fator,
    ...caracteristicasSecundarias
      .filter(c => c.tipo === 'forte_alta')
      .map(c => c.fator)
  ];

  if (fatoresAltos.includes('O') && fatoresAltos.includes('C')) {
    return ARQUETIPOS['VISIONARIA_REALIZADORA'];
  }
  if (fatoresAltos.includes('E') && fatoresAltos.includes('A')) {
    return ARQUETIPOS['CONECTORA_SOCIAL'];
  }
  if (fatoresAltos.includes('N') && fatoresAltos.includes('A')) {
    return ARQUETIPOS['EMPATICA_SENSIVEL'];
  }
  if (fatoresAltos.includes('E') && fatoresAltos.includes('C')) {
    return ARQUETIPOS['LIDER_DETERMINADA'];
  }

  return ARQUETIPOS['DEFAULT'];
}

function gerarFraseSintese(
  fatorDominante: ScoreFator,
  caracteristicasSecundarias: CaracteristicaSecundaria[],
  tracosDesenvolver: TraçoDesenvolver[],
  arquetipo: { nome: string; emoji: string }
): string {
  const nomeFator = FATORES[fatorDominante.fator];
  
  // Frases base por fator dominante
  const frasesBase: Record<FatorKey, string> = {
    N: 'vive emoções com profundidade e intensidade',
    E: 'tem energia social contagiante e carisma natural',
    O: 'enxerga possibilidades onde outros veem limitações',
    A: 'cria conexões genuínas e cuida profundamente dos outros',
    C: 'tem disciplina e determinação para realizar grandes metas'
  };

  let frase = `Você é uma ${arquetipo.nome} que ${frasesBase[fatorDominante.fator]}`;

  // Adicionar características secundárias relevantes
  if (caracteristicasSecundarias.length > 0) {
    const caracteristicaPrincipal = caracteristicasSecundarias[0];
    const conectores: Record<FatorKey, string> = {
      N: 'enquanto mantém uma base emocional',
      E: 'combinada com uma energia que',
      O: 'e sua mente aberta permite que você',
      A: 'e sua empatia genuína faz com que você',
      C: 'e sua organização ajuda você a'
    };
    
    frase += `, ${conectores[caracteristicaPrincipal.fator]} ${caracteristicaPrincipal.descricaoCurta.toLowerCase().replace('você ', '').replace('é ', '')}`;
  }

  // Adicionar nota sobre desenvolvimento
  if (tracosDesenvolver.length > 0) {
    const tracoPrincipal = tracosDesenvolver[0];
    frase += `. Desenvolver mais ${tracoPrincipal.nome.toLowerCase()} pode potencializar ainda mais seu impacto.`;
  }

  return frase;
}

function gerarPalavrasChave(
  perfilDominante: PerfilDominante,
  caracteristicasSecundarias: CaracteristicaSecundaria[],
  combinacoesDetectadas: CombinacaoFator[]
): string[] {
  const palavras: string[] = [];

  // Palavras do fator dominante
  const palavrasPorFator: Record<FatorKey, string[]> = {
    N: ['Intensa', 'Sensível', 'Profunda', 'Autêntica'],
    E: ['Energética', 'Sociável', 'Entusiasta', 'Carismática'],
    O: ['Criativa', 'Visionária', 'Curiosa', 'Inovadora'],
    A: ['Empática', 'Cuidadosa', 'Cooperativa', 'Calorosa'],
    C: ['Determinada', 'Organizada', 'Confiável', 'Focada']
  };

  palavras.push(...palavrasPorFator[perfilDominante.fator].slice(0, 2));

  // Palavras das características secundárias
  caracteristicasSecundarias.slice(0, 2).forEach(c => {
    if (c.tipo === 'forte_alta') {
      const palavrasAltas: Record<FatorKey, string> = {
        N: 'Emocional', E: 'Extrovertida', O: 'Aberta', A: 'Altruísta', C: 'Disciplinada'
      };
      palavras.push(palavrasAltas[c.fator]);
    }
  });

  // Palavras da combinação
  if (combinacoesDetectadas.length > 0) {
    const nomeCombinacao = combinacoesDetectadas[0].nome;
    const palavrasCombinacao = nomeCombinacao.replace('A ', '').split(' ');
    palavras.push(palavrasCombinacao[palavrasCombinacao.length - 1]);
  }

  // Remover duplicatas e limitar
  return [...new Set(palavras)].slice(0, 5);
}

// ============================================
// FUNÇÃO PARA GERAR VISÃO GERAL DOS 5 FATORES
// ============================================

function gerarVisaoGeral(scoresFatores: ScoreFator[], fatorDominante: FatorKey): VisaoGeralFator[] {
  return scoresFatores.map(score => {
    const visual = FATOR_VISUAL[score.fator];
    const tipoDescricao = score.classificacao === 'Muito Alto' || score.classificacao === 'Alto' 
      ? 'alta' 
      : score.classificacao === 'Muito Baixo' || score.classificacao === 'Baixo'
        ? 'baixa'
        : 'medio';
    
    return {
      fator: score.fator,
      nome: FATORES[score.fator],
      icone: visual.icone,
      percentil: score.percentil,
      classificacao: score.classificacao,
      descricaoBreve: DESCRICOES_BREVES[score.fator][score.classificacao],
      precisaAtencao: precisaAtencao(score),
      corIndicador: CORES_CLASSIFICACAO[score.classificacao],
    };
  }).sort((a, b) => {
    // Ordenar: primeiro o dominante, depois por percentil decrescente
    if (a.fator === fatorDominante) return -1;
    if (b.fator === fatorDominante) return 1;
    return b.percentil - a.percentil;
  });
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

export function gerarInterpretacaoPrincipal(
  scoresFatores: ScoreFator[],
  scoresFacetas: ScoreFaceta[],
  protocolos: ProtocoloRecomendado[]
): InterpretacaoPrincipalCompleta {
  
  // =====================================================
  // PASSO 1: IDENTIFICAR PERFIL DOMINANTE
  // =====================================================
  
  const fatorDominante = [...scoresFatores]
    .sort((a, b) => Math.abs(b.percentil - 50) - Math.abs(a.percentil - 50))[0];

  const interpretacaoBase = getInterpretacao(
    fatorDominante.fator, 
    classificarParaFaixa(fatorDominante.classificacao)
  );

  // Gerar texto complementar que menciona outros aspectos
  const textoComplementar = `Enquanto ${FATORES[fatorDominante.fator].toLowerCase()} é seu traço mais marcante, você também possui características importantes nas outras quatro dimensões que complementam e enriquecem seu perfil único.`;

  const perfilDominante: PerfilDominante = {
    fator: fatorDominante.fator,
    nome: FATORES[fatorDominante.fator],
    percentil: fatorDominante.percentil,
    classificacao: fatorDominante.classificacao,
    titulo: interpretacaoBase.titulo,
    subtitulo: interpretacaoBase.subtitulo,
    descricao: interpretacaoBase.descricao,
    textoComplementar
  };

  // =====================================================
  // PASSO 2: GERAR VISÃO GERAL DOS 5 FATORES
  // =====================================================
  
  const visaoGeral = gerarVisaoGeral(scoresFatores, fatorDominante.fator);

  // =====================================================
  // PASSO 3: IDENTIFICAR CARACTERÍSTICAS SECUNDÁRIAS (TODOS OS 4 OUTROS)
  // =====================================================
  
  const caracteristicasSecundarias: CaracteristicaSecundaria[] = [];
  
  for (const score of scoresFatores) {
    if (score.fator === fatorDominante.fator) continue;
    
    let tipo: 'forte_alta' | 'forte_baixa' | 'equilibrio';
    let descricaoCurta: string;
    
    if (score.percentil >= CONFIG.LIMITE_FORTE_ALTA) {
      tipo = 'forte_alta';
      descricaoCurta = DESCRICOES_CURTAS[score.fator].alta;
    } else if (score.percentil <= CONFIG.LIMITE_FORTE_BAIXA) {
      tipo = 'forte_baixa';
      descricaoCurta = DESCRICOES_CURTAS[score.fator].baixa;
    } else {
      tipo = 'equilibrio';
      descricaoCurta = DESCRICOES_CURTAS[score.fator].medio;
    }

    const tipoSimplificado = tipo === 'forte_alta' ? 'alta' : tipo === 'forte_baixa' ? 'baixa' : 'media';
    
    caracteristicasSecundarias.push({
      fator: score.fator,
      nome: FATORES[score.fator],
      percentil: score.percentil,
      classificacao: score.classificacao,
      tipo,
      descricaoCurta,
      comoComplementa: calcularComplementariedade(fatorDominante.fator, score.fator, tipoSimplificado),
      precisaAtencao: precisaAtencao(score)
    });
  }

  // Ordenar: primeiro os que precisam de atenção, depois por força
  caracteristicasSecundarias.sort((a, b) => {
    if (a.precisaAtencao && !b.precisaAtencao) return -1;
    if (!a.precisaAtencao && b.precisaAtencao) return 1;
    return Math.abs(b.percentil - 50) - Math.abs(a.percentil - 50);
  });

  // =====================================================
  // PASSO 4: DETECTAR COMBINAÇÕES DE FATORES
  // =====================================================
  
  const combinacoesDetectadas: CombinacaoFator[] = [];
  
  // Criar mapa de classificações simplificadas
  const mapaClassificacoes: Record<FatorKey, 'alto' | 'medio' | 'baixo'> = {
    N: 'medio', E: 'medio', O: 'medio', A: 'medio', C: 'medio'
  };
  
  for (const score of scoresFatores) {
    mapaClassificacoes[score.fator] = getClassificacaoSimplificada(score.percentil);
  }

  // Verificar combinações
  const verificarCombinacao = (condicao: boolean, combinacaoId: string) => {
    if (condicao && COMBINACOES[combinacaoId]) {
      combinacoesDetectadas.push(COMBINACOES[combinacaoId]);
    }
  };

  verificarCombinacao(
    mapaClassificacoes.O === 'alto' && mapaClassificacoes.C === 'alto',
    'VISIONARIA_REALIZADORA'
  );
  verificarCombinacao(
    mapaClassificacoes.O === 'alto' && mapaClassificacoes.C === 'baixo',
    'SONHADOR_CRIATIVO'
  );
  verificarCombinacao(
    mapaClassificacoes.N === 'alto' && mapaClassificacoes.C === 'baixo',
    'SENSIVEL_DESORGANIZADA'
  );
  verificarCombinacao(
    mapaClassificacoes.N === 'alto' && mapaClassificacoes.C === 'alto',
    'PERFEICIONISTA_ANSIOSA'
  );
  verificarCombinacao(
    mapaClassificacoes.E === 'alto' && mapaClassificacoes.A === 'alto',
    'CONECTORA_SOCIAL'
  );
  verificarCombinacao(
    mapaClassificacoes.E === 'alto' && mapaClassificacoes.A === 'baixo',
    'LIDER_DETERMINADA'
  );
  verificarCombinacao(
    mapaClassificacoes.E === 'baixo' && mapaClassificacoes.A === 'alto',
    'APOIADORA_SILENCIOSA'
  );
  verificarCombinacao(
    mapaClassificacoes.E === 'baixo' && mapaClassificacoes.O === 'baixo',
    'TRADICIONALISTA_RESERVADA'
  );
  verificarCombinacao(
    mapaClassificacoes.O === 'alto' && mapaClassificacoes.E === 'alto',
    'EXPLORADORA_ENTUSIASTA'
  );
  verificarCombinacao(
    mapaClassificacoes.N === 'alto' && mapaClassificacoes.A === 'alto',
    'EMPATICA_SENSIVEL'
  );
  verificarCombinacao(
    mapaClassificacoes.N === 'baixo' && mapaClassificacoes.C === 'alto',
    'ROCHA_CONFIAVEL'
  );
  verificarCombinacao(
    mapaClassificacoes.N === 'baixo' && mapaClassificacoes.E === 'alto',
    'OTIMISTA_RESILIENTE'
  );

  // Limitar
  const combinacoesLimitadas = combinacoesDetectadas.slice(0, CONFIG.MAX_COMBINACOES);

  // =====================================================
  // PASSO 5: IDENTIFICAR TRAÇOS A DESENVOLVER
  // =====================================================
  
  const tracosDesenvolver: TraçoDesenvolver[] = [];
  
  // Identificar fatores que precisam de atenção
  // Prioridade: extremos problemáticos primeiro, depois os mais próximos do meio
  const candidatos = scoresFatores
    .filter(s => s.fator !== fatorDominante.fator)
    .map(s => {
      let prioridade = Math.abs(s.percentil - 50); // Distância do meio
      
      // Ajustar prioridade para casos especiais
      if (s.fator === 'N' && s.classificacao === 'Muito Alto') {
        prioridade = -1; // Prioridade máxima
      }
      if (s.fator === 'A' && s.classificacao === 'Muito Baixo') {
        prioridade = -2; // Prioridade máxima
      }
      if (s.fator === 'C' && s.classificacao === 'Muito Baixo') {
        prioridade = -3; // Prioridade máxima
      }
      
      return { ...s, prioridade };
    })
    .sort((a, b) => a.prioridade - b.prioridade);

  // Garantir pelo menos 1-2 traços mesmo se o perfil for equilibrado
  let candidatosFinais = candidatos;
  if (candidatos.length > 0 && candidatos.every(c => c.prioridade > 20)) {
    // Se todos estão equilibrados, pegar os 2 mais distantes do meio
    candidatosFinais = candidatos.slice(0, 2);
  }

  for (const candidato of candidatosFinais.slice(0, CONFIG.MAX_TRACOS_DESENVOLVER)) {
    tracosDesenvolver.push({
      fator: candidato.fator,
      nome: FATORES[candidato.fator],
      percentil: candidato.percentil,
      classificacao: candidato.classificacao,
      descricaoEmpoderada: gerarDescricaoEmpoderada(candidato),
      beneficios: obterBeneficiosDesenvolvimento(candidato.fator, candidato.classificacao),
      protocolosRelacionados: encontrarProtocolosRelacionados(protocolos, candidato.fator, scoresFacetas)
    });
  }

  // =====================================================
  // PASSO 6: GERAR RESUMO DO PERFIL
  // =====================================================
  
  const arquetipo = determinarArquetipo(
    fatorDominante,
    caracteristicasSecundarias,
    combinacoesLimitadas
  );

  const fraseSintese = gerarFraseSintese(
    fatorDominante,
    caracteristicasSecundarias,
    tracosDesenvolver,
    arquetipo
  );

  const palavrasChave = gerarPalavrasChave(
    perfilDominante,
    caracteristicasSecundarias,
    combinacoesLimitadas
  );

  const resumo: ResumoPerfil = {
    fraseSintese,
    arquetipo: arquetipo.nome,
    emojiPerfil: arquetipo.emoji,
    palavrasChave
  };

  // =====================================================
  // RETORNAR ESTRUTURA COMPLETA
  // =====================================================
  
  return {
    perfilDominante,
    visaoGeral,
    caracteristicasSecundarias,
    combinacoesDetectadas: combinacoesLimitadas,
    tracosDesenvolver,
    resumo,
    geradoEm: new Date(),
    versaoAlgoritmo: '2.1'
  };
}

// Exportar constantes úteis
export { COMBINACOES, ARQUETIPOS, CONFIG, FATOR_VISUAL, CORES_CLASSIFICACAO };
