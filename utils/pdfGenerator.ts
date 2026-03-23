/**
 * Gerador de PDF para Resultados DECIFRA
 * Identidade Visual Ártio completa
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { FATORES } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';
import { getInterpretacao, type Faixa } from '@/constants/interpretacoes';
import { PROTOCOLOS } from '@/constants/protocolos';

interface FatorScore {
  fator: FatorKey;
  score: number;
  percentil: number;
  classificacao: string;
}

interface FacetaScore {
  faceta: string;
  score: number;
  percentil: number;
  classificacao: string;
}

interface Protocolo {
  id: string;
  titulo: string;
  descricao: string;
  prioridade?: number;
}

interface PDFData {
  cliente: { 
    nome: string; 
    email?: string;
    id?: string;
  };
  resultado: {
    id?: string;
    scores_fatores: FatorScore[];
    scores_facetas?: FacetaScore[];
  };
  protocolos: Protocolo[];
  codigo?: string;
  dataTeste: string;
  tipo: 'cliente' | 'treinadora';
}

// Cores Ártio
const COLORS = {
  vinhoDeep: '#2D1518',
  vinhoDark: '#3D1A1E',
  vinho: '#6B2D3A',
  terracota: '#C4785A',
  terracotaLight: '#D4896A',
  cream: '#F5F0E8',
  creamLight: '#FAF8F5',
  creamDark: '#E8E0D1',
};

function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function gerarPDF(dados: PDFData): Promise<void> {
  console.log('[PDF] Iniciando geração do PDF para:', dados.cliente.nome);
  
  try {
    if (!dados.cliente?.nome) {
      throw new Error('Nome do cliente é obrigatório');
    }
    if (!dados.resultado?.scores_fatores || dados.resultado.scores_fatores.length === 0) {
      throw new Error('Scores dos fatores são obrigatórios');
    }
    
    const html = gerarTemplateHTML(dados);
    
    if (Platform.OS === 'web') {
      await gerarPDFWeb(html, dados);
    } else {
      await gerarPDFMobile(html, dados);
    }
  } catch (error) {
    console.error('[PDF] Erro ao gerar PDF:', error);
    throw error;
  }
}

async function gerarPDFWeb(html: string, dados: PDFData): Promise<void> {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão. Verifique se o pop-up está bloqueado.');
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 800);
}

async function gerarPDFMobile(html: string, dados: PDFData): Promise<void> {
  console.log('[PDF Mobile] Iniciando geração...');
  
  try {
    // 1. Gerar PDF
    console.log('[PDF Mobile] Chamando Print.printToFileAsync...');
    const result = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    console.log('[PDF Mobile] Resultado:', result);
    
    if (!result || !result.uri) {
      throw new Error('Falha ao gerar PDF: URI não retornada');
    }
    
    const tempUri = result.uri;
    console.log('[PDF Mobile] PDF temporário em:', tempUri);
    
    // 2. Verificar sharing
    console.log('[PDF Mobile] Verificando Sharing...');
    const isAvailable = await Sharing.isAvailableAsync();
    console.log('[PDF Mobile] Sharing disponível:', isAvailable);
    
    if (!isAvailable) {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }

    // 3. Compartilhar o arquivo temporário diretamente
    console.log('[PDF Mobile] Abrindo share sheet...');
    await Sharing.shareAsync(tempUri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar Resultado DECIFRA',
    });
    
    console.log('[PDF Mobile] Sucesso!');
    
  } catch (error) {
    console.error('[PDF Mobile] Erro detalhado:', error);
    throw error;
  }
}

function gerarTemplateHTML(dados: PDFData): string {
  const { cliente, resultado, protocolos, codigo, dataTeste, tipo } = dados;
  const isTreinadora = tipo === 'treinadora';
  
  const ordemFatores: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = ordemFatores.map(fator => 
    resultado.scores_fatores.find(s => s.fator === fator)
  ).filter((s): s is FatorScore => s !== undefined);

  const classificarParaFaixa = (classificacao: string): Faixa => {
    const normalized = classificacao.toLowerCase().trim();
    if (normalized.includes('muito') && normalized.includes('baixo')) return 'Muito Baixo';
    if (normalized.includes('baixo')) return 'Baixo';
    if (normalized.includes('muito') && normalized.includes('alto')) return 'Muito Alto';
    if (normalized.includes('alto')) return 'Alto';
    return 'Médio';
  };

  const fatorDestaque = [...scoresOrdenados]
    .sort((a, b) => Math.abs(b.percentil - 50) - Math.abs(a.percentil - 50))[0];

  const interpretacaoDestaque = fatorDestaque
    ? getInterpretacao(fatorDestaque.fator, classificarParaFaixa(fatorDestaque.classificacao))
    : null;

  // Wrapper com fundo escuro garantido
  const pageBackground = COLORS.vinhoDeep;
  const cardBackground = COLORS.vinhoDark;

  // Facetas
  let facetasHTML = '';
  if (isTreinadora && resultado.scores_facetas && resultado.scores_facetas.length > 0) {
    const facetasPorColuna = Math.ceil(resultado.scores_facetas.length / 2);
    const coluna1 = resultado.scores_facetas.slice(0, facetasPorColuna);
    const coluna2 = resultado.scores_facetas.slice(facetasPorColuna);
    
    facetasHTML = `
      <div style="margin-top: 32px;">
        <div style="font-size: 20px; font-weight: 700; color: ${COLORS.cream}; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid ${COLORS.terracota}; font-family: 'Urbanist', sans-serif;">
          30 Facetas Detalhadas
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              ${coluna1.map(f => `
                <div style="background: ${cardBackground}; padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid ${COLORS.terracota}60;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 13px; font-family: 'Urbanist', sans-serif;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.terracota}; font-size: 14px; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
                      <span style="font-size: 11px; color: ${COLORS.creamDark}; display: block; margin-top: 2px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
                    </span>
                  </div>
                </div>
              `).join('')}
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              ${coluna2.map(f => `
                <div style="background: ${cardBackground}; padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid ${COLORS.terracota}60;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 13px; font-family: 'Urbanist', sans-serif;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.terracota}; font-size: 14px; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
                      <span style="font-size: 11px; color: ${COLORS.creamDark}; display: block; margin-top: 2px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
                    </span>
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  // Protocolos
  const protocolosHTML = protocolos.length > 0 
    ? protocolos.map((p, i) => {
      const protocoloCompleto = PROTOCOLOS[p.id as keyof typeof PROTOCOLOS];
      const titulo = escapeHtml(protocoloCompleto?.titulo || p.titulo);
      const objetivo = escapeHtml(protocoloCompleto?.objetivo || 'Objetivo não informado.');
      const descricao = escapeHtml(protocoloCompleto?.descricao || p.descricao);

      const exercicios = (protocoloCompleto?.exercicios || []).map((exercicio, idx) => {
        const tituloExercicio = escapeHtml(exercicio.titulo || `Exercício ${idx + 1}`);
        const descricaoExercicio = escapeHtml(exercicio.descricao || '');
        const frequencia = escapeHtml(exercicio.frequencia || 'Não informado');
        const duracao = escapeHtml(exercicio.duracao || 'Não informado');

        return `
          <div style="margin-bottom: 10px; padding: 10px 12px; border-radius: 8px; background: ${COLORS.vinhoDeep}; border: 1px solid ${COLORS.terracota}40;">
            <div style="font-size: 13px; font-weight: 700; color: ${COLORS.cream}; margin-bottom: 4px; font-family: 'Urbanist', sans-serif;">${idx + 1}. ${tituloExercicio}</div>
            <div style="font-size: 12px; color: ${COLORS.creamDark}; line-height: 1.6; margin-bottom: 6px; font-family: 'Urbanist', sans-serif;">${descricaoExercicio}</div>
            <div style="font-size: 11px; color: ${COLORS.terracotaLight}; font-family: 'Urbanist', sans-serif;">Frequência: ${frequencia} | Duração: ${duracao}</div>
          </div>
        `;
      }).join('');

      return `
        <div style="background: ${cardBackground}; border-radius: 14px; padding: 20px; margin-bottom: 14px; border: 1px solid ${COLORS.terracota}60;">
          <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: ${i < 3 ? COLORS.terracota : COLORS.vinho}; color: ${COLORS.cream}; border-radius: 50%; font-weight: 700; font-size: 15px; flex-shrink: 0; border: 2px solid ${COLORS.cream}40; font-family: 'Urbanist', sans-serif;">${i + 1}</div>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: ${COLORS.cream}; font-size: 16px; margin-bottom: 8px; font-family: 'Urbanist', sans-serif;">${titulo}</div>
              <div style="font-size: 13px; color: ${COLORS.terracotaLight}; margin-bottom: 6px; font-weight: 700; font-family: 'Urbanist', sans-serif;">Objetivo</div>
              <div style="font-size: 13px; color: ${COLORS.creamDark}; line-height: 1.6; margin-bottom: 10px; font-family: 'Urbanist', sans-serif;">${objetivo}</div>
              <div style="font-size: 13px; color: ${COLORS.terracotaLight}; margin-bottom: 6px; font-weight: 700; font-family: 'Urbanist', sans-serif;">Descrição</div>
              <div style="font-size: 13px; color: ${COLORS.creamDark}; line-height: 1.6; margin-bottom: 12px; font-family: 'Urbanist', sans-serif;">${descricao}</div>
              ${exercicios ? `
                <div style="font-size: 13px; color: ${COLORS.terracotaLight}; margin-bottom: 8px; font-weight: 700; font-family: 'Urbanist', sans-serif;">Exercícios</div>
                ${exercicios}
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('')
    : `
      <div style="background: ${cardBackground}; border-radius: 14px; padding: 24px; border: 1px solid ${COLORS.terracota}60; text-align: center;">
        <div style="color: ${COLORS.creamDark}; font-size: 14px; font-style: italic; font-family: 'Urbanist', sans-serif;">Nenhum protocolo recomendado para este perfil.</div>
      </div>
    `;

  // Fatores
  const fatoresHTML = scoresOrdenados.map(f => `
    <div style="background: ${cardBackground}; border-radius: 16px; padding: 22px; margin-bottom: 16px; border: 2px solid ${COLORS.terracota}80;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-weight: 700; font-size: 18px; color: ${COLORS.cream}; font-family: 'Urbanist', sans-serif;">${FATORES[f.fator]}</span>
        <span style="background: ${COLORS.terracota}; color: ${COLORS.vinhoDeep}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
      </div>
      <div>
        <div style="height: 14px; background: ${COLORS.vinhoDeep}; border-radius: 7px; overflow: hidden; border: 1px solid ${COLORS.terracota}40;">
          <div style="height: 100%; background: linear-gradient(90deg, ${COLORS.terracota} 0%, ${COLORS.terracotaLight} 100%); border-radius: 7px; width: ${f.percentil}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <span style="font-size: 13px; color: ${COLORS.creamDark}; font-family: 'Urbanist', sans-serif;">Percentil</span>
          <span style="font-size: 20px; color: ${COLORS.terracota}; font-weight: 800; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
        </div>
        ${isTreinadora ? `<div style="font-size: 12px; color: ${COLORS.creamDark}; margin-top: 6px; text-align: right; font-style: italic; font-family: 'Urbanist', sans-serif;">Score bruto: ${f.score.toFixed(2)}</div>` : ''}
      </div>
    </div>
  `).join('');

  const interpretacaoHTML = interpretacaoDestaque && fatorDestaque
    ? `
      <div style="margin-top: 24px; background: ${cardBackground}; border-radius: 16px; padding: 20px; border: 1px solid ${COLORS.terracota}60;">
        <div style="font-size: 20px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 6px; font-family: 'Urbanist', sans-serif;">
          ${isTreinadora ? 'Interpretação Principal' : 'Quem Você É'}
        </div>
        <div style="font-size: 13px; color: ${COLORS.terracotaLight}; margin-bottom: 10px; font-family: 'Urbanist', sans-serif;">
          Destaque em ${FATORES[fatorDestaque.fator]}
        </div>
        <div style="font-size: 16px; font-weight: 700; color: ${COLORS.cream}; margin-bottom: 4px; font-family: 'Urbanist', sans-serif;">
          ${interpretacaoDestaque.titulo}
        </div>
        <div style="font-size: 14px; font-weight: 600; color: ${COLORS.terracota}; margin-bottom: 10px; font-family: 'Urbanist', sans-serif;">
          ${interpretacaoDestaque.subtitulo}
        </div>
        <div style="font-size: 14px; color: ${COLORS.creamDark}; line-height: 1.7; font-family: 'Urbanist', sans-serif;">
          ${interpretacaoDestaque.descricao}
        </div>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado DECIFRA - ${cliente.nome}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 0;
      padding: 0;
      size: auto;
    }
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: ${pageBackground} !important;
      }
      .page-wrapper {
        background: ${pageBackground} !important;
        margin: 0 !important;
        padding: 40px 32px !important;
        min-height: 100vh;
      }
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: ${pageBackground};
      font-family: 'Urbanist', sans-serif;
    }
    .page-wrapper {
      background: ${pageBackground};
      min-height: 100vh;
      padding: 40px 32px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    
    <!-- Header (espaço reservado para logo no backend) -->
    <div style="text-align: center; padding-bottom: 28px; margin-bottom: 28px; border-bottom: 2px solid ${COLORS.terracota}60;">
      <!-- Espaço reservado para logo -->
      <div style="height: 20px;"></div>
      <div style="font-size: 36px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 6px; letter-spacing: 4px; text-transform: uppercase; font-family: 'Urbanist', sans-serif;">DECIFRA</div>
      <div style="font-size: 15px; color: ${COLORS.terracota}; font-weight: 600; letter-spacing: 2px; font-family: 'Urbanist', sans-serif;">Avaliação de Personalidade Big Five</div>
      <div style="display: inline-block; background: ${COLORS.terracota}; color: ${COLORS.vinhoDeep}; padding: 10px 24px; border-radius: 24px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; font-family: 'Urbanist', sans-serif;">
        ${isTreinadora ? 'Relatório Completo' : 'Relatório do Cliente'}
      </div>
    </div>
    
    <!-- Info Section -->
    <div style="background: ${cardBackground}; border-radius: 18px; padding: 28px; margin-bottom: 32px; border: 2px solid ${COLORS.terracota}60;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Urbanist', sans-serif;">Cliente</span>
        <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 17px; font-family: 'Urbanist', sans-serif;">${cliente.nome}</span>
      </div>
      ${cliente.email ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Urbanist', sans-serif;">Email</span>
        <span style="font-weight: 500; color: ${COLORS.creamDark}; font-size: 15px; font-family: 'Urbanist', sans-serif;">${cliente.email}</span>
      </div>
      ` : ''}
      ${codigo ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Urbanist', sans-serif;">Código do Teste</span>
        <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 15px; font-family: 'Courier New', monospace; letter-spacing: 2px;">${codigo}</span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Urbanist', sans-serif;">Data do Teste</span>
        <span style="font-weight: 500; color: ${COLORS.creamDark}; font-size: 15px; font-family: 'Urbanist', sans-serif;">${dataTeste}</span>
      </div>
    </div>
    
    <!-- Fatores -->
    <div style="margin-bottom: 32px;">
      <div style="font-size: 22px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 3px solid ${COLORS.terracota}; font-family: 'Urbanist', sans-serif;">
        5 Fatores Principais
      </div>
      ${fatoresHTML}
      ${interpretacaoHTML}
    </div>
    
    <!-- Facetas -->
    ${facetasHTML}
    
    <!-- Protocolos -->
    <div style="margin-bottom: 32px; margin-top: 32px;">
      <div style="font-size: 22px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 3px solid ${COLORS.terracota}; font-family: 'Urbanist', sans-serif;">
        Protocolos Recomendados
      </div>
      ${protocolosHTML}
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 48px; padding-top: 28px; border-top: 2px solid ${COLORS.terracota}60; text-align: center;">
      <div style="font-size: 18px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 8px; letter-spacing: 3px; font-family: 'Urbanist', sans-serif;">ARTIO · DECIFRA</div>
      <div style="font-size: 13px; color: ${COLORS.creamDark}; margin-bottom: 6px; font-style: italic; font-family: 'Urbanist', sans-serif;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
      <div style="font-size: 12px; color: ${COLORS.creamDark}aa; font-family: 'Urbanist', sans-serif;">© 2025 Todos os direitos reservados</div>
      
      ${!isTreinadora ? `
      <div style="margin-top: 20px; padding: 18px; background: ${cardBackground}; border-radius: 14px; border: 1px solid ${COLORS.terracota}60;">
        <div style="font-size: 13px; color: ${COLORS.creamDark}; font-style: italic; line-height: 1.6; font-family: 'Urbanist', sans-serif;">
          Este é um relatório resumido. Sua treinadora tem acesso à análise completa com as 30 facetas e contexto profissional ampliado.
        </div>
      </div>
      ` : ''}
    </div>
    
  </div>
</body>
</html>`;
}

export type { PDFData, FatorScore, FacetaScore, Protocolo };
