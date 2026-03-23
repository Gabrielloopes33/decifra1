# 🎨 Serviço PDF - DECIFRA

Serviço dedicado para geração de PDFs profissionais dos relatórios de personalidade do app DECIFRA.

## 🏗️ Arquitetura

```
┌─────────────────┐      HTTP POST       ┌─────────────────┐
│   App DECIFRA   │ ───────────────────> │   PDF Service   │
│   (Cliente)     │                      │   (Node.js)     │
└─────────────────┘                      └────────┬────────┘
                                                  │
                              POST /forms/chromium/convert/html
                                                  │
                                         ┌────────▼────────┐
                                         │   Gotenberg     │
                                         │   (Docker)      │
                                         │  HTML → PDF     │
                                         └─────────────────┘
```

## 📦 Tecnologias

- **Node.js 20** + TypeScript - API REST
- **Gotenberg 8** - Conversão HTML → PDF (Chrome headless)
- **Handlebars** - Templates HTML
- **Supabase** - Dados e Storage
- **Docker** - Containerização

## 🚀 Deploy no EasyPanel

### 1. Clonar e Configurar

```bash
# No servidor VPS
git clone <repo> pdf-service
cd pdf-service
cp .env.example .env
# Editar .env com suas configurações
nano .env
```

### 2. Deploy com Docker Compose

```bash
# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Configurar no EasyPanel

1. Acesse o EasyPanel do servidor
2. Crie um novo serviço tipo "Docker Compose"
3. Faça upload dos arquivos ou configure o git
4. Defina as variáveis de ambiente
5. Deploy!

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `PORT` | Porta do serviço | Sim (3000) |
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_SERVICE_KEY` | Service Role Key | Sim |
| `SUPABASE_ANON_KEY` | Anon Key | Sim |
| `JWT_SECRET` | Segredo para verificar tokens | Sim |
| `GOTENBERG_URL` | URL do serviço Gotenberg | Sim |
| `ENABLE_STORAGE_UPLOAD` | Upload para storage | Não (true) |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket | Não (pdfs) |
| `STORAGE_PUBLIC_URL` | URL pública do storage | Não |
| `MAX_REQUESTS_PER_MINUTE` | Rate limit | Não (10) |

## 📡 API Endpoints

### POST /api/pdf/gerar

Gera um PDF a partir dos dados do resultado.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "resultadoId": "uuid-do-resultado",
  "tipo": "cliente" | "treinadora",
  "token": "jwt-do-usuario"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "pdf": "base64...",          // ou null se upload=true
    "url": "https://...",        // URL do storage (se upload=true)
    "filename": "relatorio_...",
    "tamanho": 12345,
    "tipo": "cliente"
  }
}
```

**Resposta (erro):**
```json
{
  "success": false,
  "error": {
    "code": "RESULTADO_NOT_FOUND",
    "message": "Resultado não encontrado"
  }
}
```

### GET /api/pdf/health

Health check do serviço.

### GET /api/pdf/status

Status detalhado do serviço (requer autenticação).

## 🎨 Templates

### Template Cliente (`templates/cliente.html`)
- Design limpo e acolhedor
- 5 fatores com barras de progresso
- Protocolos recomendados
- Cores: #2D1518 (fundo), #C4785A (terracota), #F5F0E8 (texto)

### Template Treinadora (`templates/treinadora.html`)
- Design profissional
- 5 fatores (visão compacta)
- **30 facetas detalhadas**
- Todos os protocolos
- Indicadores de prioridade

## 📊 Estrutura de Pastas

```
pdf-service/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   └── pdf.ts            # Rotas da API
│   ├── services/
│   │   ├── supabase.ts       # Integração Supabase
│   │   ├── gotenberg.ts      # Conversão PDF
│   │   └── template-engine.ts # Templates Handlebars
│   ├── templates/
│   │   ├── cliente.html      # Template para cliente
│   │   └── treinadora.html   # Template para treinadora
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   └── utils/
│       └── auth.ts           # Autenticação JWT
├── assets/                    # Logo e imagens
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Segurança

- Autenticação JWT obrigatória
- Rate limiting (padrão: 10 req/min)
- Verificação de permissões (treinadora só vê seus clientes)
- Container não-root
- Variáveis sensíveis via environment

## 🐛 Debug

```bash
# Ver logs
docker-compose logs -f pdf-api
docker-compose logs -f gotenberg

# Testar localmente
cd pdf-service
npm install
npm run dev

# Testar health check
curl http://localhost:3000/health

# Testar geração de PDF (com token válido)
curl -X POST http://localhost:3000/api/pdf/gerar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resultadoId": "uuid",
    "tipo": "cliente",
    "token": "jwt"
  }'
```

## 📱 Integração com App

```typescript
// Exemplo de uso no app DECIFRA
async function gerarPDF(resultadoId: string, tipo: 'cliente' | 'treinadora') {
  const token = await supabase.auth.getSession();
  
  const response = await fetch('https://pdf.decifra.app/api/pdf/gerar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resultadoId,
      tipo,
      token
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    if (data.data.url) {
      // Abrir URL do PDF
      await Linking.openURL(data.data.url);
    } else if (data.data.pdf) {
      // Salvar base64 como arquivo
      const pdfPath = await salvarPDFBase64(data.data.pdf, data.data.filename);
      await compartilharPDF(pdfPath);
    }
  }
}
```

## 📄 Licença

Propriedade exclusiva Ártio.
