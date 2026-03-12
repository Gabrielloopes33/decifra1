/**
 * Gerador de PDF para Resultados DECIFRA
 * Identidade Visual Ártio completa
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
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

/**
 * Carrega a logo como base64 para embed no PDF
 * Usa expo-asset para garantir que o asset esteja disponível
 */
async function getLogoBase64(): Promise<string> {
  try {
    // Carrega o asset usando expo-asset
    const asset = Asset.fromModule(require('@/assets/images/icon.png'));
    await asset.downloadAsync();
    
    if (!asset.localUri) {
      console.warn('[PDF] Asset não disponível localmente');
      return '';
    }
    
    // Lê o arquivo como base64
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('[PDF] Erro ao carregar logo:', error);
    return '';
  }
}

/**
 * Logo em CSS puro - Fallback quando imagem não carrega
 * Usa múltiplos elementos posicionados via margin/padding
 */
function getLogoFallbackHTML(): string {
  const terracota = '#C4785A';
  const cream = '#F5F0E8';
  const vinhoDeep = '#2D1518';
  
  return `
    <div style="text-align: center;">
      <!-- Container principal -->
      <div style="display: inline-block; padding: 8px; background: ${vinhoDeep}; border: 2px solid ${terracota}; border-radius: 50%; width: 64px; height: 64px; position: relative;">
        <!-- Círculos das pétalas (8 posições) -->
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; top: 2px; left: 26px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; top: 8px; right: 4px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; top: 26px; right: 2px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; bottom: 8px; right: 4px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; bottom: 2px; left: 26px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; bottom: 8px; left: 4px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; top: 26px; left: 2px;"></div>
        <div style="position: absolute; width: 12px; height: 12px; background: ${terracota}; border-radius: 50%; top: 8px; left: 4px;"></div>
        
        <!-- Círculo central -->
        <div style="position: absolute; width: 28px; height: 28px; background: ${cream}; border: 2px solid ${terracota}; border-radius: 50%; top: 18px; left: 18px; text-align: center; line-height: 24px; font-size: 16px; font-weight: bold; color: ${vinhoDeep}; font-family: Georgia, serif;">D</div>
      </div>
    </div>
  `;
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
    
    // Tenta carregar a logo
    const logoBase64 = await getLogoBase64();
    const html = gerarTemplateHTML(dados, logoBase64);
    
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

function gerarTemplateHTML(dados: PDFData, logoBase64: string): string {
  const { cliente, resultado, protocolos, codigo, dataTeste, tipo } = dados;
  const isTreinadora = tipo === 'treinadora';
  
  const ordemFatores: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = ordemFatores.map(fator => 
    resultado.scores_fatores.find(s => s.fator === fator)
  ).filter((s): s is FatorScore => s !== undefined);

  // Wrapper com fundo escuro garantido
  const pageBackground = COLORS.vinhoDeep;
  const cardBackground = COLORS.vinhoDark;

  // Logo: usa imagem base64 se disponível, senão fallback CSS
  const logoHTML = logoBase64 
    ? `<img src="${logoBase64}" width="80" height="80" style="border-radius: 50%; display: block; margin: 0 auto;" />`
    : getLogoFallbackHTML();

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
    ? protocolos.map((p, i) => `
      <div style="background: ${cardBackground}; border-radius: 14px; padding: 20px; margin-bottom: 14px; border: 1px solid ${COLORS.terracota}60;">
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: ${i < 3 ? COLORS.terracota : COLORS.vinho}; color: ${COLORS.cream}; border-radius: 50%; font-weight: 700; font-size: 15px; flex-shrink: 0; border: 2px solid ${COLORS.cream}40; font-family: 'Urbanist', sans-serif;">${i + 1}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: ${COLORS.cream}; font-size: 16px; margin-bottom: 6px; font-family: 'Urbanist', sans-serif;">${p.titulo}</div>
            <div style="font-size: 14px; color: ${COLORS.creamDark}; line-height: 1.6; font-family: 'Urbanist', sans-serif;">${p.descricao}</div>
          </div>
        </div>
      </div>
    `).join('')
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
    
    <!-- Header com Logo -->
    <div style="text-align: center; padding-bottom: 28px; margin-bottom: 28px; border-bottom: 2px solid ${COLORS.terracota}60;">
      ${logoHTML}
      <div style="font-size: 36px; font-weight: 800; color: ${COLORS.cream}; margin-top: 16px; margin-bottom: 6px; letter-spacing: 4px; text-transform: uppercase; font-family: 'Urbanist', sans-serif;">DECIFRA</div>
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
          Este é um relatório resumido. Sua treinadora tem acesso a uma análise completa com todas as 30 facetas e protocolos detalhados.
        </div>
      </div>
      ` : ''}
    </div>
    
  </div>
</body>
</html>`;
}

export type { PDFData, FatorScore, FacetaScore, Protocolo };
