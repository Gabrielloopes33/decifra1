/**
 * Algoritmo de Recomendação de Protocolos - DECIFRA
 * 
 * Lógica para selecionar os protocolos mais relevantes
 * com base nos resultados do teste IPIP-NEO-120
 */

import { PROTOCOLOS, TODOS_PROTOCOLOS } from '@/constants/protocolos';
import type { Protocolo } from '@/constants/protocolos';

// Tipos de classificação
export type Classificacao = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';

// Interface para resultado de uma faceta
export interface ResultadoFaceta {
  faceta: string;
  score: number;
  percentil: number;
  classificacao: Classificacao;
}

// Interface para recomendação
export interface Recomendacao {
  protocolo: Protocolo;
  pontuacao: number;
  prioridade: 'alta' | 'media' | 'baixa';
  motivo: string;
}

// Pontuação por classificação
const PONTOS_CLASSIFICACAO: Record<Classificacao, number> = {
  'Muito Baixo': 3,
  'Baixo': 2,
  'Médio': 0,
  'Alto': 2,
  'Muito Alto': 3,
};

// Facetas prioritárias (foco em segurança emocional)
const FACETAS_PRIORITARIAS = ['N1', 'N5', 'N6', 'N2'];

// Complemento entre polos
const POLOS_COMPLEMENTARES: Record<string, string> = {
  'N1': 'N6',  // Ansiedade e Vulnerabilidade se influenciam
  'N2': 'N6',  // Raiva e Vulnerabilidade
  'C5': 'N6',  // Autodisciplina e Vulnerabilidade
};

const PRIORIDADE_TEMATICA: Record<string, number> = {
  N: 1, // Regulação/Estabilização
  C: 2, // Execução/Consistência
  A: 3, // Limites/Relação
  E: 4, // Energia social
  O: 5, // Visão/Criatividade
};

const COMBINACOES_CRITICAS = [
  { a: 'N1', b: 'N6', bonus: 1, motivo: 'Combinação crítica de vulnerabilidade emocional' },
  { a: 'N2', b: 'N6', bonus: 1, motivo: 'Combinação crítica de reatividade e vulnerabilidade' },
  { a: 'N1', b: 'C5', bonus: 1.5, motivo: 'Combinação crítica de ansiedade e baixa autodisciplina' },
];

/**
 * Calcula a pontuação de um protocolo baseado nos resultados
 */
function calcularPontuacaoProtocolo(
  protocolo: Protocolo,
  resultados: ResultadoFaceta[]
): { pontuacao: number; motivo: string } {
  let pontuacao = 0;
  const motivos: string[] = [];

  // 1. Pontuação base da classificação da faceta
  const resultadoFaceta = resultados.find(r => r.faceta === protocolo.faceta);
  if (resultadoFaceta) {
    const pontosBase = PONTOS_CLASSIFICACAO[resultadoFaceta.classificacao];
    pontuacao += pontosBase;
    
    if (pontosBase > 0) {
      motivos.push(`${protocolo.facetaNome} está ${resultadoFaceta.classificacao.toLowerCase()}`);
    }

    // 2. Bônus para facetas prioritárias (segurança emocional)
    if (FACETAS_PRIORITARIAS.includes(protocolo.faceta) && pontosBase > 0) {
      pontuacao += 1;
      motivos.push('Área de prioridade emocional');
    }
  }

  // 3. Verificar se o tipo de protocolo (A/B/C) corresponde à classificação
  if (resultadoFaceta) {
    const tipoIdeal = getTipoIdeal(resultadoFaceta.classificacao);
    if (protocolo.tipo === tipoIdeal) {
      pontuacao += 2;
      motivos.push('Protocolo ideal para seu perfil');
    }
  }

  // 4. Verificar facetas complementares
  const facetaComplementar = POLOS_COMPLEMENTARES[protocolo.faceta];
  if (facetaComplementar) {
    const resultadoComplementar = resultados.find(r => r.faceta === facetaComplementar);
    if (resultadoComplementar && PONTOS_CLASSIFICACAO[resultadoComplementar.classificacao] >= 2) {
      pontuacao += 0.5;
      motivos.push('Complementar a área relacionada');
    }
  }

  // 5. Bônus por combinações críticas entre facetas
  for (const combinacao of COMBINACOES_CRITICAS) {
    const resultadoA = resultados.find(r => r.faceta === combinacao.a);
    const resultadoB = resultados.find(r => r.faceta === combinacao.b);
    const aCritico = !!resultadoA && PONTOS_CLASSIFICACAO[resultadoA.classificacao] >= 2;
    const bCritico = !!resultadoB && PONTOS_CLASSIFICACAO[resultadoB.classificacao] >= 2;

    if (aCritico && bCritico && (protocolo.faceta === combinacao.a || protocolo.faceta === combinacao.b)) {
      pontuacao += combinacao.bonus;
      motivos.push(combinacao.motivo);
    }
  }

  return {
    pontuacao,
    motivo: motivos.join('; ') || 'Protocolo de manutenção',
  };
}

function compararPorPrioridadeTematica(a: Recomendacao, b: Recomendacao): number {
  if (b.pontuacao !== a.pontuacao) {
    return b.pontuacao - a.pontuacao;
  }

  const prioridadeA = PRIORIDADE_TEMATICA[a.protocolo.fator] ?? 99;
  const prioridadeB = PRIORIDADE_TEMATICA[b.protocolo.fator] ?? 99;
  if (prioridadeA !== prioridadeB) {
    return prioridadeA - prioridadeB;
  }

  return a.protocolo.codigo.localeCompare(b.protocolo.codigo);
}

function pontuarProtocolos(resultados: ResultadoFaceta[]): Recomendacao[] {
  return TODOS_PROTOCOLOS
    .filter(p => resultados.some(r => r.faceta === p.faceta))
    .map(protocolo => {
      const { pontuacao, motivo } = calcularPontuacaoProtocolo(protocolo, resultados);
      return {
        protocolo,
        pontuacao,
        prioridade: getPrioridade(pontuacao),
        motivo,
      };
    })
    .filter(r => r.pontuacao > 0)
    .sort(compararPorPrioridadeTematica);
}

function selecionarComRegra(
  protocolosPontuados: Recomendacao[],
  topCount: number,
  complementaresCount: number,
  ajusteCount: number
): Recomendacao[] {
  const selecionados: Recomendacao[] = [];
  const usados = new Set<string>();

  // Top principais por pontuação e prioridade temática
  for (const rec of protocolosPontuados) {
    if (selecionados.length >= topCount) break;
    if (usados.has(rec.protocolo.codigo)) continue;
    selecionados.push(rec);
    usados.add(rec.protocolo.codigo);
  }

  // Complementares: preferir facetas não contempladas ainda
  const facetasUsadas = new Set(selecionados.map(s => s.protocolo.faceta));
  for (const rec of protocolosPontuados) {
    if (selecionados.length >= topCount + complementaresCount) break;
    if (usados.has(rec.protocolo.codigo)) continue;
    if (!facetasUsadas.has(rec.protocolo.faceta)) {
      selecionados.push(rec);
      usados.add(rec.protocolo.codigo);
      facetasUsadas.add(rec.protocolo.faceta);
    }
  }

  // Completa complementares caso não haja variedade suficiente
  for (const rec of protocolosPontuados) {
    if (selecionados.length >= topCount + complementaresCount) break;
    if (usados.has(rec.protocolo.codigo)) continue;
    selecionados.push(rec);
    usados.add(rec.protocolo.codigo);
  }

  // Ajuste fino: prioriza tipo medio
  const ajusteFino = protocolosPontuados.find(
    rec => rec.protocolo.tipo === 'medio' && !usados.has(rec.protocolo.codigo)
  );

  if (ajusteFino && ajusteCount > 0) {
    selecionados.push(ajusteFino);
    usados.add(ajusteFino.protocolo.codigo);
  }

  // Fallback: se não achou ajuste tipo medio, completa com próximos
  for (const rec of protocolosPontuados) {
    if (selecionados.length >= topCount + complementaresCount + ajusteCount) break;
    if (usados.has(rec.protocolo.codigo)) continue;
    selecionados.push(rec);
    usados.add(rec.protocolo.codigo);
  }

  return selecionados;
}

/**
 * Determina o tipo ideal de protocolo baseado na classificação
 */
function getTipoIdeal(classificacao: Classificacao): 'alto' | 'baixo' | 'medio' {
  switch (classificacao) {
    case 'Muito Alto':
    case 'Alto':
      return 'alto';
    case 'Muito Baixo':
    case 'Baixo':
      return 'baixo';
    case 'Médio':
    default:
      return 'medio';
  }
}

/**
 * Determina a prioridade visual baseada na pontuação
 */
function getPrioridade(pontuacao: number): 'alta' | 'media' | 'baixa' {
  if (pontuacao >= 5) return 'alta';
  if (pontuacao >= 3) return 'media';
  return 'baixa';
}

/**
 * Gera recomendações de protocolos para o cliente
 * @param resultados Resultados das facetas do teste
 * @param limite Número máximo de protocolos a retornar (default: 3)
 */
export function recomendarProtocolos(
  resultados: ResultadoFaceta[],
  limite: number = 4
): Recomendacao[] {
  const base = recomendarProtocolosCliente(resultados);
  return base.slice(0, limite);
}

export function recomendarProtocolosCliente(
  resultados: ResultadoFaceta[]
): Recomendacao[] {
  const protocolosPontuados = pontuarProtocolos(resultados);
  // Regra do documento: top 3 + 1 ajuste fino = 4
  return selecionarComRegra(protocolosPontuados, 3, 0, 1).slice(0, 4);
}

/**
 * Gera recomendações completas para a treinadora
 * @param resultados Resultados das facetas do teste
 * @param limite Número máximo de protocolos a retornar (default: 6)
 */
export function recomendarProtocolosTreinadora(
  resultados: ResultadoFaceta[],
  limite: number = 6
): Recomendacao[] {
  const protocolosPontuados = pontuarProtocolos(resultados);
  // Regra do documento: top 3 + 2 complementares + 1 ajuste = 6
  return selecionarComRegra(protocolosPontuados, 3, 2, 1).slice(0, limite);
}

/**
 * Gera explicação personalizada para o cliente
 */
export function gerarExplicacaoRecomendacao(
  recomendacoes: Recomendacao[],
  resultadoDestaque: ResultadoFaceta
): string {
  if (recomendacoes.length === 0) {
    return 'Seu perfil está equilibrado. Continue com seus hábitos saudáveis de autoconhecimento.';
  }

  const areaPrincipal = resultadoDestaque.faceta;
  const nomeArea = recomendacoes[0]?.protocolo.facetaNome || 'personalidade';
  
  return `Com base nos seus resultados, identificamos que a área de ${nomeArea} merece atenção especial. ` +
         `Os protocolos selecionados foram personalizados para seu perfil atual.`;
}

/**
 * Identifica as facetas que mais precisam de atenção
 */
export function identificarFacetasPrioritarias(
  resultados: ResultadoFaceta[]
): ResultadoFaceta[] {
  return resultados
    .filter(r => PONTOS_CLASSIFICACAO[r.classificacao] >= 2)
    .sort((a, b) => {
      // Prioriza facetas de segurança emocional
      const aPrioridade = FACETAS_PRIORITARIAS.includes(a.faceta) ? 1 : 0;
      const bPrioridade = FACETAS_PRIORITARIAS.includes(b.faceta) ? 1 : 0;
      
      if (aPrioridade !== bPrioridade) {
        return bPrioridade - aPrioridade;
      }
      
      return PONTOS_CLASSIFICACAO[b.classificacao] - PONTOS_CLASSIFICACAO[a.classificacao];
    });
}

/**
 * Calcula estatísticas dos protocolos recomendados
 */
export function calcularEstatisticasRecomendacao(
  recomendacoes: Recomendacao[]
): {
  total: number;
  prioridadeAlta: number;
  prioridadeMedia: number;
  duracaoTotal: string;
} {
  const prioridadeAlta = recomendacoes.filter(r => r.prioridade === 'alta').length;
  const prioridadeMedia = recomendacoes.filter(r => r.prioridade === 'media').length;
  
  // Calcula duração total aproximada
  const semanasTotal = recomendacoes.reduce((acc, r) => {
    const match = r.protocolo.duracao.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 2);
  }, 0);

  return {
    total: recomendacoes.length,
    prioridadeAlta,
    prioridadeMedia,
    duracaoTotal: `${semanasTotal} semanas`,
  };
}

// Exporta utilitários
export { PROTOCOLOS, TODOS_PROTOCOLOS };
export type { Protocolo };
