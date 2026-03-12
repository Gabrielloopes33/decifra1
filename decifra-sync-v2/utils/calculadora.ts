import { QUESTAO_FACETA_MAP, QUESTOES_INVERTIDAS, FACETAS, FATORES } from '@/constants/ipip';
  import type { FacetaKey, FatorKey } from '@/constants/ipip';

  export interface Resposta {
    questao_id: number;
    resposta: number; // 1-5
  }

  export interface ScoreFaceta {
    faceta: FacetaKey;
    score: number; // 4-20
    percentil: number; // 5-95
    classificacao: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  }

  export interface ScoreFator {
    fator: FatorKey;
    score: number; // 24-120
    percentil: number; // 5-95
    classificacao: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  }

  export interface ResultadoCompleto {
    scoresFacetas: ScoreFaceta[];
    scoresFatores: ScoreFator[];
  }

  // Tabela de percentis por faceta (valores aproximados baseados em normas brasileiras)
  const PERCENTIS_FACETAS: Record<FacetaKey, number[]> = {
    // Neuroticismo
    N1: [6, 8, 10, 12, 14, 16, 18], // Ansiedade
    N2: [5, 7, 9, 11, 13, 15, 17], // Raiva
    N3: [5, 7, 9, 11, 13, 15, 17], // Depressão
    N4: [6, 8, 10, 12, 14, 16, 18], // Autoconsciência
    N5: [5, 7, 9, 11, 13, 15, 17], // Imoderação
    N6: [5, 7, 9, 11, 13, 15, 17], // Vulnerabilidade
    
    // Extroversão
    E1: [8, 10, 12, 14, 16, 18, 20], // Cordialidade
    E2: [6, 8, 10, 12, 14, 16, 18], // Gregariedade
    E3: [7, 9, 11, 13, 15, 17, 19], // Assertividade
    E4: [7, 9, 11, 13, 15, 17, 19], // Atividade
    E5: [6, 8, 10, 12, 14, 16, 18], // Sensações
    E6: [8, 10, 12, 14, 16, 18, 20], // Emoções Positivas
    
    // Abertura
    O1: [6, 8, 10, 12, 14, 16, 18], // Fantasia
    O2: [7, 9, 11, 13, 15, 17, 19], // Estética
    O3: [8, 10, 12, 14, 16, 18, 20], // Sentimentos
    O4: [6, 8, 10, 12, 14, 16, 18], // Ações
    O5: [7, 9, 11, 13, 15, 17, 19], // Ideias
    O6: [6, 8, 10, 12, 14, 16, 18], // Valores
    
    // Amabilidade
    A1: [8, 10, 12, 14, 16, 18, 20], // Confiança
    A2: [8, 10, 12, 14, 16, 18, 20], // Franqueza
    A3: [9, 11, 13, 15, 17, 19, 21], // Altruísmo
    A4: [7, 9, 11, 13, 15, 17, 19], // Complacência
    A5: [7, 9, 11, 13, 15, 17, 19], // Modéstia
    A6: [9, 11, 13, 15, 17, 19, 21], // Sensibilidade
    
    // Conscienciosidade
    C1: [8, 10, 12, 14, 16, 18, 20], // Competência
    C2: [6, 8, 10, 12, 14, 16, 18], // Ordem
    C3: [9, 11, 13, 15, 17, 19, 21], // Dever
    C4: [8, 10, 12, 14, 16, 18, 20], // Realizações
    C5: [7, 9, 11, 13, 15, 17, 19], // Autodisciplina
    C6: [7, 9, 11, 13, 15, 17, 19], // Ponderação
  };

  // Converter score bruto em percentil (interpolação linear)
  function calcularPercentil(score: number, tabelaPercentis: number[]): number {
    // tabelaPercentis representa: [5, 15, 30, 50, 70, 85, 95]
    const percentis = [5, 15, 30, 50, 70, 85, 95];
    
    if (score <= tabelaPercentis[0]) return 5;
    if (score >= tabelaPercentis[6]) return 95;
    
    for (let i = 0; i < tabelaPercentis.length - 1; i++) {
      if (score >= tabelaPercentis[i] && score <= tabelaPercentis[i + 1]) {
        const scoreRange = tabelaPercentis[i + 1] - tabelaPercentis[i];
        const percentilRange = percentis[i + 1] - percentis[i];
        const scoreOffset = score - tabelaPercentis[i];
        const percentil = percentis[i] + (scoreOffset / scoreRange) * percentilRange;
        return Math.round(percentil);
      }
    }
    
    return 50; // fallback
  }

  // Classificar baseado no percentil
  function classificar(percentil: number): 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' {
    if (percentil <= 15) return 'Muito Baixo';
    if (percentil <= 35) return 'Baixo';
    if (percentil <= 65) return 'Médio';
    if (percentil <= 85) return 'Alto';
    return 'Muito Alto';
  }

  // Calcular scores de facetas
  function calcularScoresFacetas(respostas: Resposta[]): ScoreFaceta[] {
    const scoresPorFaceta: Partial<Record<FacetaKey, number>> = {};
    
    // Agrupar respostas por faceta
    respostas.forEach(({ questao_id, resposta }) => {
      const faceta = QUESTAO_FACETA_MAP[questao_id];
      if (!faceta) return;
      
      // Inverter pontuação se necessário
      const pontuacao = QUESTOES_INVERTIDAS.includes(questao_id) 
        ? 6 - resposta // Invertida: 1→5, 2→4, 3→3, 4→2, 5→1
        : resposta;
      
      if (!scoresPorFaceta[faceta]) {
        scoresPorFaceta[faceta] = 0;
      }
      scoresPorFaceta[faceta]! += pontuacao;
    });
    
    // Calcular percentis e classificações
    const resultados: ScoreFaceta[] = Object.entries(scoresPorFaceta).map(([faceta, score]) => {
      const facetaKey = faceta as FacetaKey;
      const percentil = calcularPercentil(score!, PERCENTIS_FACETAS[facetaKey]);
      const classificacao = classificar(percentil);
      
      return {
        faceta: facetaKey,
        score: score!,
        percentil,
        classificacao,
      };
    });
    
    return resultados;
  }

  // Calcular scores de fatores (soma das 6 facetas de cada fator)
  function calcularScoresFatores(scoresFacetas: ScoreFaceta[]): ScoreFator[] {
    const fatoresFacetas: Record<FatorKey, FacetaKey[]> = {
      N: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'],
      E: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
      O: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6'],
      A: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
      C: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
    };
    
    const scoresFatores: ScoreFator[] = [];
    
    Object.entries(fatoresFacetas).forEach(([fator, facetas]) => {
      const scoreFator = facetas.reduce((soma, faceta) => {
        const scoreFaceta = scoresFacetas.find(sf => sf.faceta === faceta);
        return soma + (scoreFaceta?.score || 0);
      }, 0);
      
      // Calcular média dos percentis das facetas
      const percentilMedio = Math.round(
        facetas.reduce((soma, faceta) => {
          const scoreFaceta = scoresFacetas.find(sf => sf.faceta === faceta);
          return soma + (scoreFaceta?.percentil || 50);
        }, 0) / 6
      );
      
      scoresFatores.push({
        fator: fator as FatorKey,
        score: scoreFator,
        percentil: percentilMedio,
        classificacao: classificar(percentilMedio),
      });
    });
    
    return scoresFatores;
  }

  // Função principal de cálculo
  export function calcularResultado(respostas: Resposta[]): ResultadoCompleto {
    if (respostas.length !== 120) {
      throw new Error(`Esperadas 120 respostas, recebidas ${respostas.length}`);
    }
    
    const scoresFacetas = calcularScoresFacetas(respostas);
    const scoresFatores = calcularScoresFatores(scoresFacetas);
    
    return {
      scoresFacetas,
      scoresFatores,
    };
  }

  // Identificar facetas que precisam de atenção (para recomendação de protocolos)
  export function identificarFacetasPrioritarias(scoresFacetas: ScoreFaceta[]): FacetaKey[] {
    // Priorizar: Muito Alto ou Muito Baixo, depois Alto ou Baixo
    const prioridades = {
      'Muito Baixo': 3,
      'Baixo': 2,
      'Médio': 0,
      'Alto': 2,
      'Muito Alto': 3,
    };
    
    return scoresFacetas
      .map(sf => ({ ...sf, prioridade: prioridades[sf.classificacao] }))
      .sort((a, b) => b.prioridade - a.prioridade)
      .filter(sf => sf.prioridade > 0)
      .map(sf => sf.faceta);
  }
  