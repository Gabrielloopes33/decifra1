// ============================================
// Utilitários de Autenticação
// ============================================

import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET não configurado');
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Permitir health check sem autenticação
  if (req.path === '/health') {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Token de autenticação não fornecido'
      }
    });
    return;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Formato do token inválido. Use: Bearer <token>'
      }
    });
    return;
  }

  const token = parts[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido ou expirado'
      }
    });
    return;
  }

  // Adicionar dados do usuário à requisição
  (req as any).user = payload;
  next();
}

// Middleware para verificar rate limit simples (em memória)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const maxRequests = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10', 10);
  
  // Usar IP ou user ID como identificador
  const identifier = ((req as any).user?.sub as string) || req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto

  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Nova janela
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisições excedido. Tente novamente em um minuto.'
      }
    });
    return;
  }

  record.count++;
  next();
}
