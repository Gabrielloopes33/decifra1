/**
 * Gerador de PDF para Resultados DECIFRA
 * Identidade Visual Ártio completa
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { FATORES } from '@/constants/ipip';
import type { FatorKey } from '@/constants/ipip';

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
  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });
  
  if (!result || !result.uri) {
    throw new Error('Falha ao gerar PDF');
  }
  
  const tempUri = result.uri;
  const nomeSanitizado = sanitizarNomeArquivo(dados.cliente.nome);
  const tipoRelatorio = dados.tipo === 'treinadora' ? 'Completo' : 'Resumido';
  const nomeArquivo = `DECIFRA_${tipoRelatorio}_${nomeSanitizado}.pdf`;
  
  const diretorioCache = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!diretorioCache) {
    throw new Error('Diretório de cache não disponível');
  }
  
  const uriFinal = `${diretorioCache}${nomeArquivo}`;
  
  await FileSystem.copyAsync({
    from: tempUri,
    to: uriFinal,
  });
  
  try {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  } catch (e) {}

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Compartilhamento não disponível');
  }

  await Sharing.shareAsync(uriFinal, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar Resultado DECIFRA',
  });
}

/**
 * Logo SVG estilizado DECIFRA
 */
function getLogoSVG(): string {
  return `
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block;">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.terracota};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${COLORS.terracotaLight};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.vinho};stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Círculo externo -->
      <circle cx="32" cy="32" r="30" fill="url(#logoGrad)" stroke="${COLORS.cream}" stroke-width="2" filter="url(#glow)"/>
      <!-- Círculo interno -->
      <circle cx="32" cy="32" r="24" fill="none" stroke="${COLORS.cream}" stroke-width="1" opacity="0.3"/>
      <!-- Letra D estilizada -->
      <text x="32" y="42" text-anchor="middle" fill="${COLORS.cream}" font-size="28" font-weight="bold" font-family="Georgia, serif" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">D</text>
      <!-- Decorativo: pequenos círculos -->
      <circle cx="32" cy="14" r="3" fill="${COLORS.cream}" opacity="0.6"/>
      <circle cx="32" cy="50" r="3" fill="${COLORS.cream}" opacity="0.6"/>
      <circle cx="14" cy="32" r="3" fill="${COLORS.cream}" opacity="0.6"/>
      <circle cx="50" cy="32" r="3" fill="${COLORS.cream}" opacity="0.6"/>
    </svg>
  `;
}

function gerarTemplateHTML(dados: PDFData): string {
  const { cliente, resultado, protocolos, codigo, dataTeste, tipo } = dados;
  const isTreinadora = tipo === 'treinadora';
  
  const ordemFatores: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = ordemFatores.map(fator => 
    resultado.scores_fatores.find(s => s.fator === fator)
  ).filter((s): s is FatorScore => s !== undefined);

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
        <div style="font-size: 20px; font-weight: 700; color: ${COLORS.cream}; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid ${COLORS.terracota};">
          🔬 30 Facetas Detalhadas
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              ${coluna1.map(f => `
                <div style="background: ${cardBackground}; padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid ${COLORS.terracota}60;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 13px;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.terracota}; font-size: 14px;">${f.percentil}%</span>
                      <span style="font-size: 11px; color: ${COLORS.creamDark}; display: block; margin-top: 2px;">${f.classificacao}</span>
                    </span>
                  </div>
                </div>
              `).join('')}
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              ${coluna2.map(f => `
                <div style="background: ${cardBackground}; padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid ${COLORS.terracota}60;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 13px;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.terracota}; font-size: 14px;">${f.percentil}%</span>
                      <span style="font-size: 11px; color: ${COLORS.creamDark}; display: block; margin-top: 2px;">${f.classificacao}</span>
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
    ? protocolos.map((p, i) => `
      <div style="background: ${cardBackground}; border-radius: 14px; padding: 20px; margin-bottom: 14px; border: 1px solid ${COLORS.terracota}60;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: ${i < 3 ? COLORS.terracota : COLORS.vinho}; color: ${COLORS.cream}; border-radius: 50%; font-weight: 700; font-size: 15px; flex-shrink: 0; border: 2px solid ${COLORS.cream}40;">${i + 1}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: ${COLORS.cream}; font-size: 16px; margin-bottom: 6px;">${p.titulo}</div>
            <div style="font-size: 14px; color: ${COLORS.creamDark}; line-height: 1.6;">${p.descricao}</div>
          </div>
        </div>
      </div>
    `).join('')
    : `
      <div style="background: ${cardBackground}; border-radius: 14px; padding: 24px; border: 1px solid ${COLORS.terracota}60; text-align: center;">
        <div style="color: ${COLORS.creamDark}; font-size: 14px; font-style: italic;">Nenhum protocolo recomendado para este perfil.</div>
      </div>
    `;

  // Fatores
  const fatoresHTML = scoresOrdenados.map(f => `
    <div style="background: ${cardBackground}; border-radius: 16px; padding: 22px; margin-bottom: 16px; border: 2px solid ${COLORS.terracota}80;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-weight: 700; font-size: 18px; color: ${COLORS.cream};">${FATORES[f.fator]}</span>
        <span style="background: ${COLORS.terracota}; color: ${COLORS.vinhoDeep}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${f.classificacao}</span>
      </div>
      <div>
        <div style="height: 14px; background: ${COLORS.vinhoDeep}; border-radius: 7px; overflow: hidden; border: 1px solid ${COLORS.terracota}40;">
          <div style="height: 100%; background: linear-gradient(90deg, ${COLORS.terracota} 0%, ${COLORS.terracotaLight} 100%); border-radius: 7px; width: ${f.percentil}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <span style="font-size: 13px; color: ${COLORS.creamDark};">Percentil</span>
          <span style="font-size: 20px; color: ${COLORS.terracota}; font-weight: 800;">${f.percentil}%</span>
        </div>
        ${isTreinadora ? `<div style="font-size: 12px; color: ${COLORS.creamDark}; margin-top: 6px; text-align: right; font-style: italic;">Score bruto: ${f.score.toFixed(2)}</div>` : ''}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado DECIFRA - ${cliente.nome}</title>
  <style>
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      body {
        background: ${pageBackground} !important;
      }
      .page-wrapper {
        background: ${pageBackground} !important;
      }
    }
    body {
      margin: 0;
      padding: 0;
      background: ${pageBackground};
    }
    .page-wrapper {
      background: ${pageBackground};
      min-height: 100vh;
      padding: 32px 24px;
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    
    <!-- Header com Logo -->
    <div style="text-align: center; padding-bottom: 28px; margin-bottom: 28px; border-bottom: 2px solid ${COLORS.terracota}60;">
      ${getLogoSVG()}
      <div style="font-size: 36px; font-weight: 800; color: ${COLORS.cream}; margin-top: 16px; margin-bottom: 6px; letter-spacing: 4px; text-transform: uppercase;">DECIFRA</div>
      <div style="font-size: 15px; color: ${COLORS.terracota}; font-weight: 600; letter-spacing: 2px;">Avaliação de Personalidade Big Five</div>
      <div style="display: inline-block; background: ${COLORS.terracota}; color: ${COLORS.vinhoDeep}; padding: 10px 24px; border-radius: 24px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">
        ${isTreinadora ? 'Relatório Completo' : 'Relatório do Cliente'}
      </div>
    </div>
    
    <!-- Info Section -->
    <div style="background: ${cardBackground}; border-radius: 18px; padding: 28px; margin-bottom: 32px; border: 2px solid ${COLORS.terracota}60;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Cliente</span>
        <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 17px;">${cliente.nome}</span>
      </div>
      ${cliente.email ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
        <span style="font-weight: 500; color: ${COLORS.creamDark}; font-size: 15px;">${cliente.email}</span>
      </div>
      ` : ''}
      ${codigo ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid ${COLORS.terracota}40;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Código do Teste</span>
        <span style="font-weight: 700; color: ${COLORS.cream}; font-size: 15px; font-family: 'Courier New', monospace; letter-spacing: 2px;">${codigo}</span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; color: ${COLORS.terracota}; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Data do Teste</span>
        <span style="font-weight: 500; color: ${COLORS.creamDark}; font-size: 15px;">${dataTeste}</span>
      </div>
    </div>
    
    <!-- Fatores -->
    <div style="margin-bottom: 32px;">
      <div style="font-size: 22px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 3px solid ${COLORS.terracota};">
        🧬 5 Fatores Principais
      </div>
      ${fatoresHTML}
    </div>
    
    <!-- Facetas -->
    ${facetasHTML}
    
    <!-- Protocolos -->
    <div style="margin-bottom: 32px; margin-top: 32px;">
      <div style="font-size: 22px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 24px; padding-bottom: 14px; border-bottom: 3px solid ${COLORS.terracota};">
        📋 Protocolos Recomendados
      </div>
      ${protocolosHTML}
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 48px; padding-top: 28px; border-top: 2px solid ${COLORS.terracota}60; text-align: center;">
      <div style="font-size: 18px; font-weight: 800; color: ${COLORS.cream}; margin-bottom: 8px; letter-spacing: 3px;">🌸 ÁRTIO · DECIFRA</div>
      <div style="font-size: 13px; color: ${COLORS.creamDark}; margin-bottom: 6px; font-style: italic;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
      <div style="font-size: 12px; color: ${COLORS.creamDark}aa;">© 2025 Todos os direitos reservados</div>
      
      ${!isTreinadora ? `
      <div style="margin-top: 20px; padding: 18px; background: ${cardBackground}; border-radius: 14px; border: 1px solid ${COLORS.terracota}60;">
        <div style="font-size: 13px; color: ${COLORS.creamDark}; font-style: italic; line-height: 1.6;">
          ✨ Este é um relatório resumido. Sua treinadora tem acesso a uma análise completa com todas as 30 facetas e protocolos detalhados.
        </div>
      </div>
      ` : ''}
    </div>
    
  </div>
</body>
</html>`;
}

export type { PDFData, FatorScore, FacetaScore, Protocolo };
