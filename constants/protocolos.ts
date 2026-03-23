import { FACETAS } from '@/constants/ipip';

/**
 * Protocolos de Intervenção - DECIFRA
 * 
 * 90 protocolos no total (30 facetas x 3 tipos)
 * Cada faceta tem 3 protocolos: A (Alto), B (Baixo), C (Médio/Ajuste)
 */

export interface Exercicio {
  titulo: string;
  descricao: string;
  frequencia: string;
  duracao: string;
}

export interface Protocolo {
  codigo: string;
  faceta: string;
  facetaNome: string;
  fator: 'N' | 'E' | 'O' | 'A' | 'C';
  tipo: 'alto' | 'baixo' | 'medio';
  tipoLabel: string;
  titulo: string;
  subtitulo: string;
  objetivo: string;
  descricao: string;
  exercicios: Exercicio[];
  duracao: string;
  recursos: string[];
  icon: string;
  cor: string;
}

// ============================================
// N1 - ANSIEDADE
// ============================================

const PROTOCOLO_N1_A: Protocolo = {
  codigo: 'N1-A',
  faceta: 'N1',
  facetaNome: 'Ansiedade',
  fator: 'N',
  tipo: 'alto',
  tipoLabel: 'Polo Alto',
  titulo: 'Gestão da Ansiedade',
  subtitulo: 'Técnicas para regulação emocional',
  objetivo: 'Reduzir níveis elevados de ansiedade e criar reservas emocionais',
  descricao: 'Este protocolo trabalha a identificação de gatilhos de ansiedade e o desenvolvimento de técnicas de regulação emocional para momentos de tensão.',
  exercicios: [
    {
      titulo: 'Respiração 4-7-8',
      descricao: 'Inspire por 4 segundos, segure por 7 segundos, expire por 8 segundos. Repita 4 vezes.',
      frequencia: 'Diária',
      duracao: '2 minutos',
    },
    {
      titulo: 'Journaling de Preocupações',
      descricao: 'Escreva todas as preocupações em um caderno por 5 minutos todas as manhãs, sem julgamentos.',
      frequencia: 'Diária',
      duracao: '5 minutos',
    },
    {
      titulo: 'Identificação de Gatilhos',
      descricao: 'Registre situações que desencadeiam ansiedade e padrões de pensamento associados.',
      frequencia: 'Conforme necessário',
      duracao: '10 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['Caderno', 'App de respiração', 'Playlist calmante'],
  icon: 'wind',
  cor: '#4A90A4',
};

const PROTOCOLO_N1_B: Protocolo = {
  codigo: 'N1-B',
  faceta: 'N1',
  facetaNome: 'Ansiedade',
  fator: 'N',
  tipo: 'baixo',
  tipoLabel: 'Polo Baixo',
  titulo: 'Atenção Plena às Emoções',
  subtitulo: 'Desenvolvimento de consciência emocional',
  objetivo: 'Aumentar a consciência dos sinais de alerta emocional e a importância do planejamento',
  descricao: 'Para pessoas com baixa ansiedade, este protocolo foca em reconhecer sinais sutis de estresse e desenvolver sistemas de prevenção.',
  exercicios: [
    {
      titulo: 'Check-in Emocional',
      descricao: 'Avalie seu nível de energia e humor 3x ao dia, mesmo se estiver "bem".',
      frequencia: '3x ao dia',
      duracao: '2 minutos',
    },
    {
      titulo: 'Simulação de Cenários',
      descricao: 'Imagine situações desafiadoras e planeje possíveis obstáculos antecipadamente.',
      frequencia: 'Semanal',
      duracao: '15 minutos',
    },
    {
      titulo: 'Busca de Feedback',
      descricao: 'Peça opinião de pessoas próximas sobre sinais de estresse que você pode não perceber.',
      frequencia: 'Quinzenal',
      duracao: '20 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['App de humor', 'Diário', 'Lista de contatos'],
  icon: 'search',
  cor: '#4A90A4',
};

const PROTOCOLO_N1_C: Protocolo = {
  codigo: 'N1-C',
  faceta: 'N1',
  facetaNome: 'Ansiedade',
  fator: 'N',
  tipo: 'medio',
  tipoLabel: 'Ajuste Fino',
  titulo: 'Equilíbrio Emocional',
  subtitulo: 'Manutenção da saúde emocional',
  objetivo: 'Manter o equilíbrio emocional e fortalecer estratégias de coping',
  descricao: 'Protocolo de manutenção para preservar o equilíbrio emocional atual e prevenir oscilações.',
  exercicios: [
    {
      titulo: 'Mindfulness Diário',
      descricao: 'Pratique atenção plena por 10 minutos, focando na respiração.',
      frequencia: 'Diária',
      duracao: '10 minutos',
    },
    {
      titulo: 'Gratidão',
      descricao: 'Liste 3 coisas pelas quais você é grato todos os dias.',
      frequencia: 'Diária',
      duracao: '5 minutos',
    },
  ],
  duracao: '1-2 semanas',
  recursos: ['App de meditação', 'Caderno'],
  icon: 'balance',
  cor: '#4A90A4',
};

// ============================================
// N6 - VULNERABILIDADE
// ============================================

const PROTOCOLO_N6_A: Protocolo = {
  codigo: 'N6-A',
  faceta: 'N6',
  facetaNome: 'Vulnerabilidade',
  fator: 'N',
  tipo: 'alto',
  tipoLabel: 'Polo Alto',
  titulo: 'Fortalecimento Interno',
  subtitulo: 'Desenvolvimento de resiliência',
  objetivo: 'Reduzir vulnerabilidade ao estresse e desenvolver recursos internos de enfrentamento',
  descricao: 'Protocolo focado em fortalecer a autoeficácia e criar estratégias para lidar com situações de alta pressão.',
  exercicios: [
    {
      titulo: 'Reframe de Situações',
      descricao: 'Escolha uma situação estressante e escreva 3 maneiras diferentes de interpretá-la.',
      frequencia: '3x na semana',
      duracao: '10 minutos',
    },
    {
      titulo: 'Competências Pessoais',
      descricao: 'Liste 5 situações difíceis que você superou no passado e o que aprendeu com cada uma.',
      frequencia: 'Única',
      duracao: '20 minutos',
    },
    {
      titulo: 'Rede de Apoio',
      descricao: 'Identifique 3 pessoas que você pode contar em momentos difíceis e fortaleça essas conexões.',
      frequencia: 'Semanal',
      duracao: '30 minutos',
    },
  ],
  duracao: '3-4 semanas',
  recursos: ['Caderno', 'Lista de contatos', 'Podcasts motivacionais'],
  icon: 'shield',
  cor: '#7B68EE',
};

const PROTOCOLO_N6_B: Protocolo = {
  codigo: 'N6-B',
  faceta: 'N6',
  facetaNome: 'Vulnerabilidade',
  fator: 'N',
  tipo: 'baixo',
  tipoLabel: 'Polo Baixo',
  titulo: 'Autoconfiança com Flexibilidade',
  subtitulo: 'Equilibrar segurança com abertura',
  objetivo: 'Manter a autoconfiança enquanto desenvolve empatia por fragilidades próprias e alheias',
  descricao: 'Para pessoas resilientes, este protocolo trabalha o reconhecimento de limites e a conexão emocional com os outros.',
  exercicios: [
    {
      titulo: 'Vulnerabilidade Controlada',
      descricao: 'Compartilhe um desafio pessoal com alguém de confiança, praticando a abertura.',
      frequencia: 'Semanal',
      duracao: 'Conversa',
    },
    {
      titulo: 'Suporte a Outros',
      descricao: 'Ofereça ajuda genuína a alguém que está passando por dificuldades.',
      frequencia: 'Semanal',
      duracao: 'Variável',
    },
    {
      titulo: 'Reflexão sobre Fraquezas',
      descricao: 'Escreva sobre uma área de desenvolvimento pessoal e um plano de ação.',
      frequencia: 'Quinzenal',
      duracao: '15 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['Caderno', 'Agenda'],
  icon: 'heart',
  cor: '#7B68EE',
};

const PROTOCOLO_N6_C: Protocolo = {
  codigo: 'N6-C',
  faceta: 'N6',
  facetaNome: 'Vulnerabilidade',
  fator: 'N',
  tipo: 'medio',
  tipoLabel: 'Ajuste Fino',
  titulo: 'Resiliência Contínua',
  subtitulo: 'Manutenção da força interior',
  objetivo: 'Manter e fortalecer a capacidade de lidar com adversidades',
  descricao: 'Protocolo de manutenção para preservar a resiliência e prevenir burnout.',
  exercicios: [
    {
      titulo: 'Auto-cuidado Preventivo',
      descricao: 'Agende atividades de autocuidado na sua rotina semanal.',
      frequencia: 'Semanal',
      duracao: 'Variável',
    },
    {
      titulo: 'Celebração de Vitórias',
      descricao: 'Reconheça e celebre pequenas conquistas diárias.',
      frequencia: 'Diária',
      duracao: '5 minutos',
    },
  ],
  duracao: '1-2 semanas',
  recursos: ['Planner', 'Agenda'],
  icon: 'trophy',
  cor: '#7B68EE',
};

// ============================================
// N2 - RAIVA
// ============================================

const PROTOCOLO_N2_A: Protocolo = {
  codigo: 'N2-A',
  faceta: 'N2',
  facetaNome: 'Hostilidade/Raiva',
  fator: 'N',
  tipo: 'alto',
  tipoLabel: 'Polo Alto',
  titulo: 'Gestão da Frustração',
  subtitulo: 'Técnicas de regulação da irritação',
  objetivo: 'Desenvolver controle emocional e canais saudáveis para expressar frustração',
  descricao: 'Protocolo para identificar gatilhos de raiva e desenvolver pausa entre estímulo e resposta.',
  exercicios: [
    {
      titulo: 'Técnica STOP',
      descricao: 'Pare (Stop), Respire (Take a breath), Observe, Proceda antes de reagir.',
      frequencia: 'Conforme necessário',
      duracao: '1 minuto',
    },
    {
      titulo: 'Caminhada de Reflexão',
      descricao: 'Quando irritado, caminhe por 10 minutos antes de responder.',
      frequencia: 'Conforme necessário',
      duracao: '10 minutos',
    },
    {
      titulo: 'Diário de Gatilhos',
      descricao: 'Registre situações que geram raiva e padrões de pensamento.',
      frequencia: 'Diária',
      duracao: '10 minutos',
    },
  ],
  duracao: '3-4 semanas',
  recursos: ['Caderno', 'Tênis de caminhada'],
  icon: 'zap-off',
  cor: '#E74C3C',
};

const PROTOCOLO_N2_B: Protocolo = {
  codigo: 'N2-B',
  faceta: 'N2',
  facetaNome: 'Hostilidade/Raiva',
  fator: 'N',
  tipo: 'baixo',
  tipoLabel: 'Polo Baixo',
  titulo: 'Expressão Saudável',
  subtitulo: 'Desenvolver assertividade',
  objetivo: 'Aprender a expressar descontentamento de forma construtiva e proteger limites',
  descricao: 'Para pessoas que raramente expressam raiva, este protocolo desenvolve assertividade e defesa de limites.',
  exercicios: [
    {
      titulo: 'Comunicação "Eu"',
      descricao: 'Pratique frases como "Eu me sinto... quando... porque...".',
      frequencia: '3x na semana',
      duracao: '5 minutos',
    },
    {
      titulo: 'Defesa de Limites',
      descricao: 'Identifique uma situação onde precisa dizer "não" e pratique.',
      frequencia: 'Semanal',
      duracao: '15 minutos',
    },
    {
      titulo: 'Reconhecimento de Injustiça',
      descricao: 'Quando algo te incomoda, pause e reconheça o sentimento antes de suprimi-lo.',
      frequencia: 'Diária',
      duracao: '2 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['Caderno', 'Espelho (para prática)'],
  icon: 'message-circle',
  cor: '#E74C3C',
};

const PROTOCOLO_N2_C: Protocolo = {
  codigo: 'N2-C',
  faceta: 'N2',
  facetaNome: 'Hostilidade/Raiva',
  fator: 'N',
  tipo: 'medio',
  tipoLabel: 'Ajuste Fino',
  titulo: 'Equilíbrio na Expressão',
  subtitulo: 'Manutenção do controle emocional',
  objetivo: 'Manter o equilíbrio entre expressão e controle emocional',
  descricao: 'Protocolo de manutenção para preservar a capacidade de lidar com frustrações.',
  exercicios: [
    {
      titulo: 'Check de Humor',
      descricao: 'Avalie seu nível de irritação ao longo do dia.',
      frequencia: '2x ao dia',
      duracao: '1 minuto',
    },
    {
      titulo: 'Atividade Relaxante',
      descricao: 'Pratique uma atividade que traga calma (leitura, música, natureza).',
      frequencia: '3x na semana',
      duracao: '30 minutos',
    },
  ],
  duracao: '1-2 semanas',
  recursos: ['Livro', 'Música'],
  icon: 'smile',
  cor: '#E74C3C',
};

// ============================================
// E1 - CORDIALIDADE
// ============================================

const PROTOCOLO_E1_A: Protocolo = {
  codigo: 'E1-A',
  faceta: 'E1',
  facetaNome: 'Cordialidade',
  fator: 'E',
  tipo: 'alto',
  tipoLabel: 'Polo Alto',
  titulo: 'Profundidade Social',
  subtitulo: 'Qualidade nas conexões',
  objetivo: 'Transformar sociabilidade em relações significativas e duradouras',
  descricao: 'Para pessoas muito sociáveis, este protocolo foca em aprofundar conexões em vez de amplificá-las.',
  exercicios: [
    {
      titulo: 'Conversa Profunda',
      descricao: 'Tenha uma conversa significativa com alguém, indo além de superficialidades.',
      frequencia: 'Semanal',
      duracao: '45 minutos',
    },
    {
      titulo: 'Tempo de Qualidade',
      descricao: 'Reserve tempo exclusivo para pessoas importantes, sem distrações.',
      frequencia: 'Semanal',
      duracao: '2 horas',
    },
    {
      titulo: 'Escuta Ativa',
      descricao: 'Em uma conversa, foque 100% em ouvir antes de responder.',
      frequencia: 'Diária',
      duracao: '15 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['Agenda', 'Lista de perguntas profundas'],
  icon: 'users',
  cor: '#F39C12',
};

const PROTOCOLO_E1_B: Protocolo = {
  codigo: 'E1-B',
  faceta: 'E1',
  facetaNome: 'Cordialidade',
  fator: 'E',
  tipo: 'baixo',
  tipoLabel: 'Polo Baixo',
  titulo: 'Conexão Autêntica',
  subtitulo: 'Desenvolver conforto social',
  objetivo: 'Ampliar o círculo social de forma confortável e autêntica',
  descricao: 'Para pessoas mais reservadas, este protocolo desenvolve conforto gradual em situações sociais.',
  exercicios: [
    {
      titulo: 'Micro-interações',
      descricao: 'Inicie pequenas conversas com estranhos (cumprimentos, comentários sobre o tempo).',
      frequencia: 'Diária',
      duracao: '5 minutos',
    },
    {
      titulo: 'Encontro em Grupo Pequeno',
      descricao: 'Participe de atividades com 2-3 pessoas em ambientes confortáveis.',
      frequencia: 'Semanal',
      duracao: '1 hora',
    },
    {
      titulo: 'Preparação Social',
      descricao: 'Antes de eventos, prepare 3 tópicos de conversa.',
      frequencia: 'Conforme necessário',
      duracao: '5 minutos',
    },
  ],
  duracao: '3-4 semanas',
  recursos: ['Agenda', 'Lista de tópicos'],
  icon: 'user-plus',
  cor: '#F39C12',
};

const PROTOCOLO_E1_C: Protocolo = {
  codigo: 'E1-C',
  faceta: 'E1',
  facetaNome: 'Cordialidade',
  fator: 'E',
  tipo: 'medio',
  tipoLabel: 'Ajuste Fino',
  titulo: 'Equilíbrio Social',
  subtitulo: 'Manutenção das relações',
  objetivo: 'Manter equilíbrio entre momento social e individual',
  descricao: 'Protocolo de manutenção para preservar saúde das relações sociais.',
  exercicios: [
    {
      titulo: 'Manutenção de Contatos',
      descricao: 'Entre em contato com alguém importante que você não vê há tempo.',
      frequencia: 'Semanal',
      duracao: '15 minutos',
    },
    {
      titulo: 'Tempo para Si',
      descricao: 'Reserve tempo de qualidade sozinho para recarregar.',
      frequencia: 'Semanal',
      duracao: '2 horas',
    },
  ],
  duracao: '1-2 semanas',
  recursos: ['Agenda'],
  icon: 'user-check',
  cor: '#F39C12',
};

// ============================================
// E3 - ASSERTIVIDADE
// ============================================

const PROTOCOLO_E3_A: Protocolo = {
  codigo: 'E3-A',
  faceta: 'E3',
  facetaNome: 'Assertividade',
  fator: 'E',
  tipo: 'alto',
  tipoLabel: 'Polo Alto',
  titulo: 'Liderança Saudável',
  subtitulo: 'Assertividade com empatia',
  objetivo: 'Usar a assertividade de forma empática, considerando impacto nos outros',
  descricao: 'Para pessoas naturalmente assertivas, este protocolo desenvolve escuta e inclusão nas decisões.',
  exercicios: [
    {
      titulo: 'Consulta Antes de Decidir',
      descricao: 'Antes de tomar decisões que afetam outros, consulte suas opiniões.',
      frequencia: 'Diária',
      duracao: '10 minutos',
    },
    {
      titulo: 'Delegação Empoderada',
      descricao: 'Delegue tarefas dando autonomia real, não apenas responsabilidade.',
      frequencia: 'Semanal',
      duracao: '20 minutos',
    },
    {
      titulo: 'Feedback de Liderança',
      descricao: 'Peça feedback sobre seu estilo de liderança para pessoas próximas.',
      frequencia: 'Mensal',
      duracao: '30 minutos',
    },
  ],
  duracao: '2-3 semanas',
  recursos: ['Caderno', 'Agenda'],
  icon: 'crown',
  cor: '#9B59B6',
};

const PROTOCOLO_E3_B: Protocolo = {
  codigo: 'E3-B',
  faceta: 'E3',
  facetaNome: 'Assertividade',
  fator: 'E',
  tipo: 'baixo',
  tipoLabel: 'Polo Baixo',
  titulo: 'Voz e Expressão',
  subtitulo: 'Desenvolver presença',
  objetivo: 'Desenvolver confiança para expressar opiniões e defender posições',
  descricao: 'Para pessoas mais discretas, este protocolo trabalha a expressão de ideias e opiniões.',
  exercicios: [
    {
      titulo: 'Contribuição em Reuniões',
      descricao: 'Comprometa-se a fazer pelo menos uma contribuição em cada reunião.',
      frequencia: 'Diária',
      duracao: '2 minutos',
    },
    {
      titulo: 'Postura de Poder',
      descricao: 'Pratique postura confiante (ombros abertos, contato visual) por 2 minutos.',
      frequencia: 'Diária',
      duracao: '2 minutos',
    },
    {
      titulo: 'Expressão de Opinião',
      descricao: 'Compartilhe uma opinião diferente em um grupo seguro.',
      frequencia: '2x na semana',
      duracao: '10 minutos',
    },
  ],
  duracao: '3-4 semanas',
  recursos: ['Espelho', 'Caderno'],
  icon: 'mic',
  cor: '#9B59B6',
};

const PROTOCOLO_E3_C: Protocolo = {
  codigo: 'E3-C',
  faceta: 'E3',
  facetaNome: 'Assertividade',
  fator: 'E',
  tipo: 'medio',
  tipoLabel: 'Ajuste Fino',
  titulo: 'Comunicação Equilibrada',
  subtitulo: 'Manutenção da assertividade',
  objetivo: 'Manter equilíbrio entre expressão e escuta',
  descricao: 'Protocolo de manutenção para preservar capacidade de comunicação assertiva.',
  exercicios: [
    {
      titulo: 'Balance Check',
      descricao: 'Avalie se está falando e ouvindo em proporção equilibrada.',
      frequencia: 'Diária',
      duracao: '2 minutos',
    },
    {
      titulo: 'Agradecimento Específico',
      descricao: 'Reconheça contribuições específicas de outras pessoas.',
      frequencia: 'Diária',
      duracao: '5 minutos',
    },
  ],
  duracao: '1-2 semanas',
  recursos: ['Caderno'],
  icon: 'message-square',
  cor: '#9B59B6',
};

// ============================================
// EXPORT
// ============================================

const PROTOCOLOS_BASE: Record<string, Protocolo> = {
  // N1 - Ansiedade
  'N1-A': PROTOCOLO_N1_A,
  'N1-B': PROTOCOLO_N1_B,
  'N1-C': PROTOCOLO_N1_C,
  
  // N6 - Vulnerabilidade
  'N6-A': PROTOCOLO_N6_A,
  'N6-B': PROTOCOLO_N6_B,
  'N6-C': PROTOCOLO_N6_C,
  
  // N2 - Raiva
  'N2-A': PROTOCOLO_N2_A,
  'N2-B': PROTOCOLO_N2_B,
  'N2-C': PROTOCOLO_N2_C,
  
  // E1 - Cordialidade
  'E1-A': PROTOCOLO_E1_A,
  'E1-B': PROTOCOLO_E1_B,
  'E1-C': PROTOCOLO_E1_C,
  
  // E3 - Assertividade
  'E3-A': PROTOCOLO_E3_A,
  'E3-B': PROTOCOLO_E3_B,
  'E3-C': PROTOCOLO_E3_C,
};

function getTipoConfig(tipo: 'alto' | 'baixo' | 'medio') {
  if (tipo === 'alto') {
    return {
      sufixo: 'A',
      tipoLabel: 'Polo Alto',
      titulo: 'Regulação do Polo Alto',
      subtitulo: 'Canalizar intensidade com equilíbrio',
      objetivo: 'Reduzir excessos comportamentais e ampliar autocontrole em situações críticas.',
      descricao: 'Protocolo focado em reduzir ativação excessiva e construir estratégias práticas de autorregulação.',
      icon: 'trending-up',
      cor: '#C4785A',
    };
  }

  if (tipo === 'baixo') {
    return {
      sufixo: 'B',
      tipoLabel: 'Polo Baixo',
      titulo: 'Desenvolvimento do Polo Baixo',
      subtitulo: 'Fortalecer expressão e repertório',
      objetivo: 'Expandir recursos comportamentais e aumentar respostas adaptativas em contextos relevantes.',
      descricao: 'Protocolo voltado para ativar competências subutilizadas e ampliar repertório de ação.',
      icon: 'target',
      cor: '#4A90A4',
    };
  }

  return {
    sufixo: 'C',
    tipoLabel: 'Ajuste Fino',
    titulo: 'Ajuste e Manutenção',
    subtitulo: 'Consolidar estabilidade comportamental',
    objetivo: 'Preservar ganhos atuais e prevenir regressões por meio de práticas consistentes.',
    descricao: 'Protocolo de manutenção para fortalecer consistência, autoconsciência e estabilidade no dia a dia.',
    icon: 'shield',
    cor: '#9B59B6',
  };
}

function getCorPorFator(fator: Protocolo['fator']): string {
  const mapa: Record<Protocolo['fator'], string> = {
    N: '#C4785A',
    E: '#E67E22',
    O: '#8E44AD',
    A: '#16A085',
    C: '#2980B9',
  };
  return mapa[fator];
}

function criarProtocoloPadrao(faceta: string, facetaNome: string, tipo: 'alto' | 'baixo' | 'medio'): Protocolo {
  const fator = faceta[0] as Protocolo['fator'];
  const cfg = getTipoConfig(tipo);
  const codigo = `${faceta}-${cfg.sufixo}`;

  return {
    codigo,
    faceta,
    facetaNome,
    fator,
    tipo,
    tipoLabel: cfg.tipoLabel,
    titulo: `${cfg.titulo} - ${facetaNome}`,
    subtitulo: cfg.subtitulo,
    objetivo: cfg.objetivo,
    descricao: cfg.descricao,
    exercicios: [
      {
        titulo: 'Microprática Diária',
        descricao: `Aplicar uma microação de ${facetaNome.toLowerCase()} com foco em consistência e autoobservação.`,
        frequencia: 'Diária',
        duracao: '5-10 minutos',
      },
      {
        titulo: 'Diário de Evidências',
        descricao: 'Registrar gatilhos, decisões e resultados para ajustar o plano de ação semanalmente.',
        frequencia: '3x por semana',
        duracao: '10 minutos',
      },
      {
        titulo: 'Revisão de Progresso',
        descricao: 'Revisar avanços, barreiras e próximos passos com foco em autonomia comportamental.',
        frequencia: 'Semanal',
        duracao: '15 minutos',
      },
    ],
    duracao: '2-4 semanas',
    recursos: ['Caderno de acompanhamento', 'Checklist semanal'],
    icon: cfg.icon,
    cor: getCorPorFator(fator),
  };
}

const PROTOCOLOS_GERADOS: Record<string, Protocolo> = {};

for (const [faceta, facetaNome] of Object.entries(FACETAS)) {
  for (const tipo of ['alto', 'baixo', 'medio'] as const) {
    const sufixo = tipo === 'alto' ? 'A' : tipo === 'baixo' ? 'B' : 'C';
    const codigo = `${faceta}-${sufixo}`;

    if (!PROTOCOLOS_BASE[codigo]) {
      PROTOCOLOS_GERADOS[codigo] = criarProtocoloPadrao(faceta, facetaNome, tipo);
    }
  }
}

export const PROTOCOLOS: Record<string, Protocolo> = {
  ...PROTOCOLOS_BASE,
  ...PROTOCOLOS_GERADOS,
};

// Lista de todos os protocolos
export const TODOS_PROTOCOLOS = Object.values(PROTOCOLOS);

// Protocolos por fator
export const PROTOCOLOS_POR_FATOR: Record<Protocolo['fator'], string[]> = {
  N: Object.keys(PROTOCOLOS).filter(codigo => codigo.startsWith('N')),
  E: Object.keys(PROTOCOLOS).filter(codigo => codigo.startsWith('E')),
  O: Object.keys(PROTOCOLOS).filter(codigo => codigo.startsWith('O')),
  A: Object.keys(PROTOCOLOS).filter(codigo => codigo.startsWith('A')),
  C: Object.keys(PROTOCOLOS).filter(codigo => codigo.startsWith('C')),
};

// Protocolos por faceta
export const PROTOCOLOS_POR_FACETA: Record<string, string[]> = Object.fromEntries(
  Object.keys(FACETAS).map((faceta) => [
    faceta,
    Object.keys(PROTOCOLOS)
      .filter(codigo => codigo.startsWith(`${faceta}-`))
      .sort(),
  ])
);
