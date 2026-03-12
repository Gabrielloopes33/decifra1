# 🎯 Plano de Execução DECIFRA - Opção B (Completa)

> **Data:** 11/03/2026  
> **Versão:** 2.0  
> **Foco:** Produto completo com 15 protocolos principais (ao invés de 90)

---

## 📊 ALTERAÇÕES DO PLANO ORIGINAL

### Sistema de Protocolos Reduzido (15 ao invés de 90)

| Fator | Facetas Críticas | Protocolos | Prioridade |
|-------|-----------------|------------|------------|
| **N - Neuroticismo** | N1 (Ansiedade), N6 (Vulnerabilidade) | 6 (A/B/C cada) | 🔴 Alta |
| **E - Extroversão** | E1 (Cordialidade), E3 (Assertividade) | 6 | 🟡 Média |
| **O - Abertura** | O1 (Fantasia), O4 (Ações) | 3 | 🟢 Baixa |

**Total: 15 protocolos** (facilita desenvolvimento e teste, expansível depois)

---

## 🗓️ CRONOGRAMA ATUALIZADO

```
SEMANA 1 (11-18 Mar)
├── Dia 1-2: FASE 1.1 + 1.2 (Ordem questões + Cores Ártio)
├── Dia 3-4: FASE 1.3 + 1.4 (Código + Splash)
└── Dia 5-7: FASE 1.5 + 2.1 (Tela ritual + Reanimated)

SEMANA 2 (18-25 Mar)
├── Dia 1-3: FASE 2.2 (Transições estações)
├── Dia 4-5: FASE 2.3 (Temas por estação)
└── Dia 6-7: FASE 2.4 + 2.5 (Anims resposta + processando)

SEMANA 3 (25-01 Abr)
├── Dia 1-3: FASE 3.1 (15 protocolos)
├── Dia 4-5: FASE 3.2 (Algoritmo recomendação)
└── Dia 6-7: FASE 3.3 + 3.4 (Telas protocolos)

SEMANA 4 (01-08 Abr)
├── Dia 1-3: FASE 4 (Textos interpretativos)
├── Dia 4-5: FASE 5.1 + 5.2 (Hotmart + Email)
└── Dia 6-7: FASE 5.3 + 5.4 (PDF + Push)

SEMANA 5 (08-15 Abr)
├── Dia 1-3: FASE 6 (Polish)
└── Dia 4-5: FASE 7 (Build + TestFlight)

SEMANA 6 (15-22 Abr)
├── Testes internos
├── Ajustes finais
└── Submissão App Store/Play Store
```

**Total: 6 semanas** (ao invés de 10)

---

## 🎨 SISTEMA DE DESIGN ÁRTIO (Extraído do Ícone)

### Paleta de Cores Principal

```typescript
// constants/colors-artio.ts
export const COLORS_ARTIO = {
  // Primary Gradient (from icon)
  terracota: '#C45A3D',
  terracotaLight: '#E86645',
  terracotaDark: '#A04025',
  
  // Deep Wine (from icon shadow)
  vinho: '#6B2D3A',
  vinhoDark: '#3D1A1E',
  vinhoDeep: '#2D1518',
  
  // Secondary
  ocre: '#C4A77D',
  ocreLight: '#D9BE94',
  
  // Neutrals (icon off-white)
  cream: '#F5F0E6',
  creamDark: '#E8E0D1',
  offWhite: '#FAF8F3',
  
  // Station Colors (4 elements)
  air: '#5B8A8A',      // Station 1 - Como você pensa
  earth: '#C4A77D',    // Station 2 - Como você age
  water: '#4A6FA5',    // Station 3 - Como você conecta
  fire: '#B85C38',     // Station 4 - Como você reage
  
  // Semantic
  success: '#4CAF50',
  warning: '#FFA726',
  error: '#FF5252',
  info: '#4A6FA5',
};

// Gradient presets
export const GRADIENTS = {
  primary: ['#C45A3D', '#6B2D3A'],
  primaryDark: ['#3D1A1E', '#2D1518'],
  splash: ['#C45A3D', '#3D1A1E', '#2D1518'],
  button: ['#E86645', '#C45A3D'],
};
```

### Tipografia

```typescript
// constants/typography.ts
export const FONTS = {
  primary: 'Inter',  // @expo-google-fonts/inter já instalado
};

export const TYPOGRAPHY = {
  hero: { size: 40, weight: '700', lineHeight: 48, letterSpacing: 2 },
  h1: { size: 32, weight: '700', lineHeight: 40 },
  h2: { size: 24, weight: '600', lineHeight: 32 },
  h3: { size: 20, weight: '600', lineHeight: 28 },
  body: { size: 16, weight: '400', lineHeight: 24 },
  bodySmall: { size: 14, weight: '400', lineHeight: 20 },
  caption: { size: 12, weight: '500', lineHeight: 16 },
  button: { size: 16, weight: '600', lineHeight: 24 },
};
```

---

## 📋 DETALHAMENTO DAS FASES

---

## 🔧 FASE 1: CORREÇÕES FUNDAMENTAIS (Semana 1)

### F1.1 - Ordem Anti-Manipulação das Questões

**Implementar em `constants/ordem-questoes.ts`:**

```typescript
// Ordem específica para evitar padrões de resposta
export const ORDEM_ANTI_MANIPULACAO = [
  73,45,117,9,29,101,53,85,37,65,1,21,97,77,49,109,61,33,13,5,
  89,41,113,17,69,105,57,81,25,93,2,46,118,10,30,102,54,86,38,66,
  22,98,78,50,110,62,34,14,6,90,42,114,18,70,106,58,82,26,94,74,
  3,47,119,11,31,103,55,87,39,67,23,99,79,51,111,63,35,15,7,91,
  43,115,19,71,107,59,83,27,95,75,4,48,120,12,32,104,56,88,40,68,
  24,100,80,52,112,64,36,16,8,92,44,116,20,72,108,60,84,28,96,76
];

// Agrupar por estações (30 questões cada)
export const ESTACOES_ORDEM = {
  1: ORDEM_ANTI_MANIPULACAO.slice(0, 30),
  2: ORDEM_ANTI_MANIPULACAO.slice(30, 60),
  3: ORDEM_ANTI_MANIPULACAO.slice(60, 90),
  4: ORDEM_ANTI_MANIPULACAO.slice(90, 120),
};
```

**Alterar `app/cliente/teste.tsx`:**
- Usar `ESTACOES_ORDEM[estacaoAtual]` ao invés de ordem sequencial
- Atualizar contador de progresso

---

### F1.2 - Paleta de Cores Ártio

**Arquivo: `constants/colors-artio.ts`**
- Criar novo arquivo com paleta completa
- Atualizar `constants/colors.ts` para usar novas cores
- Atualizar todos os componentes que usam COLORS

**Checklist:**
- [ ] Gradientes de fundo (terracota → vinho)
- [ ] Botões primários (terracota)
- [ ] Cards (vinho escuro com transparência)
- [ ] Textos (cream/off-white)
- [ ] Status/error/warning

---

### F1.3 - Formato Código ART-XXXX

**Arquivo: `app/cliente/codigo.tsx`**

```typescript
// Auto-formatação com hífen
const formatarCodigo = (texto: string) => {
  const limpo = texto.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (limpo.length <= 3) return limpo;
  return `${limpo.slice(0, 3)}-${limpo.slice(3, 7)}`;
};

// Validação visual
const isValido = codigo.match(/^ART-[A-Z0-9]{4}$/);
```

**UX:**
- Borda verde quando válido
- Borda vermelha com shake quando inválido
- Haptic feedback em ambos os casos

---

### F1.4 - Splash Screen Animada

**Configuração `app.json`:**
- Usar ícone DECIFRA com animação Lottie
- Background: gradiente terracota → vinho
- Duração: 2-3 segundos

**Componente: `app/+native-intent.tsx` ou splash personalizado**
- Ícone central pulsando
- Animação de "respiração"
- Fade in do nome DECIFRA

---

### F1.5 - Tela Entrada Ritualística

**Atualizar `app/index.tsx`:**

```typescript
// Texto ritualístico
const MENSAGEM_RITUAL = {
  titulo: 'DECIFRA',
  subtitulo: 'Descubra sua arquitetura emocional',
  descricao: 'Um mergulho de 10 minutos para revelar os padrões que moldam quem você é.',
};
```

**Design:**
- Ícone do app animado (pulsação suave)
- Tipografia premium
- Botões com sombra sutil
- Transição suave ao navegar

---

## ✨ FASE 2: ANIMAÇÕES (Semanas 1-2)

### Instalação de Dependências

```bash
npm install react-native-reanimated@~3.16.0
npm install react-native-gesture-handler@~2.20.0
npm install lottie-react-native@6.5.1
npx expo install expo-haptics
```

**Configuração `babel.config.js`:**
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### F2.2 - Transições entre Estações

**Arquivo: `lib/animations.ts`**

```typescript
import { Easing } from 'react-native-reanimated';

export const stationTransition = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 400, easing: Easing.ease }
  },
  message: {
    opacity: 1,
    scale: 1,
    transition: { duration: 600 }
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: 600, easing: Easing.out(Easing.ease) }
  }
};

// Sequência completa: fade out (0.4s) → mensagem (0.4s) → fade in (0.6s)
```

### F2.3 - Temas Visuais por Estação

**Atualizar `app/cliente/teste.tsx`:**

```typescript
const STATION_THEMES = {
  1: { 
    name: 'Como você pensa', 
    color: '#5B8A8A', 
    gradient: ['#5B8A8A', '#3D5A5A'],
    icon: 'cloud'
  },
  2: { 
    name: 'Como você age', 
    color: '#C4A77D', 
    gradient: ['#C4A77D', '#8A7555'],
    icon: 'mountain'
  },
  3: { 
    name: 'Como você conecta', 
    color: '#4A6FA5', 
    gradient: ['#4A6FA5', '#2D4569'],
    icon: 'water'
  },
  4: { 
    name: 'Como você reage', 
    color: '#B85C38', 
    gradient: ['#B85C38', '#7A3D24'],
    icon: 'flame'
  },
};
```

**Implementar:**
- Gradientes diferentes por estação
- Ícone do elemento no header
- Animação de morph entre ícones

### F2.4 - Animação Seleção de Resposta

```typescript
// Pop animation ao selecionar
const popAnimation = {
  scale: [1, 1.1, 1],
  transition: { duration: 200, type: 'spring' }
};

// Haptic feedback
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

### F2.5 - Tela Processando com Mandala Animada

**Componente: `app/cliente/processando.tsx`**

- Animação de desenho do SVG path
- Textos de transição: "Processando suas respostas..."
- Mandala sendo "desenhada" gradualmente
- Transição para resultado ao completar

---

## 📚 FASE 3: SISTEMA DE 15 PROTOCOLOS (Semana 3)

### Protocolos Prioritários

| Código | Faceta | Tipo | Título | Prioridade |
|--------|--------|------|--------|------------|
| N1-A | Ansiedade | Alto | Gestão da Ansiedade | 🔴 |
| N1-B | Ansiedade | Baixo | Atenção Plena | 🔴 |
| N1-C | Ansiedade | Médio | Equilíbrio Emocional | 🟡 |
| N6-A | Vulnerabilidade | Alto | Fortalecimento Interno | 🔴 |
| N6-B | Vulnerabilidade | Baixo | Autoconfiança | 🔴 |
| N6-C | Vulnerabilidade | Médio | Resiliência | 🟡 |
| E1-A | Cordialidade | Alto | Profundidade Social | 🟡 |
| E1-B | Cordialidade | Baixo | Conexão Autêntica | 🟡 |
| E1-C | Cordialidade | Médio | Equilíbrio Social | 🟢 |
| E3-A | Assertividade | Alto | Liderança Saudável | 🟡 |
| E3-B | Assertividade | Baixo | Voz e Expressão | 🟡 |
| E3-C | Assertividade | Médio | Comunicação | 🟢 |
| N2-A | Raiva | Alto | Gestão da Frustração | 🔴 |
| N2-B | Raiva | Baixo | Expressão Saudável | 🔴 |
| N2-C | Raiva | Médio | Equilíbrio Emocional | 🟡 |

### Estrutura do Protocolo

```typescript
// constants/protocolos.ts
export interface Protocolo {
  codigo: string;
  faceta: string;
  tipo: 'alto' | 'baixo' | 'medio';
  titulo: string;
  objetivo: string;
  descricao: string;
  exercicios: string[];
  duracao: string;
  recursos?: string[];
}

export const PROTOCOLOS: Record<string, Protocolo> = {
  'N1-A': {
    codigo: 'N1-A',
    faceta: 'N1',
    tipo: 'alto',
    titulo: 'Gestão da Ansiedade',
    objetivo: 'Reduzir níveis elevados de ansiedade e criar reservas emocionais',
    descricao: 'Protocolo para identificar gatilhos de ansiedade e desenvolver técnicas de regulação emocional.',
    exercicios: [
      'Prática diária de respiração 4-7-8 (4s inspira, 7s segura, 8s expira)',
      'Journaling de preocupações: escrever por 5 minutos todas as manhãs',
      'Exercício físico regular: 30 min, 3x por semana',
      'Identificação de pensamentos catastróficos e reestruturação',
    ],
    duracao: '2-3 semanas',
    recursos: ['App de meditação', 'Diário', 'Playlist calmante'],
  },
  // ... mais 14 protocolos
};
```

### Algoritmo de Recomendação

```typescript
// utils/recomendacao.ts
export function recomendarProtocolos(
  resultados: Resultado[],
  limiteCliente: number = 3,
  limiteTreinadora: number = 6
): { cliente: Protocolo[]; treinadora: Protocolo[] } {
  const pontuacoes = new Map<string, number>();
  
  // Pontuar por classificação
  for (const r of resultados) {
    let pontos = 0;
    if (r.classificacao === 'Muito Alto' || r.classificacao === 'Muito Baixo') {
      pontos = 3;
    } else if (r.classificacao === 'Alto' || r.classificacao === 'Baixo') {
      pontos = 2;
    }
    
    // Bônus de segurança (N1, N5, N6 altos = prioridade)
    if (['N1', 'N5', 'N6'].includes(r.codigo) && pontos > 0) {
      pontos += 1;
    }
    
    pontuacoes.set(r.codigo, pontos);
  }
  
  // Ordenar e retornar
  const ordenados = Array.from(pontuacoes.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([codigo]) => PROTOCOLOS[codigo])
    .filter(Boolean);
  
  return {
    cliente: ordenados.slice(0, limiteCliente),
    treinadora: ordenados.slice(0, limiteTreinadora),
  };
}
```

---

## 📝 FASE 4: TEXTOS INTERPRETATIVOS (Semana 4)

### Estrutura (5 fatores × 5 faixas = 25 textos)

```typescript
// constants/interpretacoes.ts
export const INTERPRETACOES: Record<string, Record<string, {
  titulo: string;
  descricao: string;
  pontosFortes: string[];
  atencao: string[];
}>> = {
  'N': {
    'Muito Baixo': {
      titulo: 'Estabilidade Emocional',
      descricao: 'Você mantém a calma mesmo em situações adversas...',
      pontosFortes: ['Resiliência', 'Equilíbrio', 'Confiança'],
      atencao: ['Não ignorar sinais de alerta'],
    },
    'Baixo': { /* ... */ },
    'Médio': { /* ... */ },
    'Alto': { /* ... */ },
    'Muito Alto': {
      titulo: 'Sensibilidade Emocional',
      descricao: 'Você experimenta emoções intensamente...',
      pontosFortes: ['Empatia', 'Autoconhecimento', 'Intuição'],
      atencao: ['Gestão do estresse', 'Autocuidado'],
    },
  },
  'E': { /* ... */ },
  'O': { /* ... */ },
  'A': { /* ... */ },
  'C': { /* ... */ },
};
```

---

## 🔌 FASE 5: INTEGRAÇÕES (Semana 4)

### F5.1 - Hotmart Webhook

**Supabase Edge Function:**
```typescript
// supabase/functions/hotmart-webhook/index.ts
Deno.serve(async (req) => {
  const { event, data } = await req.json();
  
  if (event === 'PURCHASE_APPROVED') {
    const { buyer, product } = data;
    
    // Buscar treinadora
    const { data: treinadora } = await supabase
      .from('treinadoras')
      .select('*')
      .eq('email', buyer.email)
      .single();
    
    // Adicionar créditos
    await supabase
      .from('treinadoras')
      .update({ creditos: treinadora.creditos + product.quantity })
      .eq('id', treinadora.id);
    
    // Enviar email
    await resend.emails.send({
      to: buyer.email,
      subject: 'Créditos DECIFRA adicionados',
      // ...
    });
  }
});
```

### F5.2 - Email (Resend)

### F5.3 - Exportação PDF

### F5.4 - Notificações Push

---

## ✨ FASE 6: POLISH (Semana 5)

- [ ] Mandala interativa (toque nos fatores)
- [ ] Session persistence (7 dias)
- [ ] Pull-to-refresh no dashboard
- [ ] Busca de clientes por nome
- [ ] Detecção de padrões suspeitos
- [ ] Performance: FlashList, lazy loading

---

## 🚀 FASE 7: PUBLICAÇÃO (Semana 5-6)

### Checklist

- [ ] Configurar `eas.json`
- [ ] Environment variables
- [ ] Build iOS (TestFlight)
- [ ] Build Android (Internal Testing)
- [ ] Screenshots para lojas
- [ ] Descrição ASO
- [ ] Submissão

**Dependências externas (Ártio/Isa):**
- [ ] Apple Developer Program
- [ ] Google Play Developer
- [ ] D-U-N-S Number
- [ ] Site no ar
- [ ] Email @artio.com.br

---

## 🛠️ SKILLS DO AIOX DISPONÍVEIS

| Skill | Localização | Uso |
|-------|-------------|-----|
| expo-app-design | `.agents/skills/expo/SKILL.md` | Padrões Expo Router, temas |
| upgrading-expo | `.agents/skills/expo/SKILL.md` | Upgrades de SDK |
| expo-deployment | `.agents/skills/expo/SKILL.md` | EAS Build, deploy |
| react-native-best-practices | `.agents/skills/react-native/SKILL.md` | Arquitetura, hooks |
| react-native-performance | `.agents/skills/react-native/SKILL.md` | 60fps, otimizações |
| ui-ux-pro-max | `.agents/skills/ui-ux-pro-max/SKILL.md` | Design system Ártio |

---

## ✅ CHECKLIST DE TESTES

### Fluxo Cliente
- [ ] Splash animada
- [ ] Código ART-XXXX auto-formata
- [ ] 4 estações com transições
- [ ] Progresso salvo local
- [ ] Cálculo correto
- [ ] Mandala animada
- [ ] 3 protocolos recomendados

### Fluxo Treinadora
- [ ] Login
- [ ] Dashboard
- [ ] Geração de código
- [ ] Visualização resultados
- [ ] 6 protocolos recomendados

---

**Documento criado em:** 11/03/2026  
**Próxima revisão:** Após Fase 1
