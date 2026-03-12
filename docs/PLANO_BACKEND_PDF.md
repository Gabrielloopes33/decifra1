# Plano de Implementação - Backend PDF Service (DECIFRA)

> **Status**: Planejamento completo | **Prioridade**: Alta | **Tecnologia Escolhida**: Gotenberg

---

## 📋 Resumo Executivo

Após tentativas frustradas com `expo-print` (limitações visuais severas), decidimos migrar a geração de PDFs para um **serviço backend dedicado** usando **Gotenberg** - um serviço de conversão HTML→PDF baseado em Chromium.

### Por que Gotenberg?

| Critério | Gotenberg | Puppeteer | Playwright | WeasyPrint |
|----------|-----------|-----------|------------|------------|
| **Tamanho Container** | ~200MB ✅ | ~500MB | ~400MB | ~100MB |
| **Setup** | Simples ✅ | Complexo | Complexo | Médio |
| **Manutenção** | Baixa ✅ | Alta | Alta | Média |
| **Suporte CSS Moderno** | Excelente ✅ | Excelente | Excelente | Limitado |
| **SVG Complexo** | Sim ✅ | Sim | Sim | Parcial |
| **Canvas/Chart.js** | Sim ✅ | Sim | Sim | Não |

**Decisão**: Gotenberg oferece o melhor custo-benefício para nosso caso de uso.

---

## 🎯 Requisitos do Serviço

### Funcionais
1. Endpoint HTTP POST `/api/pdf/gerar`
2. Recebe: `resultadoId`, `tipo` (cliente/treinadora), `token` JWT
3. Busca dados no Supabase (resultados, scores, protocolos)
4. Gera HTML usando templates Handlebars
5. Converte para PDF via Gotenberg
6. Faz upload para Supabase Storage
7. Retorna URL pública do PDF

### Não-Funcionais
- Tempo de resposta < 5 segundos
- Suporte a 100 req/min (rate limiting)
- Logs estruturados
- Health checks
- Graceful shutdown

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE GERAÇÃO DE PDF                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      POST /api/pdf/gerar       ┌──────────────────┐
│   App DECIFRA   │ ─────────────────────────────→ │   PDF Service    │
│  (React Native) │   { resultadoId, tipo, token } │   (Node.js 20)   │
└─────────────────┘                                └────────┬─────────┘
        ↑                                                   │
        │                                                   ↓
        │              ┌──────────────┐            ┌────────────────┐
        └──────────────┤   PDF URL    │←───────────│  Gotenberg     │
                       │   (Storage)  │            │  (Chromium)    │
                       └──────────────┘            └────────────────┘
                              │                           ↑
                              ↓                           │
                       ┌──────────────┐         ┌────────┴────────┐
                       │   Usuário    │         │  Template HTML  │
                       │  (Download)  │         │  - Logo PNG     │
                       └──────────────┘         │  - Mandala SVG  │
                                                │  - Chart.js     │
                                                └─────────────────┘
```

### Componentes

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **PDF Service** | Node.js 20 + Express | API REST, orquestração |
| **Gotenberg** | Docker (gotenberg/gotenberg) | Renderização HTML→PDF |
| **Supabase** | PostgreSQL + Storage | Dados e armazenamento |
| **Templates** | Handlebars | HTML dinâmico |

---

## 📁 Estrutura do Projeto

```
pdf-service/
├── 📄 Dockerfile                     # Container Node.js 20 Alpine
├── 📄 docker-compose.yml             # Dev: Node + Gotenberg
├── 📄 docker-compose.prod.yml        # Prod: Otimizado para EasyPanel
├── 📄 package.json                   # Dependências
├── 📄 tsconfig.json                  # TypeScript config
├── 📄 .env.example                   # Variáveis de ambiente
├── 📄 nginx.conf                     # Proxy reverso (opcional)
│
├── 📁 src/
│   ├── 📄 index.ts                   # Entry point (Express)
│   ├── 📁 routes/
│   │   └── 📄 pdf.ts                 # Endpoints /api/pdf/*
│   ├── 📁 services/
│   │   ├── 📄 supabase.ts            # Cliente Supabase
│   │   ├── 📄 gotenberg.ts           # Cliente Gotenberg
│   │   └── 📄 template-engine.ts     # Compilação Handlebars
│   ├── 📁 templates/
│   │   ├── 📄 cliente.hbs            # Template simplificado
│   │   ├── 📄 treinadora.hbs         # Template completo
│   │   └── 📄 partials/
│   │       ├── 📄 header.hbs         # Cabeçalho com logo
│   │       ├── 📄 footer.hbs         # Rodapé Ártio
│   │       └── 📄 styles.hbs         # CSS compartilhado
│   ├── 📁 types/
│   │   └── 📄 index.ts               # Interfaces TypeScript
│   └── 📁 utils/
│       ├── 📄 auth.ts                # JWT validation
│       ├── 📄 logger.ts              # Winston logger
│       └── 📄 rate-limit.ts          # Rate limiting
│
└── 📁 scripts/
    ├── 📄 deploy.sh                  # Deploy automatizado
    └── 📄 test-pdf.sh                # Testes de carga
```

---

## 🎨 Templates Visuais

### Template Cliente (Simplificado)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Resultado DECIFRA - {{cliente.nome}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --vinho-deep: #2D1518;
      --vinho-dark: #3D1A1E;
      --vinho: #6B2D3A;
      --terracota: #C4785A;
      --terracota-light: #D4896A;
      --cream: #F5F0E8;
      --cream-dark: #E8E0D1;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Urbanist', sans-serif;
      background: var(--vinho-deep);
      color: var(--cream);
      padding: 40px;
    }
    
    /* Logo */
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo-container img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
    
    /* Mandala */
    .mandala-container {
      width: 250px;
      height: 250px;
      margin: 30px auto;
    }
    
    .mandala-svg {
      width: 100%;
      height: 100%;
    }
    
    /* Cards */
    .card {
      background: var(--vinho-dark);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      border: 2px solid var(--terracota);
    }
    
    /* Barras de progresso */
    .progress-bar {
      height: 12px;
      background: var(--vinho-deep);
      border-radius: 6px;
      overflow: hidden;
      margin: 10px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--terracota), var(--terracota-light));
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <!-- Logo -->
  <div class="logo-container">
    <img src="{{logoUrl}}" alt="Ártio">
    <h1>DECIFRA</h1>
    <p>Avaliação de Personalidade Big Five</p>
  </div>
  
  <!-- Mandala dos 5 Fatores -->
  <div class="mandala-container">
    <svg class="mandala-svg" viewBox="0 0 200 200">
      <!-- Círculo base -->
      <circle cx="100" cy="100" r="90" fill="none" stroke="#C4785A" stroke-width="2"/>
      
      <!-- Pentágonos dos 5 fatores -->
      {{#each fatores}}
        <polygon points="{{calculaPontosMandala @index this.percentil}}" 
                 fill="{{corFator @index}}" 
                 opacity="0.6"
                 stroke="#F5F0E8"
                 stroke-width="1"/>
      {{/each}}
      
      <!-- Labels -->
      <text x="100" y="20" text-anchor="middle" fill="#F5F0E8" font-size="12">N</text>
      <text x="185" y="80" text-anchor="middle" fill="#F5F0E8" font-size="12">E</text>
      <text x="150" y="175" text-anchor="middle" fill="#F5F0E8" font-size="12">O</text>
      <text x="50" y="175" text-anchor="middle" fill="#F5F0E8" font-size="12">A</text>
      <text x="15" y="80" text-anchor="middle" fill="#F5F0E8" font-size="12">C</text>
    </svg>
  </div>
  
  <!-- Dados do Cliente -->
  <div class="card">
    <div class="info-row">
      <span>Cliente:</span>
      <strong>{{cliente.nome}}</strong>
    </div>
    <div class="info-row">
      <span>Data:</span>
      <span>{{dataTeste}}</span>
    </div>
  </div>
  
  <!-- 5 Fatores -->
  <h2>5 Fatores Principais</h2>
  {{#each fatores}}
  <div class="card">
    <div class="fator-header">
      <h3>{{nome}}</h3>
      <span class="badge">{{classificacao}}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {{percentil}}%"></div>
    </div>
    <div class="fator-footer">
      <span>Percentil</span>
      <strong>{{percentil}}%</strong>
    </div>
  </div>
  {{/each}}
  
  <!-- Protocolos -->
  <h2>Protocolos Recomendados</h2>
  {{#each protocolos}}
  <div class="card protocolo">
    <div class="protocolo-numero">{{@index}}</div>
    <div class="protocolo-conteudo">
      <h4>{{titulo}}</h4>
      <p>{{descricao}}</p>
    </div>
  </div>
  {{/each}}
  
  <!-- Footer -->
  <footer>
    <p>ARTIO · DECIFRA</p>
    <p>Relatório gerado em {{dataGeracao}}</p>
  </footer>
</body>
</html>
```

### Template Treinadora (Completo)

Inclui tudo do cliente + **30 facetas detalhadas** em tabela.

---

## 🔌 API Endpoints

### POST /api/pdf/gerar

**Request:**
```json
{
  "resultadoId": "550e8400-e29b-41d4-a716-446655440000",
  "tipo": "cliente",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://seu-projeto.supabase.co/storage/v1/object/public/pdfs/resultado_550e8400.pdf",
    "expiresAt": "2026-03-12T16:00:00Z"
  }
}
```

**Response Erro (400/401/500):**
```json
{
  "success": false,
  "error": "Mensagem de erro detalhada",
  "code": "INVALID_TOKEN"
}
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-12T13:45:00Z",
  "version": "1.0.0",
  "services": {
    "gotenberg": "healthy",
    "supabase": "healthy"
  }
}
```

---

## ⚙️ Variáveis de Ambiente

```env
# Servidor
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...  # Necessário para ler resultados

# JWT (deve ser o mesmo do app)
JWT_SECRET=sua_chave_secreta_jwt

# Gotenberg
GOTENBERG_URL=http://gotenberg:3000
GOTENBERG_TIMEOUT=30000

# Storage (opcional - se quiser upload automático)
ENABLE_STORAGE_UPLOAD=true
SUPABASE_STORAGE_BUCKET=pdfs
STORAGE_EXPIRATION=3600  # segundos

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=100

# URLs públicas
APP_URL=https://decifra.app
LOGO_URL=https://decifra.app/logo-artio.png
```

---

## 🐳 Docker Compose

### Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'

services:
  pdf-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - GOTENBERG_URL=http://gotenberg:3000
    env_file:
      - .env
    volumes:
      - ./src:/app/src
      - ./templates:/app/templates
    depends_on:
      - gotenberg
    command: npm run dev

  gotenberg:
    image: gotenberg/gotenberg:8
    ports:
      - "3100:3000"
    command:
      - "gotenberg"
      - "--api-port=3000"
      - "--api-timeout=30s"
      - "--chromium-auto-start=true"
```

### Produção (EasyPanel)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  pdf-service:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - GOTENBERG_URL=http://gotenberg:3000
    env_file:
      - .env
    depends_on:
      - gotenberg
    networks:
      - pdf-network
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  gotenberg:
    image: gotenberg/gotenberg:8
    restart: unless-stopped
    command:
      - "gotenberg"
      - "--api-port=3000"
      - "--api-timeout=30s"
      - "--chromium-auto-start=true"
      - "--chromium-restart-after=10"
    networks:
      - pdf-network
    # Limites de recursos
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

networks:
  pdf-network:
    driver: bridge
```

---

## 🚀 Deploy no EasyPanel

### Passo a Passo

```bash
# 1. Clone o repositório na VPS
ssh usuario@vps
mkdir -p /opt/decifra

cd /opt/decifra
git clone https://github.com/seu-org/pdf-service.git
cd pdf-service

# 2. Configure as variáveis de ambiente
cp .env.example .env
nano .env
# (preencha todas as variáveis)

# 3. Deploy com Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Verifique se está rodando
curl http://localhost:3000/health

# 5. Configure o NGINX (EasyPanel)
# - Crie um novo serviço "Website"
# - Aponte para porta 3000
# - Habilite SSL
```

### Configuração EasyPanel

1. **Acesse o painel**: `https://painel.seudominio.com`
2. **Crie um novo serviço**: Tipo "Docker Compose"
3. **Upload dos arquivos**: Envie `docker-compose.prod.yml` e `.env`
4. **Porta exposta**: 3000
5. **Domínio**: `pdf.decifra.app` (ou subdomínio desejado)
6. **SSL**: Habilite Let's Encrypt

---

## 📱 Integração no App DECIFRA

### Novo `utils/pdfGenerator.ts`

```typescript
/**
 * Gerador de PDF via Backend Service
 * Substitui a implementação local problematica
 */

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

const PDF_SERVICE_URL = 'https://pdf.decifra.app'; // URL do seu serviço

interface GerarPDFParams {
  resultadoId: string;
  tipo: 'cliente' | 'treinadora';
}

export async function gerarPDF({ resultadoId, tipo }: GerarPDFParams): Promise<void> {
  try {
    // 1. Obtém sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado');
    }
    
    // 2. Chama o serviço backend
    const response = await fetch(`${PDF_SERVICE_URL}/api/pdf/gerar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resultadoId,
        tipo,
        token: session.access_token,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao gerar PDF');
    }
    
    const { data } = await response.json();
    
    // 3. Abre o PDF
    if (Platform.OS === 'web') {
      // Web: abre em nova aba
      window.open(data.pdfUrl, '_blank');
    } else {
      // Mobile: usa WebBrowser ou compartilhamento
      await WebBrowser.openBrowserAsync(data.pdfUrl);
    }
    
  } catch (error) {
    console.error('[PDF] Erro:', error);
    throw error;
  }
}
```

### Uso nas Telas

```typescript
// app/cliente/resultado.tsx
import { gerarPDF } from '@/utils/pdfGenerator';

// No componente:
const handleGerarPDF = async () => {
  setGerandoPDF(true);
  try {
    await gerarPDF({
      resultadoId: resultado.id,
      tipo: 'cliente',
    });
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível gerar o PDF');
  } finally {
    setGerandoPDF(false);
  }
};
```

---

## 📊 Custo Estimado (VPS)

| Recurso | Especificação | Custo Mensal |
|---------|---------------|--------------|
| **VPS** | 2 vCPU, 4GB RAM, 50GB SSD | R$ 50-100 |
| **Tráfego** | 1000 PDFs/mês (~5MB cada) | Incluso |
| **Supabase Storage** | 5GB | Gratuito (até 1GB) |
| **Total** | | **R$ 50-100/mês** |

---

## ✅ Checklist de Implementação

### Fase 1: Setup Inicial
- [ ] Criar repositório `pdf-service`
- [ ] Implementar estrutura base (Express + TypeScript)
- [ ] Configurar Docker e docker-compose
- [ ] Implementar cliente Gotenberg

### Fase 2: Templates
- [ ] Criar template `cliente.hbs` com mandala SVG
- [ ] Criar template `treinadora.hbs` com 30 facetas
- [ ] Integrar logo PNG da Ártio
- [ ] Testar renderização de gráficos Chart.js

### Fase 3: Integrações
- [ ] Implementar autenticação JWT
- [ ] Integrar com Supabase (leitura de dados)
- [ ] Implementar upload para Storage
- [ ] Adicionar rate limiting

### Fase 4: Deploy
- [ ] Preparar servidor VPS
- [ ] Instalar EasyPanel (se não tiver)
- [ ] Configurar DNS e SSL
- [ ] Deploy do serviço

### Fase 5: App
- [ ] Atualizar `utils/pdfGenerator.ts`
- [ ] Testar geração de PDF em iOS
- [ ] Testar geração de PDF em Android
- [ ] Testar geração de PDF em Web

---

## 🔗 Recursos Úteis

- [Gotenberg Documentation](https://gotenberg.dev/)
- [Gotenberg Node Client](https://www.npmjs.com/package/gotenberg-js-client)
- [Handlebars.js](https://handlebarsjs.com/)
- [EasyPanel Documentation](https://easypanel.io/docs)

---

## 📝 Notas Importantes

1. **Logo da Ártio**: Hospedar no Supabase Storage ou CDN pública para o template acessar
2. **Mandala**: Implementar como SVG puro (mais leve) ou Chart.js (mais interativo)
3. **Cache**: Considerar cache de PDFs gerados (chave: `resultadoId`)
4. **Segurança**: O service_role_key do Supabase deve estar apenas no backend, nunca no app
5. **Monitoramento**: Configurar alertas se o serviço ficar fora do ar

---

**Documento criado em**: 12/03/2026  
**Última atualização**: 12/03/2026  
**Versão**: 1.0
