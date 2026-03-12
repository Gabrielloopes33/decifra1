/**
 * Ordem anti-manipulação das 120 questões IPIP-NEO-120
 * 
 * Esta ordem específica evita padrões de resposta previsíveis
 * e distribui as questões de forma balanceada entre as facetas
 * em cada estação do teste.
 */

// Ordem completa das 120 questões (números de 1-120)
export const ORDEM_ANTI_MANIPULACAO = [
  // Estação 1: Questões 1-30
  73, 45, 117, 9, 29, 101, 53, 85, 37, 65,
  1, 21, 97, 77, 49, 109, 61, 33, 13, 5,
  89, 41, 113, 17, 69, 105, 57, 81, 25, 93,
  
  // Estação 2: Questões 31-60
  2, 46, 118, 10, 30, 102, 54, 86, 38, 66,
  22, 98, 78, 50, 110, 62, 34, 14, 6, 90,
  42, 114, 18, 70, 106, 58, 82, 26, 94, 74,
  
  // Estação 3: Questões 61-90
  3, 47, 119, 11, 31, 103, 55, 87, 39, 67,
  23, 99, 79, 51, 111, 63, 35, 15, 7, 91,
  43, 115, 19, 71, 107, 59, 83, 27, 95, 75,
  
  // Estação 4: Questões 91-120
  4, 48, 120, 12, 32, 104, 56, 88, 40, 68,
  24, 100, 80, 52, 112, 64, 36, 16, 8, 92,
  44, 116, 20, 72, 108, 60, 84, 28, 96, 76,
] as const;

// Questões organizadas por estação (30 questões cada)
export const ESTACOES_ORDEM = {
  1: ORDEM_ANTI_MANIPULACAO.slice(0, 30),
  2: ORDEM_ANTI_MANIPULACAO.slice(30, 60),
  3: ORDEM_ANTI_MANIPULACAO.slice(60, 90),
  4: ORDEM_ANTI_MANIPULACAO.slice(90, 120),
} as const;

// Helper para obter questões de uma estação específica
export function getQuestoesEstacao(estacao: 1 | 2 | 3 | 4): readonly number[] {
  return ESTACOES_ORDEM[estacao];
}

// Verificar se a ordem está correta (debug)
export function validarOrdem(): { valido: boolean; total: number; mensagem: string } {
  const todosNumeros = new Set(ORDEM_ANTI_MANIPULACAO);
  const valido = todosNumeros.size === 120 && 
                 Math.min(...ORDEM_ANTI_MANIPULACAO) === 1 &&
                 Math.max(...ORDEM_ANTI_MANIPULACAO) === 120;
  
  return {
    valido,
    total: ORDEM_ANTI_MANIPULACAO.length,
    mensagem: valido 
      ? 'Ordem anti-manipulação válida: 120 questões únicas de 1 a 120'
      : 'ERRO: Ordem contém duplicatas ou números fora do intervalo 1-120',
  };
}
