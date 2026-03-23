// ============================================
// Tipos do Serviço PDF
// ============================================

export interface GerarPDFRequest {
  resultadoId: string;
  tipo: 'cliente' | 'treinadora';
  token: string;
}

export interface GerarPDFResponse {
  success: boolean;
  data?: {
    pdf?: string;        // base64
    url?: string;        // URL do storage
    filename: string;
    tamanho: number;
    tipo: 'cliente' | 'treinadora';
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ResultadoData {
  id: string;
  cliente_id: string;
  scores_facetas: Record<string, number>;
  scores_fatores: Record<string, number>;
  percentis: Record<string, number>;
  classificacoes: Record<string, string>;
  created_at: string;
}

export interface ClienteData {
  id: string;
  nome: string;
  email: string | null;
  treinadora_id: string;
  status: string;
  created_at: string;
}

export interface TreinadoraData {
  id: string;
  nome: string;
  email: string;
}

export interface Protocolo {
  id: string;
  faceta: string;
  tipo: 'baixo' | 'medio' | 'alto';
  titulo: string;
  descricao: string;
  exercicios: string[];
}

export interface ProtocoloRecomendado {
  protocolo: Protocolo;
  prioridade: number;
}

export interface TemplateData {
  // Informações do cliente
  cliente: {
    nome: string;
    email: string | null;
    dataAvaliacao: string;
  };
  
  // Informações da treinadora (se disponível)
  treinadora?: {
    nome: string;
    email: string;
  };
  
  // Dados do resultado
  resultado: {
    scoresFatores: {
      nome: string;
      sigla: string;
      score: number;
      percentil: number;
      classificacao: string;
      cor: string;
    }[];
    scoresFacetas?: {
      codigo: string;
      nome: string;
      fator: string;
      score: number;
      percentil: number;
      classificacao: string;
    }[];
  };
  
  // Protocolos recomendados
  protocolos: {
    faceta: string;
    tipo: string;
    titulo: string;
    descricao: string;
    exercicios: string[];
    prioridade: number;
  }[];
  
  // Configurações
  tipo: 'cliente' | 'treinadora';
  dataGeracao: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

// Mapeamento de fatores
export const FATOR_NOMES: Record<string, string> = {
  'N': 'Neuroticismo',
  'E': 'Extroversão',
  'O': 'Abertura',
  'A': 'Amabilidade',
  'C': 'Conscienciosidade'
};

export const FATOR_CORES: Record<string, string> = {
  'N': '#C4785A', // Terracota
  'E': '#D4A574', // Laranja claro
  'O': '#7B9E87', // Verde suave
  'A': '#9B8AA5', // Lavanda
  'C': '#5A8A9C'  // Azul acinzentado
};

// Mapeamento de facetas (30 facetas do IPIP-NEO-120)
export const FACETA_NOMES: Record<string, string> = {
  'N1': 'Ansiedade',
  'N2': 'Hostilidade',
  'N3': 'Depressão',
  'N4': 'Autoconsciência',
  'N5': 'Impulsividade',
  'N6': 'Vulnerabilidade',
  'E1': 'Cordialidade',
  'E2': 'Gregarismo',
  'E3': 'Assertividade',
  'E4': 'Atividade',
  'E5': 'Busca de Emoções',
  'E6': 'Emoções Positivas',
  'O1': 'Fantasia',
  'O2': 'Estética',
  'O3': 'Sentimentos',
  'O4': 'Ações',
  'O5': 'Ideias',
  'O6': 'Valores',
  'A1': 'Confiança',
  'A2': 'Moralidade',
  'A3': 'Altruísmo',
  'A4': 'Cooperação',
  'A5': 'Modéstia',
  'A6': 'Empatia',
  'C1': 'Autoeficácia',
  'C2': 'Ordem',
  'C3': 'Sentido de Dever',
  'C4': 'Realização',
  'C5': 'Autodisciplina',
  'C6': 'Deliberação'
};

export const FACETA_FATOR_MAP: Record<string, string> = {
  'N1': 'N', 'N2': 'N', 'N3': 'N', 'N4': 'N', 'N5': 'N', 'N6': 'N',
  'E1': 'E', 'E2': 'E', 'E3': 'E', 'E4': 'E', 'E5': 'E', 'E6': 'E',
  'O1': 'O', 'O2': 'O', 'O3': 'O', 'O4': 'O', 'O5': 'O', 'O6': 'O',
  'A1': 'A', 'A2': 'A', 'A3': 'A', 'A4': 'A', 'A5': 'A', 'A6': 'A',
  'C1': 'C', 'C2': 'C', 'C3': 'C', 'C4': 'C', 'C5': 'C', 'C6': 'C'
};
