// ============================================
// Rotas PDF
// ============================================

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { SupabaseService, supabase } from '../services/supabase.js';
import { TemplateEngine } from '../services/template-engine.js';
import { GotenbergService } from '../services/gotenberg.js';
import { verifyToken } from '../utils/auth.js';
import type { GerarPDFResponse } from '../types/index.js';

const router = Router();

// Schema de validação
const gerarPDFSchema = z.object({
  resultadoId: z.string().uuid(),
  tipo: z.enum(['cliente', 'treinadora']),
  token: z.string()
});

/**
 * POST /api/pdf/gerar
 * Gera um PDF a partir dos dados do resultado
 */
router.post('/gerar', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Validar body
    const validation = gerarPDFSchema.safeParse(req.body);
    
    if (!validation.success) {
      const response: GerarPDFResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos: ' + validation.error.errors.map(e => e.message).join(', ')
        }
      };
      res.status(400).json(response);
      return;
    }

    const { resultadoId, tipo, token } = validation.data;

    // Verificar token JWT
    const payload = verifyToken(token);
    
    if (!payload) {
      const response: GerarPDFResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token inválido ou expirado'
        }
      };
      res.status(401).json(response);
      return;
    }

    // Buscar dados do resultado
    const resultado = await SupabaseService.getResultado(resultadoId);
    
    if (!resultado) {
      const response: GerarPDFResponse = {
        success: false,
        error: {
          code: 'RESULTADO_NOT_FOUND',
          message: 'Resultado não encontrado'
        }
      };
      res.status(404).json(response);
      return;
    }

    // Buscar dados do cliente
    const cliente = await SupabaseService.getCliente(resultado.cliente_id);
    
    if (!cliente) {
      const response: GerarPDFResponse = {
        success: false,
        error: {
          code: 'CLIENTE_NOT_FOUND',
          message: 'Cliente não encontrado'
        }
      };
      res.status(404).json(response);
      return;
    }

    // Verificar permissões
    const { data: treinadoraData } = await supabase
      .from('treinadoras')
      .select('id, nome, email')
      .eq('auth_user_id', payload.sub)
      .single();

    const isTreinadora = treinadoraData && treinadoraData.id === cliente.treinadora_id;
    
    // Se tipo for treinadora, verificar se é a treinadora do cliente
    if (tipo === 'treinadora' && !isTreinadora) {
      const response: GerarPDFResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Acesso negado. Apenas a treinadora do cliente pode gerar este relatório.'
        }
      };
      res.status(403).json(response);
      return;
    }

    // Buscar treinadora
    const treinadora = cliente.treinadora_id 
      ? await SupabaseService.getTreinadora(cliente.treinadora_id)
      : null;

    // Buscar protocolos recomendados
    const protocolos = await SupabaseService.getProtocolosRecomendados(resultadoId);

    // Preparar dados do template
    const templateData = TemplateEngine.prepareTemplateData(
      resultado,
      cliente,
      treinadora,
      protocolos,
      tipo
    );

    // Renderizar HTML
    const html = await TemplateEngine.render(tipo, templateData);

    // Gerar PDF com Gotenberg
    const pdfBuffer = await GotenbergService.convertHTMLToPDF(html, {
      paperWidth: '8.27in',   // A4
      paperHeight: '11.7in',  // A4
      marginTop: '0.4in',
      marginBottom: '0.4in',
      marginLeft: '0.4in',
      marginRight: '0.4in',
      printBackground: true
    });

    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const safeName = cliente.nome.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `relatorio_${tipo}_${safeName}_${timestamp}.pdf`;

    // Verificar se deve fazer upload para storage
    const enableUpload = process.env.ENABLE_STORAGE_UPLOAD === 'true';

    let pdfUrl: string | undefined;
    let pdfBase64: string | undefined;

    if (enableUpload) {
      // Upload para Supabase Storage
      const uploadedUrl = await SupabaseService.uploadPDF(filename, pdfBuffer, cliente.id);

      if (uploadedUrl) {
        pdfUrl = uploadedUrl;
      } else {
        console.warn('Falha ao fazer upload do PDF, retornando base64');
        pdfBase64 = pdfBuffer.toString('base64');
      }
    } else {
      // Retornar base64
      pdfBase64 = pdfBuffer.toString('base64');
    }

    const duration = Date.now() - startTime;
    console.log(`PDF gerado em ${duration}ms: ${filename} (${pdfBuffer.length} bytes)`);

    const response: GerarPDFResponse = {
      success: true,
      data: {
        pdf: pdfBase64,
        url: pdfUrl,
        filename,
        tamanho: pdfBuffer.length,
        tipo
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    
    const response: GerarPDFResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro interno ao gerar PDF'
      }
    };
    
    res.status(500).json(response);
  }
});

/**
 * GET /api/pdf/health
 * Health check do serviço
 */
router.get('/health', async (_req: Request, res: Response) => {
  const gotenbergHealth = await GotenbergService.healthCheck();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'ok',
      gotenberg: gotenbergHealth ? 'ok' : 'error'
    }
  });
});

/**
 * GET /api/pdf/status
 * Status detalhado do serviço
 */
router.get('/status', async (_req: Request, res: Response) => {
  const gotenbergHealth = await GotenbergService.healthCheck();
  
  res.json({
    service: 'decifra-pdf-service',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: {
        status: 'ok',
        port: process.env.PORT || 3000
      },
      gotenberg: {
        status: gotenbergHealth ? 'ok' : 'error',
        url: process.env.GOTENBERG_URL
      },
      supabase: {
        status: process.env.SUPABASE_URL ? 'configured' : 'not_configured',
        url: process.env.SUPABASE_URL?.replace(/\.co$/, '.***')
      }
    },
    features: {
      storageUpload: process.env.ENABLE_STORAGE_UPLOAD === 'true',
      rateLimiting: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10', 10)
    }
  });
});

export default router;
