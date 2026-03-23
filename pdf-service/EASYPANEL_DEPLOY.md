# 🚀 Guia de Deploy no EasyPanel

Este guia explica como fazer deploy do serviço PDF no EasyPanel.

## 📋 Pré-requisitos

- VPS com EasyPanel instalado
- Docker e Docker Compose disponíveis
- Acesso SSH ao servidor
- Projeto Supabase configurado

## 🔧 Passo a Passo

### 1. Preparar o Servidor

```bash
# Acessar o servidor via SSH
ssh usuario@seu-servidor.com

# Criar diretório do serviço
mkdir -p /opt/decifra/pdf-service
cd /opt/decifra/pdf-service
```

### 2. Copiar Arquivos

```bash
# Opção 1: Clonar do git (recomendado)
git clone <url-do-repositorio> .

# Opção 2: Upload manual via SCP
# No seu computador local:
scp -r pdf-service/* usuario@seu-servidor:/opt/decifra/pdf-service/
```

### 3. Configurar Variáveis de Ambiente

```bash
cd /opt/decifra/pdf-service
cp .env.example .env
nano .env
```

Preencha o `.env`:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui

# JWT (mesmo segredo usado no app)
JWT_SECRET=sua_chave_jwt_secreta_muito_segura

# Gotenberg (deixe assim para Docker)
GOTENBERG_URL=http://gotenberg:3000

# Storage
ENABLE_STORAGE_UPLOAD=true
SUPABASE_STORAGE_BUCKET=pdfs
STORAGE_PUBLIC_URL=https://seu-projeto.supabase.co/storage/v1/object/public/pdfs

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=10
```

### 4. Deploy com Docker Compose

```bash
# Subir os serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar se está rodando
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Configurar no EasyPanel

1. Acesse o painel do EasyPanel: `https://seu-servidor:3000`
2. Clique em **"Create Service"**
3. Escolha **"Docker Compose"**
4. Configure:
   - **Name**: `decifra-pdf`
   - **Directory**: `/opt/decifra/pdf-service`
   - **Compose File**: `docker-compose.prod.yml`
5. Clique em **Create**

O EasyPanel vai:
- Ler o `docker-compose.prod.yml`
- Construir a imagem do serviço Node.js
- Baixar a imagem do Gotenberg
- Criar a rede interna
- Iniciar os containers

### 6. Configurar Domínio (Opcional)

No EasyPanel:

1. Vá em **Services** → `decifra-pdf`
2. Clique em **Settings**
3. Em **Domains**, adicione:
   - `pdf.seudominio.com`
4. O EasyPanel vai configurar o proxy reverso automaticamente

### 7. Verificar Deploy

```bash
# Testar health check
curl https://pdf.seudominio.com/health

# Resposta esperada:
# {"status":"ok","service":"decifra-pdf-service",...}
```

## 🔒 Configurações de Segurança

### Firewall (EasyPanel)

O EasyPanel já configura o firewall, mas verifique:

```bash
# Porta 3000 só deve ser acessível internamente
# (entre containers)

# Porta 80/443 abertas para o mundo
```

### Variáveis Sensíveis

No EasyPanel, você pode configurar variáveis de forma segura:

1. Vá em **Services** → `decifra-pdf`
2. Clique em **Environment**
3. Adicione as variáveis
4. Elas ficam criptografadas no banco do EasyPanel

## 📊 Monitoramento

### Logs no EasyPanel

1. Acesse **Services** → `decifra-pdf`
2. Clique em **Logs**
3. Veja logs em tempo real

### Métricas

O EasyPanel mostra automaticamente:
- Uso de CPU
- Uso de Memória
- Status dos containers
- Uptime

## 🔄 Atualização

Para atualizar o serviço:

```bash
cd /opt/decifra/pdf-service

# Puxar atualizações (se usar git)
git pull

# Rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Ou pelo EasyPanel:
# Services → decifra-pdf → Redeploy
```

## 🛠️ Troubleshooting

### Gotenberg não inicia

```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs gotenberg

# Verificar recursos
docker stats

# Problema comum: memória insuficiente
# Gotenberg precisa de pelo menos 512MB
```

### Erro de conexão com Supabase

```bash
# Testar conectividade
docker-compose -f docker-compose.prod.yml exec pdf-api ping seu-projeto.supabase.co

# Verificar variáveis
docker-compose -f docker-compose.prod.yml exec pdf-api env | grep SUPABASE
```

### PDF não gera

```bash
# Verificar logs do serviço
docker-compose -f docker-compose.prod.yml logs pdf-api

# Testar Gotenberg diretamente
curl http://localhost:3000/forms/chromium/convert/html \
  -X POST \
  -F 'files=@test.html'
```

### Erro 429 (Rate Limit)

O rate limit está configurado para 10 req/min por IP/usuário.
Para aumentar, edite o `.env`:

```env
MAX_REQUESTS_PER_MINUTE=20
```

E reinicie:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 Configuração no App

Depois do deploy, configure o app para usar o novo serviço:

```typescript
// constants/api.ts
export const PDF_SERVICE_URL = 'https://pdf.seudominio.com';
// ou
export const PDF_SERVICE_URL = 'https://seu-vps:3000';
```

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique health: `curl /health`
3. Verifique status: `curl /api/pdf/status`
4. Confira as variáveis de ambiente
5. Verifique conectividade com Supabase

## 📚 Recursos

- [Documentação Gotenberg](https://gotenberg.dev/)
- [Documentação EasyPanel](https://easypanel.io/docs)
- [Handlebars Helpers](https://handlebarsjs.com/guide/builtin-helpers.html)
