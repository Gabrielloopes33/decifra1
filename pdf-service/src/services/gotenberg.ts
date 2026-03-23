// ============================================
// Serviço Gotenberg - Conversão HTML para PDF
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3000';

export interface PDFOptions {
  landscape?: boolean;
  paperWidth?: string;
  paperHeight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  printBackground?: boolean;
  preferCssPageSize?: boolean;
  emulateScreenMedia?: boolean;
}

export class GotenbergService {
  
  /**
   * Converte HTML para PDF usando Gotenberg
   */
  static async convertHTMLToPDF(
    html: string,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    const defaults: PDFOptions = {
      landscape: false,
      paperWidth: '8.27in',   // A4
      paperHeight: '11.7in',  // A4
      marginTop: '0.5in',
      marginBottom: '0.5in',
      marginLeft: '0.5in',
      marginRight: '0.5in',
      printBackground: true,
      preferCssPageSize: false,
      emulateScreenMedia: false
    };

    const opts = { ...defaults, ...options };

    // Criar arquivo HTML temporário
    const tempId = uuidv4();
    const tempHtmlPath = join(tmpdir(), `${tempId}.html`);
    
    try {
      await writeFile(tempHtmlPath, html, 'utf-8');

      // Criar FormData
      const formData = new FormData();
      
      // Adicionar arquivo HTML
      const htmlBlob = new Blob([html], { type: 'text/html' });
      formData.append('files', htmlBlob, 'index.html');

      // Adicionar opções
      formData.append('landscape', String(opts.landscape));
      formData.append('paperWidth', opts.paperWidth!);
      formData.append('paperHeight', opts.paperHeight!);
      formData.append('marginTop', opts.marginTop!);
      formData.append('marginBottom', opts.marginBottom!);
      formData.append('marginLeft', opts.marginLeft!);
      formData.append('marginRight', opts.marginRight!);
      formData.append('printBackground', String(opts.printBackground));
      formData.append('preferCssPageSize', String(opts.preferCssPageSize));
      
      if (opts.emulateScreenMedia) {
        formData.append('emulatedMediaType', 'screen');
      }

      // Fazer requisição para Gotenberg
      const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gotenberg error: ${response.status} - ${errorText}`);
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());
      return pdfBuffer;

    } finally {
      // Limpar arquivo temporário
      try {
        await unlink(tempHtmlPath);
      } catch {
        // Ignorar erros de limpeza
      }
    }
  }

  /**
   * Verifica se o serviço Gotenberg está disponível
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${GOTENBERG_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
