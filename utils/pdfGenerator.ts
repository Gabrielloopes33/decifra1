/**
 * Gerador de PDF para Resultados DECIFRA
 * Usa expo-print e expo-sharing para gerar e compartilhar PDFs
 * 
 * Na WEB: Abre o diálogo de impressão do navegador
 * No Mobile (iOS/Android): Gera arquivo PDF e compartilha
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

/**
 * Sanitiza o nome do arquivo removendo caracteres inválidos
 */
function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '_') // Substitui espaços por underscore
    .substring(0, 50); // Limita tamanho
}

/**
 * Gera e compartilha um PDF com os resultados do teste
 * 
 * WEB: Abre o diálogo de impressão do navegador
 * iOS/Android: Gera arquivo PDF e abre compartilhamento
 */
export async function gerarPDF(dados: PDFData): Promise<void> {
  console.log('[PDF] Iniciando geração do PDF para:', dados.cliente.nome);
  console.log('[PDF] Plataforma:', Platform.OS);
  
  try {
    // Valida dados
    if (!dados.cliente?.nome) {
      throw new Error('Nome do cliente é obrigatório');
    }
    if (!dados.resultado?.scores_fatores || dados.resultado.scores_fatores.length === 0) {
      throw new Error('Scores dos fatores são obrigatórios');
    }
    
    // Gera HTML
    const html = gerarTemplateHTML(dados);
    console.log('[PDF] HTML gerado, tamanho:', html.length, 'caracteres');
    
    // Comportamento diferente para WEB vs Mobile
    if (Platform.OS === 'web') {
      await gerarPDFWeb(html, dados);
    } else {
      await gerarPDFMobile(html, dados);
    }
    
    console.log('[PDF] PDF gerado com sucesso!');
  } catch (error) {
    console.error('[PDF] Erro ao gerar PDF:', error);
    throw error;
  }
}

/**
 * Gera PDF na WEB - Abre diálogo de impressão ou cria download
 */
async function gerarPDFWeb(html: string, dados: PDFData): Promise<void> {
  console.log('[PDF] Modo WEB detectado');
  
  // Cria uma nova janela com o conteúdo HTML
  const nomeArquivo = `DECIFRA_${dados.tipo === 'treinadora' ? 'Completo' : 'Resumido'}_${sanitizarNomeArquivo(dados.cliente.nome)}.pdf`;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão. Verifique se o pop-up está bloqueado.');
  }
  
  // Escreve o HTML na nova janela
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Aguarda um pouco para o CSS ser aplicado
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    // Não fecha a janela automaticamente para permitir salvar como PDF
  }, 500);
  
  console.log('[PDF] Janela de impressão aberta');
}

/**
 * Gera PDF no Mobile (iOS/Android)
 */
async function gerarPDFMobile(html: string, dados: PDFData): Promise<void> {
  console.log('[PDF] Modo Mobile detectado');
  
  // Gera o PDF em arquivo temporário
  console.log('[PDF] Chamando Print.printToFileAsync...');
  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });
  
  if (!result || !result.uri) {
    throw new Error('Falha ao gerar PDF: resultado inválido');
  }
  
  console.log('[PDF] Arquivo temporário criado:', result.uri);
  console.log('[PDF] Número de páginas:', result.numberOfPages);
  
  const tempUri = result.uri;

  // Cria nome personalizado do arquivo
  const nomeSanitizado = sanitizarNomeArquivo(dados.cliente.nome);
  const tipoRelatorio = dados.tipo === 'treinadora' ? 'Completo' : 'Resumido';
  const nomeArquivo = `DECIFRA_${tipoRelatorio}_${nomeSanitizado}.pdf`;
  
  // Define o caminho final no diretório de cache
  const diretorioCache = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!diretorioCache) {
    throw new Error('Diretório de cache não disponível');
  }
  
  const uriFinal = `${diretorioCache}${nomeArquivo}`;
  
  // Copia o arquivo com o nome personalizado
  console.log('[PDF] Copiando arquivo para:', uriFinal);
  await FileSystem.copyAsync({
    from: tempUri,
    to: uriFinal,
  });
  
  // Remove o arquivo temporário
  try {
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
  } catch (e) {
    // Ignora erro ao deletar arquivo temporário
  }

  // Verifica se o compartilhamento está disponível
  const isAvailable = await Sharing.isAvailableAsync();
  
  if (!isAvailable) {
    throw new Error('Compartilhamento não disponível neste dispositivo');
  }

  console.log('[PDF] Compartilhando arquivo:', nomeArquivo);
  await Sharing.shareAsync(uriFinal, {
    UTI: '.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Compartilhar Resultado DECIFRA',
  });
}

/**
 * Gera o template HTML para o PDF
 */
function gerarTemplateHTML(dados: PDFData): string {
  const { cliente, resultado, protocolos, codigo, dataTeste, tipo } = dados;
  
  const isTreinadora = tipo === 'treinadora';
  
  // Ordenar fatores na ordem correta: N, E, O, A, C
  const ordemFatores: FatorKey[] = ['N', 'E', 'O', 'A', 'C'];
  const scoresOrdenados = ordemFatores.map(fator => 
    resultado.scores_fatores.find(s => s.fator === fator)
  ).filter((s): s is FatorScore => s !== undefined);

  // Gera HTML das facetas se for relatório de treinadora
  let facetasHTML = '';
  if (isTreinadora && resultado.scores_facetas && resultado.scores_facetas.length > 0) {
    const facetasPorColuna = Math.ceil(resultado.scores_facetas.length / 2);
    const coluna1 = resultado.scores_facetas.slice(0, facetasPorColuna);
    const coluna2 = resultado.scores_facetas.slice(facetasPorColuna);
    
    facetasHTML = `
      <div style="margin-top: 24px; page-break-inside: avoid;">
        <div style="font-size: 18px; font-weight: 700; color: #6B2D3A; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #C4785A;">
          30 Facetas Detalhadas
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              ${coluna1.map(f => `
                <div style="background: #F5F0E8; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #E8E0D1;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #6B2D3A; font-size: 12px;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: #C4785A; font-size: 12px;">${f.percentil}%</span>
                      <span style="font-size: 10px; color: #888; display: block;">${f.classificacao}</span>
                    </span>
                  </div>
                </div>
              `).join('')}
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              ${coluna2.map(f => `
                <div style="background: #F5F0E8; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #E8E0D1;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #6B2D3A; font-size: 12px;">${f.faceta}</span>
                    <span style="text-align: right;">
                      <span style="font-weight: 700; color: #C4785A; font-size: 12px;">${f.percentil}%</span>
                      <span style="font-size: 10px; color: #888; display: block;">${f.classificacao}</span>
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

  // Gera HTML dos protocolos
  const protocolosHTML = protocolos.length > 0 
    ? protocolos.map((p, i) => `
      <div style="background: #FAF8F5; border-radius: 10px; padding: 16px; margin-bottom: 12px; border: 1px solid #E8E0D1; page-break-inside: avoid;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: ${i < 3 ? '#C4785A' : '#6B2D3A'}; color: white; border-radius: 50%; font-weight: 700; font-size: 13px; flex-shrink: 0;">${i + 1}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #2D2420; font-size: 14px; margin-bottom: 4px;">${p.titulo}</div>
            <div style="font-size: 13px; color: #666; line-height: 1.5;">${p.descricao}</div>
          </div>
        </div>
      </div>
    `).join('')
    : `
      <div style="background: #FAF8F5; border-radius: 10px; padding: 16px; border: 1px solid #E8E0D1;">
        <div style="text-align: center; color: #888; font-size: 14px;">
          Nenhum protocolo recomendado para este perfil.
        </div>
      </div>
    `;

  // Gera HTML dos fatores
  const fatoresHTML = scoresOrdenados.map(f => `
    <div style="background: #FAF8F5; border-radius: 10px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #C4785A; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: 600; font-size: 15px; color: #2D2420;">${FATORES[f.fator]}</span>
        <span style="background: #C4785A; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">${f.classificacao}</span>
      </div>
      <div style="margin-top: 8px;">
        <div style="height: 10px; background: #E8E0D1; border-radius: 5px; overflow: hidden;">
          <div style="height: 100%; background: linear-gradient(90deg, #C4785A 0%, #6B2D3A 100%); border-radius: 5px; width: ${f.percentil}%"></div>
        </div>
        <div style="text-align: right; font-size: 13px; color: #6B2D3A; margin-top: 6px; font-weight: 600;">${f.percentil}º percentil</div>
        ${isTreinadora ? `<div style="font-size: 11px; color: #888; margin-top: 2px; text-align: right;">Score: ${f.score.toFixed(2)}</div>` : ''}
      </div>
    </div>
  `).join('');

  // HTML completo
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado DECIFRA - ${cliente.nome}</title>
  <style>
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-break {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #FFFFFF; color: #2D2420; line-height: 1.6; padding: 32px 24px; margin: 0;">
  
  <!-- Header -->
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 3px solid #C4785A; margin-bottom: 24px;">
    <div style="font-size: 32px; font-weight: 700; color: #6B2D3A; margin-bottom: 4px;">DECIFRA</div>
    <div style="font-size: 14px; color: #C4785A; font-weight: 500;">Avaliação de Personalidade Big Five</div>
    <div style="display: inline-block; background: #6B2D3A; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px;">${isTreinadora ? 'Relatório Completo' : 'Relatório do Cliente'}</div>
  </div>
  
  <!-- Info Section -->
  <div style="background: #F5F0E8; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #E8E0D1;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(196, 120, 90, 0.15);">
      <span style="font-weight: 600; color: #6B2D3A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</span>
      <span style="font-weight: 500; color: #2D2420; font-size: 14px;">${cliente.nome}</span>
    </div>
    ${cliente.email ? `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(196, 120, 90, 0.15);">
      <span style="font-weight: 600; color: #6B2D3A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
      <span style="font-weight: 500; color: #2D2420; font-size: 14px;">${cliente.email}</span>
    </div>
    ` : ''}
    ${codigo ? `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(196, 120, 90, 0.15);">
      <span style="font-weight: 600; color: #6B2D3A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Código do Teste</span>
      <span style="font-weight: 500; color: #2D2420; font-size: 14px;">${codigo}</span>
    </div>
    ` : ''}
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 600; color: #6B2D3A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Data do Teste</span>
      <span style="font-weight: 500; color: #2D2420; font-size: 14px;">${dataTeste}</span>
    </div>
  </div>
  
  <!-- Fatores -->
  <div style="margin-bottom: 28px;">
    <div style="font-size: 18px; font-weight: 700; color: #6B2D3A; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #C4785A;">5 Fatores Principais</div>
    ${fatoresHTML}
  </div>
  
  <!-- Facetas (apenas treinadora) -->
  ${facetasHTML}
  
  <!-- Protocolos -->
  <div style="margin-bottom: 28px; margin-top: 28px;">
    <div style="font-size: 18px; font-weight: 700; color: #6B2D3A; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #C4785A;">Protocolos Recomendados</div>
    ${protocolosHTML}
  </div>
  
  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E0D1; text-align: center;">
    <div style="font-size: 14px; font-weight: 600; color: #6B2D3A; margin-bottom: 4px;">Ártio · Decifra</div>
    <div style="font-size: 11px; color: #999; margin-bottom: 2px;">Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div>
    <div style="font-size: 11px; color: #999;">© 2025 Todos os direitos reservados</div>
    
    ${!isTreinadora ? `
    <div style="margin-top: 12px; padding: 12px; background: #F5F0E8; border-radius: 8px; font-size: 11px; color: #666; font-style: italic;">
      Este é um relatório resumido. Sua treinadora tem acesso a uma análise 
      completa com todas as 30 facetas e protocolos detalhados.
    </div>
    ` : ''}
  </div>
  
</body>
</html>`;
}

export type { PDFData, FatorScore, FacetaScore, Protocolo };
