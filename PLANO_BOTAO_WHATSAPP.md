# Plano Técnico: Botão de WhatsApp na Tela de Conclusão

## 📋 Visão Geral

**Objetivo:** Adicionar um botão de WhatsApp na tela de resultado do teste para que a aluna possa entrar em contato direto com sua treinadora, com mensagem padrão pré-preenchida.

**Preocupações de Segurança:**
- O número de WhatsApp não pode ser exposto a treinadoras erradas
- A mensagem deve chegar apenas à treinadora correta daquela aluna
- Proteção contra scraping de dados de contato

---

## 🔍 Análise do Estado Atual

### 1. Estrutura de Dados (Banco de Dados)

#### Tabela `treinadoras` (Schema Atual)
```sql
CREATE TABLE treinadoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  creditos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**❌ PROBLEMA:** Não existe campo `telefone` ou `whatsapp` na tabela atual.

#### Tabela `clientes` (Relação com Treinadora)
```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT,
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**✅ OK:** A relação cliente-treinadora existe e é obrigatória.

#### Tabela `codigos` (Vínculo Inicial)
```sql
CREATE TABLE codigos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  valido_ate TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**✅ OK:** O código vincula cliente à treinadora no momento do cadastro.

### 2. Fluxo Atual do Cliente

```
Tela de Código (codigo.tsx)
    ↓ (valida código)
Tela de Cadastro (cadastro.tsx) 
    ↓ (cria cliente com treinadora_id)
Estações do Teste (estacao1-4.tsx)
    ↓ (salva respostas)
Processamento (processando.tsx)
    ↓ (calcula resultados)
Tela de Resultado (resultado.tsx) ← AQUI ENTRA O BOTÃO
```

### 3. Tela de Resultado Atual (`app/cliente/resultado.tsx`)

- Recebe: `clienteId` e `resultadoId` via params
- Busca: resultado do cliente e protocolos recomendados
- **❌ Não busca:** dados da treinadora (incluindo contato)

---

## ⚠️ Gaps Identificados

### Gap 1: Campo de Telefone Não Existe
- A tabela `treinadoras` não possui campo para telefone/whatsapp
- O schema na documentação (`docs_extracted/development_stack.txt`) menciona `telefone text`, mas o schema real (`supabase-schema.sql`) não tem

### Gap 2: Tela de Resultado Não Acessa Dados da Treinadora
- A query atual só busca resultado e protocolos
- Não há join com a tabela de treinadoras

### Gap 3: Interface de Admin Não Gerencia Telefone
- A tela de treinadoras (`app/(admin)/(dashboard)/treinadoras.tsx`) só cadastra nome e email
- Não há campo para telefone/whatsapp

---

## 🛠️ Plano de Implementação

### Fase 1: Alterações no Banco de Dados (SUPABASE)

#### 1.1 Adicionar Coluna `whatsapp` na Tabela `treinadoras`

```sql
-- Adicionar coluna whatsapp
ALTER TABLE treinadoras 
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_treinadoras_whatsapp 
ON treinadoras(whatsapp);

-- Comentário documentando o campo
COMMENT ON COLUMN treinadoras.whatsapp IS 
'Número de WhatsApp da treinadora para contato direto com alunas (formato: +5511999999999)';
```

#### 1.2 Atualizar RLS (Row Level Security)

```sql
-- Política: Clientes podem ver apenas o whatsapp da SUA treinadora
-- (já coberto pela policy existente de clientes verem seus dados)

-- Política: Treinadoras podem atualizar seu próprio whatsapp
CREATE POLICY "Treinadoras podem atualizar seu whatsapp"
  ON treinadoras FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
```

#### 1.3 Criar Função para Buscar WhatsApp da Treinadora (Opcional - Segurança Extra)

```sql
-- Função segura para buscar whatsapp da treinadora de um cliente
CREATE OR REPLACE FUNCTION get_whatsapp_treinadora(p_cliente_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_whatsapp TEXT;
BEGIN
  SELECT t.whatsapp INTO v_whatsapp
  FROM treinadoras t
  INNER JOIN clientes c ON c.treinadora_id = t.id
  WHERE c.id = p_cliente_id;
  
  RETURN v_whatsapp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Fase 2: Atualização dos Types TypeScript

#### 2.1 Atualizar `types/database.ts`

```typescript
export interface Database {
  public: {
    Tables: {
      treinadoras: {
        Row: {
          id: string
          email: string
          nome: string
          whatsapp: string | null  // NOVO CAMPO
          creditos: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome: string
          whatsapp?: string | null  // NOVO CAMPO
          creditos?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          whatsapp?: string | null  // NOVO CAMPO
          creditos?: number
          updated_at?: string
        }
      }
      // ... resto das tabelas
    }
  }
}
```

### Fase 3: Atualização do Admin (Cadastro/Edição de Treinadoras)

#### 3.1 Atualizar `app/(admin)/(dashboard)/treinadoras.tsx`

**Mudanças necessárias:**
1. Adicionar campo `whatsapp` no estado `novaTreinadora`
2. Adicionar campo `whatsapp` no estado `editForm`
3. Adicionar input de whatsapp no modal de criação
4. Adicionar input de whatsapp no modal de edição
5. Atualizar chamadas ao Supabase para incluir whatsapp

**Validações necessárias:**
- Formato do número (com ou sem +55)
- Remover caracteres não numéricos antes de salvar
- Opcional: máscara de input (XX) XXXXX-XXXX

#### 3.2 Atualizar Hook `useTreinadorasAdmin`

```typescript
// Adicionar whatsapp na interface TreinadoraAdmin
export interface TreinadoraAdmin {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;  // NOVO
  creditos: number;
  created_at: string;
  // ...
}
```

### Fase 4: Implementação do Botão na Tela de Resultado

#### 4.1 Atualizar Query em `app/cliente/resultado.tsx`

```typescript
// Adicionar busca da treinadora
const carregarResultado = async () => {
  try {
    // Buscar resultado (já existe)
    const { data: resultadoData, error: resultadoError } = await supabase
      .from('resultados')
      .select('*')
      .eq('id', resultadoId)
      .single();

    // Buscar dados da treinadora através do cliente
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('treinadora_id, treinadora:treinadora_id(whatsapp, nome)')
      .eq('id', clienteId)
      .single();

    // OU usar a função RPC se criada
    const { data: whatsappData } = await supabase
      .rpc('get_whatsapp_treinadora', { p_cliente_id: clienteId });

    // Armazenar no estado
    setTreinadoraWhatsApp(clienteData?.treinadora?.whatsapp || null);
    setTreinadoraNome(clienteData?.treinadora?.nome || null);
  }
};
```

#### 4.2 Criar Componente/Função do Botão WhatsApp

```typescript
// Função para abrir WhatsApp com mensagem pré-preenchida
const handleAbrirWhatsApp = () => {
  if (!treinadoraWhatsApp) {
    Alert.alert(
      'Contato indisponível', 
      'O contato da sua treinadora não está disponível no momento.'
    );
    return;
  }

  // Formatar número (remover não-numéricos, garantir +55)
  const numeroLimpo = treinadoraWhatsApp.replace(/\D/g, '');
  const numeroFormatado = numeroLimpo.startsWith('55') 
    ? `+${numeroLimpo}` 
    : `+55${numeroLimpo}`;

  // Mensagem padrão personalizada
  const mensagem = encodeURIComponent(
    `Olá ${treinadoraNome || ''}!\n\n` +
    `Finalizei o teste DECIFRA e gostaria de agendar minha devolutiva.\n\n` +
    `Meu código: ${codigoInfo?.codigo || ''}`
  );

  // URL do WhatsApp
  const url = `https://wa.me/${numeroFormatado}?text=${mensagem}`;

  // Abrir Linking
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
      }
    })
};
```

#### 4.3 Adicionar Botão na UI

```tsx
// Adicionar na seção de botões da tela de resultado
{treinadoraWhatsApp && (
  <TouchableOpacity
    style={styles.botaoWhatsApp}
    onPress={handleAbrirWhatsApp}
    activeOpacity={0.8}
  >
    <Text style={styles.botaoWhatsAppTexto}>
      💬 Falar com minha treinadora
    </Text>
  </TouchableOpacity>
)}

// Estilos
botaoWhatsApp: {
  backgroundColor: '#25D366', // Cor oficial WhatsApp
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
},
botaoWhatsAppTexto: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
```

### Fase 5: Mensagem Padrão Personalizada

#### 5.1 Opções de Mensagem

**Opção 1 - Simples:**
```
Olá [Nome Treinadora]!

Finalizei o teste DECIFRA e gostaria de agendar minha devolutiva.

Meu código: [CÓDIGO]
```

**Opção 2 - Com arquétipo:**
```
Olá [Nome Treinadora]!

Finalizei o teste DECIFRA! Meu perfil principal é: [ARQUÉTIPO]

Gostaria de agendar minha devolutiva para entender melhor meu resultado.

Meu código: [CÓDIGO]
```

**Opção 3 - Profissional:**
```
Olá! Sou a [Nome Aluna], finalizei o teste DECIFRA usando o código [CÓDIGO].

Gostaria de agendar minha sessão de devolutiva.

Quando teria disponibilidade?
```

---

## 🔒 Considerações de Segurança

### 1. Exposição do Número
- **Risco:** O número da treinadora é exposto no client-side
- **Mitigação:** 
  - O número só é buscado quando necessário (tela de resultado)
  - O número só é visível para a aluna correta (RLS garante isso)
  - Não é armazenado em cache ou localStorage

### 2. Validação de Acesso
- **RLS garante:** A aluna só vê o whatsapp da treinadora vinculada a ela
- **Verificação extra:** A query sempre inclui o `clienteId` para garantir que a aluna só acessa seus próprios dados

### 3. Rate Limiting (Opcional)
```sql
-- Opcional: Limitar chamadas à função RPC
CREATE EXTENSION IF NOT EXISTS pg_rate_limit;
```

---

## 📝 Checklist de Implementação

### Banco de Dados
- [ ] Adicionar coluna `whatsapp` na tabela `treinadoras`
- [ ] Criar índice para a coluna
- [ ] Atualizar políticas RLS se necessário
- [ ] Criar função RPC `get_whatsapp_treinadora` (opcional)

### Typescript
- [ ] Atualizar interface `Database` em `types/database.ts`
- [ ] Atualizar interface `TreinadoraAdmin` em `types/admin.ts`

### Admin Dashboard
- [ ] Atualizar estado de nova treinadora (adicionar whatsapp)
- [ ] Atualizar estado de edição (adicionar whatsapp)
- [ ] Adicionar input de whatsapp no modal de criação
- [ ] Adicionar input de whatsapp no modal de edição
- [ ] Adicionar máscara/validação de telefone
- [ ] Atualizar queries do Supabase

### Tela de Resultado (Cliente)
- [ ] Adicionar estado para dados da treinadora
- [ ] Modificar `carregarResultado` para buscar whatsapp
- [ ] Criar função `handleAbrirWhatsApp`
- [ ] Adicionar botão na UI
- [ ] Adicionar estilos do botão
- [ ] Testar fluxo completo

### Testes
- [ ] Testar cadastro de treinadora com whatsapp
- [ ] Testar edição de whatsapp
- [ ] Testar fluxo cliente completo
- [ ] Verificar se número correto é exibido
- [ ] Verificar se mensagem está correta
- [ ] Testar sem whatsapp cadastrado (não deve mostrar botão)

---

## 🎯 Resumo das Alterações Necessárias

| Arquivo | Alteração | Complexidade |
|---------|-----------|--------------|
| `supabase-schema.sql` | Adicionar coluna `whatsapp` | Baixa |
| `types/database.ts` | Atualizar interface | Baixa |
| `types/admin.ts` | Adicionar campo whatsapp | Baixa |
| `app/(admin)/(dashboard)/treinadoras.tsx` | Inputs de whatsapp | Média |
| `hooks/useTreinadorasAdmin.ts` | Incluir whatsapp na query | Baixa |
| `app/cliente/resultado.tsx` | Botão + query + handler | Média |

---

## ❓ Decisões Pendentes

1. **Formato do número:**
   - Salvar com +55 ou sem?
   - Validar formato brasileiro apenas ou internacional?

2. **Mensagem padrão:**
   - Qual das opções usar?
   - Personalizar com nome da aluna?

3. **Visibilidade do botão:**
   - Esconder se não houver whatsapp cadastrado?
   - Ou mostrar mensagem "Contato indisponível"?

4. **Cadastro de whatsapp:**
   - Obrigatório ou opcional?
   - Validação em tempo real?

---

## 📅 Estimativa de Tempo

- **Banco de Dados:** 30 min
- **Types/Interfaces:** 15 min
- **Admin (cadastro/edição):** 1-2 horas
- **Tela de Resultado:** 1-2 horas
- **Testes:** 30 min

**Total Estimado:** 4-5 horas de trabalho
