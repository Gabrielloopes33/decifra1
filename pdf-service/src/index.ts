// ============================================
// Serviço PDF - DECIFRA
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdf.js';
import { authMiddleware, rateLimitMiddleware } from './utils/auth.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Middleware
// ============================================

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, etc)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      // Origens do app DECIFRA
      /^https?:\/\/.*decifra.*$/,
      /^https?:\/\/localhost:\d+$/,
      /^https?:\/\/127\.0\.0\.1:\d+$/,
      // Domínios do Supabase
      /^https:\/\/.*\.supabase\.co$/
    ];

    const isAllowed = allowedOrigins.some(pattern => 
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );

    if (isAllowed || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
    
    if (NODE_ENV === 'development' || res.statusCode >= 400) {
      console.log(logLine);
    }
  });
  
  next();
});

// ============================================
// Health Check (público)
// ============================================

app.get('/health', async (_req, res) => {
  res.json({
    status: 'ok',
    service: 'decifra-pdf-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// Rotas Protegidas
// ============================================

// Aplicar rate limiting
app.use('/api', rateLimitMiddleware);

// Aplicar autenticação
app.use('/api', authMiddleware);

// Rotas PDF
app.use('/api/pdf', pdfRoutes);

// ============================================
// Error Handling
// ============================================

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message || 'Erro interno do servidor'
    }
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint não encontrado'
    }
  });
});

// ============================================
// Iniciar Servidor
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         SERVIÇO PDF - DECIFRA                            ║
╠══════════════════════════════════════════════════════════╣
║  Ambiente: ${NODE_ENV.padEnd(47)}║
║  Porta:    ${PORT.toString().padEnd(47)}║
║  Versão:   1.0.0                                         ║
╚══════════════════════════════════════════════════════════╝
  `);
  
  // Verificar variáveis obrigatórias
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Variáveis não configuradas: ${missing.join(', ')}`);
  }
  
  if (process.env.GOTENBERG_URL) {
    console.log(`🔗 Gotenberg: ${process.env.GOTENBERG_URL}`);
  } else {
    console.warn('⚠️  GOTENBERG_URL não configurado');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando...');
  process.exit(0);
});
