/**
 * Detecção de Padrões - DECIFRA
 * 
 * Algoritmos para detectar respostas suspeitas ou inconsistentes
 * no teste IPIP-NEO-120
 */

import { QUESTOES } from '@/constants/questoes';

export interface Resposta {
  questao_id: number;
  resposta: number;
}

export interface AlertaPadrao {
  tipo: 'atencao' | 'alerta' | 'critico';
  titulo: string;
  descricao: string;
  detalhes?: string[];
}

export interface AnalisePadroes {
  valido: boolean;
  alertas: AlertaPadrao[];
  scoreConsistencia: number; // 0-100
  recomendacao: string;
}

/**
 * Detecta padrão de respostas iguais consecutivas
 */
function detectarRespostasIguais(respostas: Resposta[]): AlertaPadrao | null {
  const sequencias: number[] = [];
  let sequenciaAtual = 1;
  let maiorSequencia = 1;

  for (let i = 1; i < respostas.length; i++) {
    if (respostas[i].resposta === respostas[i - 1].resposta) {
      sequenciaAtual++;
      maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
    } else {
      if (sequenciaAtual >= 5) {
        sequencias.push(sequenciaAtual);
      }
      sequenciaAtual = 1;
    }
  }

  if (maiorSequencia >= 8) {
    return {
      tipo: 'critico',
      titulo: 'Respostas muito repetitivas',
      descricao: `Detectamos ${maiorSequencia} respostas iguais consecutivas. Isso pode indicar falta de atenção ao preencher o teste.`,
      detalhes: [
        'Padrões muito repetitivos comprometem a validade do resultado',
        'Recomendamos refazer o teste com mais atenção',
      ],
    };
  }

  if (maiorSequencia >= 5) {
    return {
      tipo: 'alerta',
      titulo: 'Sequência de respostas repetidas',
      descricao: `${maiorSequencia} respostas iguais em sequência foram detectadas.`,
    };
  }

  return null;
}

/**
 * Detecta padrão de alternância regular (ex: 1,2,1,2 ou 3,4,3,4)
 */
function detectarAlternanciaRegular(respostas: Resposta[]): AlertaPadrao | null {
  let alternanciasDetectadas = 0;
  const padroes: string[] = [];

  // Verificar padrões de alternância de 2 em 2
  for (let i = 2; i < respostas.length; i++) {
    if (respostas[i].resposta === respostas[i - 2].resposta &&
        respostas[i].resposta !== respostas[i - 1].resposta) {
      alternanciasDetectadas++;
    }
  }

  // Se mais de 30% das respostas alternam regularmente
  const porcentagemAlternancia = (alternanciasDetectadas / respostas.length) * 100;

  if (porcentagemAlternancia > 40) {
    return {
      tipo: 'critico',
      titulo: 'Padrão de alternância suspeito',
      descricao: `${Math.round(porcentagemAlternancia)}% das respostas seguem um padrão de alternância regular.`,
      detalhes: [
        'Isso pode indicar preenchimento automático ou sem atenção',
        'Os resultados podem não refletir sua personalidade real',
      ],
    };
  }

  if (porcentagemAlternancia > 25) {
    return {
      tipo: 'atencao',
      titulo: 'Possível padrão de alternância',
      descricao: 'Detectamos um padrão alternado nas respostas.',
    };
  }

  return null;
}

/**
 * Detecta concentração excessiva em valores extremos
 */
function detectarExtremos(respostas: Resposta[]): AlertaPadrao | null {
  const extremos = respostas.filter(r => r.resposta === 1 || r.resposta === 5);
  const porcentagemExtremos = (extremos.length / respostas.length) * 100;

  if (porcentagemExtremos > 70) {
    return {
      tipo: 'atencao',
      titulo: 'Uso excessivo de respostas extremas',
      descricao: `${Math.round(porcentagemExtremos)}% das respostas são "Discordo Totalmente" ou "Concordo Totalmente".`,
      detalhes: [
        'Pensamento dicotômico pode dificultar a precisão do perfil',
        'Considere usar opções intermediárias quando apropriado',
      ],
    };
  }

  return null;
}

/**
 * Detecta concentração excessiva no valor neutro
 */
function detectarNeutroExcessivo(respostas: Resposta[]): AlertaPadrao | null {
  const neutros = respostas.filter(r => r.resposta === 3);
  const porcentagemNeutros = (neutros.length / respostas.length) * 100;

  if (porcentagemNeutros > 40) {
    return {
      tipo: 'atencao',
      titulo: 'Muitas respostas neutras',
      descricao: `${Math.round(porcentagemNeutros)}% das respostas são "Neutro".`,
      detalhes: [
        'Muitas respostas neutras podem dificultar a definição do perfil',
        'Tente se posicionar mais quando possível',
      ],
    };
  }

  return null;
}

/**
 * Detecta velocidade de resposta suspeita (se tivermos timestamps)
 */
function detectarVelocidadeResposta(respostas: Resposta[], tempoTotalMs?: number): AlertaPadrao | null {
  if (!tempoTotalMs) return null;

  const tempoMedioPorQuestao = tempoTotalMs / respostas.length;
  const tempoMedioSegundos = tempoMedioPorQuestao / 1000;

  if (tempoMedioSegundos < 2) {
    return {
      tipo: 'critico',
      titulo: 'Respostas muito rápidas',
      descricao: `Tempo médio de ${tempoMedioSegundos.toFixed(1)} segundos por questão.`,
      detalhes: [
        'Tempo insuficiente para leitura e reflexão adequadas',
        'Recomendamos refazer o teste com mais calma',
      ],
    };
  }

  if (tempoMedioSegundos < 4) {
    return {
      tipo: 'atencao',
      titulo: 'Respostas rápidas',
      descricao: `Média de ${tempoMedioSegundos.toFixed(1)} segundos por questão.`,
      detalhes: [
        'Considere dedicar mais tempo para refletir sobre cada afirmação',
      ],
    };
  }

  return null;
}

/**
 * Verifica consistência entre questões similares (questões de controle)
 */
function detectarInconsistenciasInternas(respostas: Resposta[]): AlertaPadrao | null {
  // Pares de questões que medem a mesma coisa (exemplo simplificado)
  const paresControle: [number, number][] = [
    [1, 31],   // Ambas N1 (Ansiedade) - invertidas
    [2, 32],   // Ambas N2 (Raiva)
    // Adicionar mais pares conforme necessário
  ];

  let inconsistencias = 0;

  for (const [q1, q2] of paresControle) {
    const r1 = respostas.find(r => r.questao_id === q1);
    const r2 = respostas.find(r => r.questao_id === q2);

    if (r1 && r2) {
      // Se a diferença for maior que 2, considera inconsistente
      if (Math.abs(r1.resposta - r2.resposta) > 2) {
        inconsistencias++;
      }
    }
  }

  if (inconsistencias >= 3) {
    return {
      tipo: 'alerta',
      titulo: 'Inconsistências detectadas',
      descricao: `${inconsistencias} inconsistências encontradas entre questões similares.`,
      detalhes: [
        'Respostas similares têm variação muito grande',
        'Isso pode afetar a precisão do resultado',
      ],
    };
  }

  return null;
}

/**
 * Calcula score geral de consistência
 */
function calcularScoreConsistencia(respostas: Resposta[], alertas: AlertaPadrao[]): number {
  let score = 100;

  // Penalidades por tipo de alerta
  alertas.forEach(alerta => {
    switch (alerta.tipo) {
      case 'critico':
        score -= 30;
        break;
      case 'alerta':
        score -= 15;
        break;
      case 'atencao':
        score -= 5;
        break;
    }
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Função principal de análise
 */
export function analisarPadroesRespostas(
  respostas: Resposta[],
  tempoTotalMs?: number
): AnalisePadroes {
  const alertas: AlertaPadrao[] = [];

  // Executar todas as detecções
  const detectores = [
    detectarRespostasIguais(respostas),
    detectarAlternanciaRegular(respostas),
    detectarExtremos(respostas),
    detectarNeutroExcessivo(respostas),
    detectarVelocidadeResposta(respostas, tempoTotalMs),
    detectarInconsistenciasInternas(respostas),
  ];

  detectores.forEach(alerta => {
    if (alerta) {
      alertas.push(alerta);
    }
  });

  // Calcular score de consistência
  const scoreConsistencia = calcularScoreConsistencia(respostas, alertas);

  // Definir validade e recomendação
  const criticos = alertas.filter(a => a.tipo === 'critico').length;
  const alertasCount = alertas.filter(a => a.tipo === 'alerta').length;

  let valido = true;
  let recomendacao = '';

  if (criticos >= 2) {
    valido = false;
    recomendacao = 'Detectamos múltiplos padrões preocupantes. Recomendamos refazer o teste com mais atenção e tempo.';
  } else if (criticos === 1 || alertasCount >= 2) {
    valido = true;
    recomendacao = 'Alguns padrões chamaram atenção. O resultado pode ser válido, mas considere as observações ao interpretar.';
  } else if (alertasCount === 1) {
    recomendacao = 'Uma pequena observação foi identificada, mas o resultado deve ser confiável.';
  } else {
    recomendacao = 'Nenhum padrão suspeito detectado. O resultado tem boa consistência.';
  }

  return {
    valido,
    alertas,
    scoreConsistencia,
    recomendacao,
  };
}

/**
 * Gera mensagem amigável para o usuário
 */
export function gerarMensagemDeteccao(analise: AnalisePadroes): string {
  if (analise.alertas.length === 0) {
    return '✓ Suas respostas parecem consistentes e bem consideradas.';
  }

  const maisGrave = analise.alertas[0];
  
  switch (maisGrave.tipo) {
    case 'critico':
      return `⚠️ ${maisGrave.titulo}. Recomendamos refazer o teste.`;
    case 'alerta':
      return `⚡ ${maisGrave.titulo}. ${maisGrave.descricao}`;
    case 'atencao':
      return `ℹ️ ${maisGrave.descricao}`;
    default:
      return analise.recomendacao;
  }
}

// Exportar funções individuais para testes
export {
  detectarRespostasIguais,
  detectarAlternanciaRegular,
  detectarExtremos,
  detectarNeutroExcessivo,
  calcularScoreConsistencia,
};
