# ============================================
# Dockerfile - Serviço PDF DECIFRA
# ============================================
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# ============================================
# Production stage
FROM node:20-alpine AS production

# Instalar dependências necessárias para runtime
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar apenas arquivos necessários
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/src/templates ./dist/templates
COPY --from=builder --chown=nodejs:nodejs /app/assets ./assets

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Usar usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Iniciar aplicação com dumb-init para handling correto de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
