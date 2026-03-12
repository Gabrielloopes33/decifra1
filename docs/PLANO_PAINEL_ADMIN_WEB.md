# 🌐 Plano do Painel Admin Web - DECIFRA

> Sistema web administrativo para gerenciamento de treinadoras, códigos e visualização de dados.

---

## 🎯 VISÃO GERAL

O Expo Router permite criar rotas web nativamente! Vamos ter:
- `/` → Landing page do app (mobile + web)
- `/admin/login` → Login do admin
- `/admin/dashboard` → Painel administrativo
- `/admin/treinadoras` → Lista de treinadoras
- `/admin/codigos` → Todos os códigos
- `/admin/compras` → Compras Hotmart

---

## 📁 ESTRUTURA DE PASTAS

```
app/                          # App mobile (já existe)
├── cliente/                  # Fluxo cliente
├── treinadora/               # Fluxo treinadora
└── ...

app-admin/                    # NOVO: Área admin web
├── _layout.tsx               # Layout com sidebar/menu
├── login.tsx                 # Tela de login admin
├── (dashboard)/              # Grupo com layout interno
│   ├── _layout.tsx           # Layout com sidebar
│   ├── index.tsx             # Dashboard overview
│   ├── treinadoras.tsx       # Lista de treinadoras
│   ├── codigos.tsx           # Gerenciamento de códigos
│   └── compras.tsx           # Compras Hotmart
└── api/                      # API routes (se necessário)
    └── webhook-hotmart.ts    # Webhook pode ficar aqui também
```

---

## 🔐 AUTENTICAÇÃO ADMIN

### Opção A: Simples (recomendado pro MVP)
- Usar a mesma tabela `treinadoras` com flag `is_admin`
- Login com email/senha do Supabase
- Verificar `is_admin = true` no login

### Opção B: Tabela separada de admins
- Tabela `admins` separada
- Mesmo fluxo de auth

**Vamos com Opção A (mais simples):**

```sql
-- Adicionar flag de admin na tabela treinadoras
ALTER TABLE treinadoras ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Criar seu usuário como admin
UPDATE treinadoras SET is_admin = true WHERE email = 'seu-email@exemplo.com';
```

---

## 🎨 DESIGN DO PAINEL

### Layout Desktop (sidebar + conteúdo)
```
┌─────────────────────────────────────────────────────┐
│  🎨 DECIFRA        │  Dashboard                     │
│  ──────────────────┼──────────────────────────────  │
│  📊 Dashboard      │                                │
│  👥 Treinadoras    │  [CONTEÚDO AQUI]               │
│  🎟️ Códigos        │                                │
│  💰 Compras        │                                │
│  ⚙️ Config         │                                │
│  ──────────────────┼──────────────────────────────  │
│  👤 Admin          │                                │
└─────────────────────────────────────────────────────┘
  ↑ Sidebar fixa     ↑ Área scrollável
```

### Cores (mesma identidade Ártio)
- Background: `#2D1518` (vinho escuro)
- Sidebar: `#1A0C0E` (mais escuro)
- Cards: `rgba(255, 255, 255, 0.05)`
- Destaque: `#C45A3D` (terracota)
- Texto: `#F5F0E6` (creme)

---

## 📱 RESPONSIVIDADE

| Breakpoint | Layout |
|------------|--------|
| Desktop (>1024px) | Sidebar fixa + conteúdo |
| Tablet (768-1024px) | Sidebar colapsável |
| Mobile (<768px) | Menu hamburguer + bottom nav |

---

## 🛠️ STACK TECNOLÓGICO

| Tecnologia | Uso |
|------------|-----|
| **Expo Router** | Roteamento web |
| **React Native Web** | Componentes RN no browser |
| **Tailwind CSS** | (Opcional) Estilização rápida |
| **Recharts** | Gráficos de dados |
| **TanStack Table** | Tabelas avançadas |
| **Supabase** | Mesmo backend do app |

---

## 📊 FUNCIONALIDADES POR PÁGINA

### 1. Dashboard (`/admin`)
```
┌────────────────────────────────────────────────────────────┐
│  KPI Cards                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │Treinad. │ │ Códigos │ │ Clientes│ │  Receita│         │
│  │   42    │ │  156/300│ │   189   │ │ R$12.5k │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
├────────────────────────────────────────────────────────────┤
│  Gráfico: Códigos usados por dia                          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📈 Sparkline últimos 30 dias                       │  │
│  └─────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  Últimas atividades                                       │
│  • Maria comprou 10 códigos (há 2h)                      │
│  • Joana usou código DECF-XXXX (há 3h)                   │
└────────────────────────────────────────────────────────────┘
```

### 2. Treinadoras (`/admin/treinadoras`)
- Tabela com: Nome, Email, Códigos, Clientes, Ações
- Busca/filtro
- Ver detalhes da treinadora
- Desativar/reativar conta

### 3. Códigos (`/admin/codigos`)
- Visualização de todos os códigos
- Filtros: Por treinadora, status (usado/disponível), validade
- Botão "Gerar códigos manuais"
- Exportar CSV

### 4. Compras (`/admin/compras`)
- Lista de compras Hotmart
- Status: Concluída, Pendente, Cancelada
- Reenviar email de códigos
- Visualizar detalhes da transação

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### Etapa 1: Setup (5 min)
```bash
# Verificar se expo-router web está configurado
# Já deve estar funcionando com: npx expo start --web
```

### Etapa 2: Criar estrutura de pastas
```bash
mkdir -p app-admin/(dashboard)
```

### Etapa 3: Layout base
- `app-admin/_layout.tsx` → Redireciona pro login se não autenticado
- `app-admin/login.tsx` → Tela de login
- `app-admin/(dashboard)/_layout.tsx` → Sidebar + header

### Etapa 4: Páginas
- Dashboard com cards e gráficos
- Treinadoras com tabela
- Códigos com filtros
- Compras com status

### Etapa 5: Configurar web
```bash
# Executar versão web
npx expo start --web

# Ou build para deploy
npx expo export --platform web
```

---

## ☁️ DEPLOY

### Opção A: Vercel (recomendado)
```bash
# Instalar vercel CLI
npm i -g vercel

# Build
npx expo export --platform web

# Deploy
vercel --prod
```

### Opção B: Netlify
```bash
npx expo export --platform web
netlify deploy --prod --dir dist
```

### Opção C: Supabase Hosting (já usa)
- Pode hospedar junto com o backend

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

```
□ 1. Schema: Adicionar is_admin na tabela treinadoras
□ 2. Setup: Criar pasta app-admin/
□ 3. Auth: Tela de login admin
□ 4. Layout: Sidebar + estrutura base
□ 5. Dashboard: Cards e gráficos
□ 6. Treinadoras: Lista com tabela
□ 7. Códigos: Visualização completa
□ 8. Compras: Status e ações
□ 9. Responsivo: Mobile/tablet
□ 10. Deploy: Publicar na Vercel
```

---

## 🤔 DÚVIDAS COMUNS

**Q: Precisa separar do app mobile?**
R: Não! Expo Router detecta automaticamente se é web ou mobile. A pasta `app/` continua sendo mobile, `app-admin/` é web.

**Q: Posso usar componentes diferentes pro web?**
R: Sim! Você pode criar componentes específicos com `.web.tsx` ou usar `Platform.OS === 'web'`.

**Q: E o SEO?**
R: Expo Router gera HTML estático. Pra SEO completo, considere Next.js (mas é mais trabalho).

**Q: Precisa de domínio separado?**
R: Recomendado! Ex: `admin.decifra.app` ou `decifra.app/admin`

---

Quer começar a implementação? Posso começar pela estrutura base! 🚀
