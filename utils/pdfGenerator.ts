/**
 * Gerador de PDF para Resultados DECIFRA
 * Identidade Visual Ártio - Tema Claro para Impressão
 * Otimizado para A4 com controle de quebras de página
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

// Cores Ártio - Tema Claro para PDF/Impressão
const COLORS = {
  // Fundos
  background: '#FFFFFF',
  cardBackground: '#FAFAFA',
  sectionBackground: '#F8F5F2',
  
  // Textos
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  
  // Cores de destaque
  primary: '#C4785A',
  primaryDark: '#A85D40',
  primaryLight: '#D4896A',
  
  // Cores dos fatores
  fatorN: '#7B9E87', // Neuroticismo - verde
  fatorE: '#D4A574', // Extroversão - dourado
  fatorO: '#C4785A', // Abertura - terracota
  fatorA: '#7B8B9E', // Amabilidade - azul acinzentado
  fatorC: '#9E7B8B', // Conscienciosidade - roxo acinzentado
  
  // Bordas
  border: '#E8E0D8',
  borderLight: '#F0EBE5',
};

// Mapear fator para cor
function getFatorCor(fator: FatorKey): string {
  const cores: Record<FatorKey, string> = {
    'N': COLORS.fatorN,
    'E': COLORS.fatorE,
    'O': COLORS.fatorO,
    'A': COLORS.fatorA,
    'C': COLORS.fatorC,
  };
  return cores[fator] || COLORS.primary;
}

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

  // Facetas - organizadas em uma tabela compacta
  let facetasHTML = '';
  if (isTreinadora && resultado.scores_facetas && resultado.scores_facetas.length > 0) {
    const facetasPorColuna = Math.ceil(resultado.scores_facetas.length / 2);
    const coluna1 = resultado.scores_facetas.slice(0, facetasPorColuna);
    const coluna2 = resultado.scores_facetas.slice(facetasPorColuna);
    
    facetasHTML = `
      <div class="page-break-before section-container">
        <div style="font-size: 20px; font-weight: 700; color: ${COLORS.primary}; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid ${COLORS.border}; font-family: 'Urbanist', sans-serif;">
          30 Facetas Detalhadas
        </div>
        <table class="facetas-table" style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              ${coluna1.map(f => `
                <div class="faceta-item" style="background: ${COLORS.cardBackground}; padding: 10px 12px; border-radius: 8px; margin-bottom: 6px; border: 1px solid ${COLORS.border};">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: ${COLORS.textPrimary}; font-size: 12px; font-family: 'Urbanist', sans-serif;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.primary}; font-size: 13px; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
                      <span style="font-size: 10px; color: ${COLORS.textMuted}; display: block; margin-top: 1px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
                    </span>
                  </div>
                </div>
              `).join('')}
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              ${coluna2.map(f => `
                <div class="faceta-item" style="background: ${COLORS.cardBackground}; padding: 10px 12px; border-radius: 8px; margin-bottom: 6px; border: 1px solid ${COLORS.border};">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: ${COLORS.textPrimary}; font-size: 12px; font-family: 'Urbanist', sans-serif;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: ${COLORS.primary}; font-size: 13px; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
                      <span style="font-size: 10px; color: ${COLORS.textMuted}; display: block; margin-top: 1px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
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

  // Protocolos - mais compactos
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
          <div class="exercicio-item" style="margin-bottom: 8px; padding: 8px 10px; border-radius: 6px; background: ${COLORS.sectionBackground}; border: 1px solid ${COLORS.border};">
            <div style="font-size: 12px; font-weight: 700; color: ${COLORS.textPrimary}; margin-bottom: 2px; font-family: 'Urbanist', sans-serif;">${idx + 1}. ${tituloExercicio}</div>
            <div style="font-size: 11px; color: ${COLORS.textSecondary}; line-height: 1.5; margin-bottom: 3px; font-family: 'Urbanist', sans-serif;">${descricaoExercicio}</div>
            <div style="font-size: 10px; color: ${COLORS.primary}; font-family: 'Urbanist', sans-serif;">Freq: ${frequencia} | Duração: ${duracao}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="protocolo-card" style="background: ${COLORS.cardBackground}; border-radius: 12px; padding: 18px 22px; margin-bottom: 12px; border: 1px solid ${COLORS.border};">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: ${i < 3 ? COLORS.primary : COLORS.sectionBackground}; color: ${i < 3 ? '#FFFFFF' : COLORS.textPrimary}; border-radius: 50%; font-weight: 700; font-size: 13px; flex-shrink: 0; border: 2px solid ${COLORS.border}; font-family: 'Urbanist', sans-serif;">${i + 1}</div>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: ${COLORS.textPrimary}; font-size: 15px; margin-bottom: 6px; font-family: 'Urbanist', sans-serif;">${titulo}</div>
              <div style="font-size: 12px; color: ${COLORS.primary}; margin-bottom: 4px; font-weight: 600; font-family: 'Urbanist', sans-serif;">Objetivo</div>
              <div style="font-size: 12px; color: ${COLORS.textSecondary}; line-height: 1.5; margin-bottom: 8px; font-family: 'Urbanist', sans-serif;">${objetivo}</div>
              <div style="font-size: 12px; color: ${COLORS.primary}; margin-bottom: 4px; font-weight: 600; font-family: 'Urbanist', sans-serif;">Descrição</div>
              <div style="font-size: 12px; color: ${COLORS.textSecondary}; line-height: 1.5; margin-bottom: 10px; font-family: 'Urbanist', sans-serif;">${descricao}</div>
              ${exercicios ? `
                <div style="font-size: 12px; color: ${COLORS.primary}; margin-bottom: 6px; font-weight: 600; font-family: 'Urbanist', sans-serif;">Exercícios</div>
                ${exercicios}
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('')
    : `
      <div style="background: ${COLORS.cardBackground}; border-radius: 12px; padding: 20px; border: 1px solid ${COLORS.border}; text-align: center;">
        <div style="color: ${COLORS.textSecondary}; font-size: 14px; font-style: italic; font-family: 'Urbanist', sans-serif;">Nenhum protocolo recomendado para este perfil.</div>
      </div>
    `;

  // Fatores com cores individuais - mais compactos
  const fatoresHTML = scoresOrdenados.map(f => {
    const fatorCor = getFatorCor(f.fator);
    return `
    <div class="fator-card" style="background: ${COLORS.cardBackground}; border-radius: 12px; padding: 18px 22px; margin-bottom: 12px; border: 2px solid ${fatorCor}40;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; font-size: 16px; color: ${COLORS.textPrimary}; font-family: 'Urbanist', sans-serif;">${FATORES[f.fator]}</span>
        <span style="background: ${fatorCor}; color: #FFFFFF; padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Urbanist', sans-serif;">${f.classificacao}</span>
      </div>
      <div>
        <div style="height: 10px; background: ${COLORS.borderLight}; border-radius: 5px; overflow: hidden; border: 1px solid ${COLORS.border};">
          <div style="height: 100%; background: ${fatorCor}; border-radius: 5px; width: ${f.percentil}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span style="font-size: 12px; color: ${COLORS.textMuted}; font-family: 'Urbanist', sans-serif;">Percentil</span>
          <span style="font-size: 18px; color: ${fatorCor}; font-weight: 800; font-family: 'Urbanist', sans-serif;">${f.percentil}%</span>
        </div>
        ${isTreinadora ? `<div style="font-size: 11px; color: ${COLORS.textMuted}; margin-top: 4px; text-align: right; font-style: italic; font-family: 'Urbanist', sans-serif;">Score: ${Math.round(f.score)}</div>` : ''}
      </div>
    </div>
  `}).join('');

  const interpretacaoHTML = interpretacaoDestaque && fatorDestaque
    ? `
      <div class="interpretacao-card" style="background: ${COLORS.cardBackground}; border-radius: 12px; padding: 16px; border: 1px solid ${COLORS.border}; margin-top: 20px;">
        <div style="font-size: 18px; font-weight: 800; color: ${COLORS.textPrimary}; margin-bottom: 6px; font-family: 'Urbanist', sans-serif;">
          ${isTreinadora ? 'Interpretação Principal' : 'Quem Você É'}
        </div>
        <div style="font-size: 12px; color: ${COLORS.primary}; margin-bottom: 8px; font-family: 'Urbanist', sans-serif;">
          Destaque em ${FATORES[fatorDestaque.fator]}
        </div>
        <div style="font-size: 15px; font-weight: 700; color: ${COLORS.textPrimary}; margin-bottom: 4px; font-family: 'Urbanist', sans-serif;">
          ${interpretacaoDestaque.titulo}
        </div>
        <div style="font-size: 13px; font-weight: 600; color: ${COLORS.primary}; margin-bottom: 8px; font-family: 'Urbanist', sans-serif;">
          ${interpretacaoDestaque.subtitulo}
        </div>
        <div style="font-size: 13px; color: ${COLORS.textSecondary}; line-height: 1.6; font-family: 'Urbanist', sans-serif;">
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
      size: A4;
      margin: 25mm 25mm 30mm 25mm;
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
        background: ${COLORS.background} !important;
      }
      
      .page-wrapper {
        background: ${COLORS.background} !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      /* Evitar quebras no meio de cards */
      .fator-card, .protocolo-card, .interpretacao-card, .faceta-item, .exercicio-item {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      /* Quebras de página estratégicas */
      .page-break-before {
        break-before: page !important;
        page-break-before: always !important;
      }
      
      /* Manter seções juntas quando possível */
      .section-container {
        break-inside: auto;
      }
      
      /* Evitar quebras entre título e conteúdo */
      .section-title {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
    }
    
    * {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      background: ${COLORS.background};
      font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .page-wrapper {
      background: ${COLORS.background};
      max-width: 160mm;
      margin: 0 auto;
      padding: 0 15px;
    }
    
    /* Header com mais espaçamento */
    .header {
      text-align: center;
      padding: 30px 0;
      margin-bottom: 30px;
      border-bottom: 3px solid ${COLORS.primary};
    }
    
    .logo-container {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      background: ${COLORS.sectionBackground};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid ${COLORS.primary};
    }
    
    .logo-text {
      font-size: 32px;
      color: ${COLORS.primary};
      font-weight: 800;
    }
    
    .brand-name {
      font-size: 26px;
      font-weight: 800;
      color: ${COLORS.textPrimary};
      margin-bottom: 6px;
      letter-spacing: 2px;
    }
    
    .brand-subtitle {
      font-size: 13px;
      color: ${COLORS.textSecondary};
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    
    .badge {
      display: inline-block;
      background: ${COLORS.primary};
      color: #FFFFFF;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Info Section */
    .info-section {
      background: ${COLORS.sectionBackground};
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 30px;
      border: 1px solid ${COLORS.border};
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid ${COLORS.border};
    }
    
    .info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 700;
      color: ${COLORS.primary};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-value {
      font-weight: 600;
      color: ${COLORS.textPrimary};
      font-size: 15px;
    }
    
    .info-value-secondary {
      font-weight: 500;
      color: ${COLORS.textSecondary};
      font-size: 13px;
    }
    
    /* Section Title */
    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: ${COLORS.textPrimary};
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 3px solid ${COLORS.primary};
    }
    
    /* Fatores Section */
    .fatores-section {
      margin-bottom: 30px;
    }
    
    /* Facetas Section */
    .facetas-section {
      margin-bottom: 30px;
    }
    
    .facetas-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    /* Protocolos Section */
    .protocolos-section {
      margin-bottom: 30px;
    }
    
    /* Footer com mais espaçamento */
    .footer {
      margin-top: 50px;
      padding: 30px 0;
      border-top: 2px solid ${COLORS.primary}40;
      text-align: center;
    }
    
    .footer-brand {
      font-size: 15px;
      font-weight: 800;
      color: ${COLORS.primary};
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    
    .footer-date {
      font-size: 11px;
      color: ${COLORS.textSecondary};
      margin-bottom: 6px;
      font-style: italic;
    }
    
    .footer-copyright {
      font-size: 10px;
      color: ${COLORS.textMuted};
    }
    
    .footer-notice {
      margin-top: 20px;
      padding: 16px;
      background: ${COLORS.sectionBackground};
      border-radius: 10px;
      border: 1px solid ${COLORS.border};
    }
    
    .footer-notice-text {
      font-size: 11px;
      color: ${COLORS.textSecondary};
      font-style: italic;
      line-height: 1.6;
    }
    
    /* Page break utilities */
    .page-break-before {
      break-before: page;
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <span class="logo-text">Á</span>
      </div>
      <div class="brand-name">DECIFRA</div>
      <div class="brand-subtitle">Avaliação de Personalidade Big Five</div>
      <div class="badge">
        ${isTreinadora ? 'Relatório Completo' : 'Relatório do Cliente'}
      </div>
    </div>
    
    <!-- Info Section -->
    <div class="info-section">
      <div class="info-row">
        <span class="info-label">Cliente</span>
        <span class="info-value">${cliente.nome}</span>
      </div>
      ${cliente.email ? `
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value-secondary">${cliente.email}</span>
      </div>
      ` : ''}
      ${codigo ? `
      <div class="info-row">
        <span class="info-label">Código do Teste</span>
        <span class="info-value" style="font-family: 'Courier New', monospace; letter-spacing: 1px;">${codigo}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Data do Teste</span>
        <span class="info-value-secondary">${dataTeste}</span>
      </div>
    </div>
    
    <!-- Fatores -->
    <div class="fatores-section">
      <div class="section-title">5 Fatores Principais</div>
      ${fatoresHTML}
      ${interpretacaoHTML}
    </div>
    
    <!-- Facetas - sempre em nova página para treinadora -->
    ${facetasHTML}
    
    <!-- Protocolos - sempre em nova página -->
    <div class="page-break-before protocolos-section">
      <div class="section-title">Protocolos Recomendados</div>
      ${protocolosHTML}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">ÁRTIO · DECIFRA</div>
      <div class="footer-date">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
      <div class="footer-copyright">© 2025 Todos os direitos reservados</div>
      
      ${!isTreinadora ? `
      <div class="footer-notice">
        <div class="footer-notice-text">
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
