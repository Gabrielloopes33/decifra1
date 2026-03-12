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
const FACETAS_PRIORITARIAS = ['N1', 'N6', 'N2'];

// Complemento entre polos
const POLOS_COMPLEMENTARES: Record<string, string> = {
  'N1': 'N6',  // Ansiedade e Vulnerabilidade se influenciam
  'N2': 'N6',  // Raiva e Vulnerabilidade
};

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

  return {
    pontuacao,
    motivo: motivos.join('; ') || 'Protocolo de manutenção',
  };
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
  limite: number = 3
): Recomendacao[] {
  // Calcular pontuação para todos os protocolos disponíveis
  const protocolosPontuados = TODOS_PROTOCOLOS
    .filter(p => resultados.some(r => r.faceta === p.faceta)) // Apenas protocolos para facetas testadas
    .map(protocolo => {
      const { pontuacao, motivo } = calcularPontuacaoProtocolo(protocolo, resultados);
      return {
        protocolo,
        pontuacao,
        prioridade: getPrioridade(pontuacao),
        motivo,
      };
    })
    .filter(r => r.pontuacao > 0) // Remove protocolos sem pontuação
    .sort((a, b) => b.pontuacao - a.pontuacao); // Ordena por pontuação

  // Retorna os N melhores, garantindo variedade de facetas se possível
  const selecionados: Recomendacao[] = [];
  const facetasUsadas = new Set<string>();

  // Primeiro, adiciona os de maior pontuação
  for (const recomendacao of protocolosPontuados) {
    if (selecionados.length >= limite) break;
    
    // Evita duplicar facetas se houver opções suficientes
    if (!facetasUsadas.has(recomendacao.protocolo.faceta) || selecionados.length < limite - 1) {
      selecionados.push(recomendacao);
      facetasUsadas.add(recomendacao.protocolo.faceta);
    }
  }

  return selecionados;
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
  return recomendarProtocolos(resultados, limite);
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
