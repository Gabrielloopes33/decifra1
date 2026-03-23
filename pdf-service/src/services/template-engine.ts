// ============================================
// Template Engine - Geração de HTML
// ============================================

import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  TemplateData,
  ResultadoData,
  ClienteData,
  TreinadoraData,
  ProtocoloRecomendado
} from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '../templates');

// Helper para formatar data
Handlebars.registerHelper('formatDate', (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
});

// Helper para formatar número
Handlebars.registerHelper('formatNumber', (num: number) => {
  return num.toFixed(1);
});

// Helper para barra de progresso
Handlebars.registerHelper('progressBar', function(score: number, color: string) {
  const width = Math.min(Math.max(score * 10, 0), 100); // 0-100%
  return new Handlebars.SafeString(`
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: ${width}%; background-color: ${color};"></div>
    </div>
  `);
});

// Helper para condicional
Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b;
});

// Helper para criar arrays
Handlebars.registerHelper('array', function(...args: any[]) {
  return args.slice(0, -1); // Remove o options object
});

// Helper para lookup
Handlebars.registerHelper('lookup', function(obj: any, field: string) {
  return obj ? obj[field] : undefined;
});

// Helper para nome do fator
Handlebars.registerHelper('fatorNome', function(sigla: string) {
  const nomes: Record<string, string> = {
    'N': 'Neuroticismo',
    'E': 'Extroversão',
    'O': 'Abertura',
    'A': 'Amabilidade',
    'C': 'Conscienciosidade'
  };
  return nomes[sigla] || sigla;
});

// Helper para cor do fator
Handlebars.registerHelper('fatorCor', function(sigla: string) {
  const cores: Record<string, string> = {
    'N': '#C4785A',
    'E': '#D4A574',
    'O': '#7B9E87',
    'A': '#9B8AA5',
    'C': '#5A8A9C'
  };
  return cores[sigla] || '#C4785A';
});

// Helper para slug de classificação
Handlebars.registerHelper('classSlug', function(classificacao: string) {
  if (!classificacao) return 'medio';
  const slug = classificacao.toLowerCase();
  if (slug.includes('baix')) return 'baixo';
  if (slug.includes('alt')) return 'alto';
  return 'medio';
});

export class TemplateEngine {
  
  /**
   * Carrega template do arquivo
   */
  static async loadTemplate(tipo: 'cliente' | 'treinadora'): Promise<Handlebars.TemplateDelegate> {
    const templatePath = join(TEMPLATES_DIR, `${tipo}.html`);
    const templateContent = await readFile(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  /**
   * Prepara dados para o template
   */
  static prepareTemplateData(
    resultado: ResultadoData,
    cliente: ClienteData,
    treinadora: TreinadoraData | null,
    protocolos: ProtocoloRecomendado[],
    tipo: 'cliente' | 'treinadora'
  ): TemplateData {
    // Mapear fatores
    const fatoresOrdenados = ['N', 'E', 'O', 'A', 'C'];
    const scoresFatores = fatoresOrdenados.map(sigla => {
      const score = resultado.scores_fatores[sigla] || 0;
      const percentil = resultado.percentis[`${sigla}1`] || 50;
      const classificacao = resultado.classificacoes[sigla] || 'Médio';
      
      const cores: Record<string, string> = {
        'N': '#C4785A',
        'E': '#D4A574',
        'O': '#7B9E87',
        'A': '#9B8AA5',
        'C': '#5A8A9C'
      };
      
      const nomes: Record<string, string> = {
        'N': 'Neuroticismo',
        'E': 'Extroversão',
        'O': 'Abertura',
        'A': 'Amabilidade',
        'C': 'Conscienciosidade'
      };

      return {
        nome: nomes[sigla],
        sigla,
        score,
        percentil,
        classificacao,
        cor: cores[sigla]
      };
    });

    // Mapear facetas (apenas para treinadora)
    let scoresFacetas: TemplateData['resultado']['scoresFacetas'] = undefined;
    
    if (tipo === 'treinadora') {
      const facetaNomes: Record<string, string> = {
        'N1': 'Ansiedade', 'N2': 'Hostilidade', 'N3': 'Depressão',
        'N4': 'Autoconsciência', 'N5': 'Impulsividade', 'N6': 'Vulnerabilidade',
        'E1': 'Cordialidade', 'E2': 'Gregarismo', 'E3': 'Assertividade',
        'E4': 'Atividade', 'E5': 'Busca de Emoções', 'E6': 'Emoções Positivas',
        'O1': 'Fantasia', 'O2': 'Estética', 'O3': 'Sentimentos',
        'O4': 'Ações', 'O5': 'Ideias', 'O6': 'Valores',
        'A1': 'Confiança', 'A2': 'Moralidade', 'A3': 'Altruísmo',
        'A4': 'Cooperação', 'A5': 'Modéstia', 'A6': 'Empatia',
        'C1': 'Autoeficácia', 'C2': 'Ordem', 'C3': 'Sentido de Dever',
        'C4': 'Realização', 'C5': 'Autodisciplina', 'C6': 'Deliberação'
      };
      
      const facetaFatorMap: Record<string, string> = {
        'N1': 'N', 'N2': 'N', 'N3': 'N', 'N4': 'N', 'N5': 'N', 'N6': 'N',
        'E1': 'E', 'E2': 'E', 'E3': 'E', 'E4': 'E', 'E5': 'E', 'E6': 'E',
        'O1': 'O', 'O2': 'O', 'O3': 'O', 'O4': 'O', 'O5': 'O', 'O6': 'O',
        'A1': 'A', 'A2': 'A', 'A3': 'A', 'A4': 'A', 'A5': 'A', 'A6': 'A',
        'C1': 'C', 'C2': 'C', 'C3': 'C', 'C4': 'C', 'C5': 'C', 'C6': 'C'
      };

      scoresFacetas = Object.entries(resultado.scores_facetas).map(([codigo, score]) => {
        const percentil = resultado.percentis[codigo] || 50;
        const classificacao = resultado.classificacoes[codigo] || 'Médio';
        
        return {
          codigo,
          nome: facetaNomes[codigo] || codigo,
          fator: facetaFatorMap[codigo] || '?',
          score,
          percentil,
          classificacao
        };
      }).sort((a, b) => a.codigo.localeCompare(b.codigo));
    }

    // Mapear protocolos
    const protocolosData = protocolos.map(p => ({
      faceta: p.protocolo.faceta,
      tipo: p.protocolo.tipo,
      titulo: p.protocolo.titulo,
      descricao: p.protocolo.descricao,
      exercicios: Array.isArray(p.protocolo.exercicios) 
        ? p.protocolo.exercicios 
        : JSON.parse(p.protocolo.exercicios as any),
      prioridade: p.prioridade
    }));

    return {
      cliente: {
        nome: cliente.nome,
        email: cliente.email,
        dataAvaliacao: resultado.created_at
      },
      treinadora: treinadora ? {
        nome: treinadora.nome,
        email: treinadora.email
      } : undefined,
      resultado: {
        scoresFatores,
        scoresFacetas
      },
      protocolos: protocolosData,
      tipo,
      dataGeracao: new Date().toISOString()
    };
  }

  /**
   * Renderiza template com dados
   */
  static async render(tipo: 'cliente' | 'treinadora', data: TemplateData): Promise<string> {
    const template = await this.loadTemplate(tipo);
    return template(data);
  }
}
