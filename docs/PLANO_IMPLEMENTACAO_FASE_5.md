# 📋 Plano Técnico de Implementação - Fase 5

> **Projeto:** DECIFRA Mobile  
> **Data:** 11/03/2026  
> **Foco:** Sistema de Códigos + Integração Hotmart  
> **Baseado em:** Skills AIOX (Expo, React Native, UI/UX Pro Max)

---

## 🎯 VISÃO GERAL

Esta fase implementa o sistema completo de códigos DECIFRA, desde a compra na Hotmart até a distribuição para clientes, seguindo a arquitetura:

```
Hotmart (Compra) → Gera Códigos → Email Treinadora → App (Distribuição)
```

---

## 📦 ETAPA 1: SCHEMA DO BANCO DE DADOS

### 1.1 Ajustes na Tabela `codigos`

```sql
-- Alterar formato do código de ART-XXXX para DECF-XXXX-XXXX
ALTER TABLE codigos ALTER COLUMN codigo TYPE VARCHAR(20);

-- Adicionar campos de rastreabilidade
ALTER TABLE codigos ADD COLUMN IF NOT EXISTS usado_em TIMESTAMPTZ;
ALTER TABLE codigos ADD COLUMN IF NOT EXISTS teste_iniciado_em TIMESTAMPTZ;
ALTER TABLE codigos ADD COLUMN IF NOT EXISTS teste_completado_em TIMESTAMPTZ;
ALTER TABLE codigos ADD COLUMN IF NOT EXISTS compra_id UUID;
ALTER TABLE codigos ADD COLUMN IF NOT EXISTS hotmart_transaction_id VARCHAR(100);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_codigos_treinadora_usado 
  ON codigos(treinadora_id, usado) WHERE usado = false;
CREATE INDEX IF NOT EXISTS idx_codigos_compra ON codigos(compra_id);
CREATE INDEX IF NOT EXISTS idx_codigos_hotmart ON codigos(hotmart_transaction_id);
```

### 1.2 Nova Tabela: `compras`

```sql
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id),
  
  -- Dados Hotmart
  hotmart_transaction_id VARCHAR(100) UNIQUE NOT NULL,
  hotmart_product_id BIGINT NOT NULL,
  hotmart_product_name VARCHAR(255),
  
  -- Detalhes
  quantidade_codigos INTEGER NOT NULL,
  valor_total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('concluida', 'cancelada')),
  
  -- Email
  email_enviado BOOLEAN DEFAULT false,
  email_enviado_em TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compras_treinadora ON compras(treinadora_id);
CREATE INDEX idx_compras_hotmart ON compras(hotmart_transaction_id);
```

### 1.3 Nova Tabela: `produtos_hotmart`

```sql
CREATE TABLE produtos_hotmart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotmart_product_id BIGINT UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade_codigos INTEGER NOT NULL,
  validade_dias INTEGER DEFAULT 30,
  preco DECIMAL(10,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial (ajustar IDs quando cliente fornecer)
INSERT INTO produtos_hotmart (hotmart_product_id, nome, quantidade_codigos, preco) VALUES
  (12345, 'DECIFRA - Pacote 10 Avaliações', 10, 97.00),
  (12346, 'DECIFRA - Pacote 25 Avaliações', 25, 197.00),
  (12347, 'DECIFRA - Pacote 50 Avaliações', 50, 397.00);
```

---

## 🔌 ETAPA 2: EDGE FUNCTION HOTMART WEBHOOK

### 2.1 Estrutura do Endpoint

**Arquivo:** `supabase/functions/hotmart-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HotmartPayload {
  event: 'PURCHASE_APPROVED' | 'PURCHASE_CANCELED';
  data: {
    buyer: { email: string; name: string; document?: string };
    product: { id: number; name: string };
    purchase: { transaction: string; price: { value: number } };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: HotmartPayload = await req.json();
    
    // Validação de segurança (HMAC)
    const signature = req.headers.get('X-Hotmart-Hmac-SHA256');
    if (!verifyHMAC(payload, signature)) {
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Só processa compras aprovadas
    if (payload.event !== 'PURCHASE_APPROVED') {
      return new Response(JSON.stringify({ ignored: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Idempotência: verifica se já processou
    const { data: existente } = await supabase
      .from('compras')
      .select('id')
      .eq('hotmart_transaction_id', payload.data.purchase.transaction)
      .single();

    if (existente) {
      return new Response(JSON.stringify({ success: true, message: 'Already processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Busca config do produto
    const { data: produto } = await supabase
      .from('produtos_hotmart')
      .select('*')
      .eq('hotmart_product_id', payload.data.product.id)
      .eq('ativo', true)
      .single();

    if (!produto) {
      return new Response(JSON.stringify({ error: 'Product not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Busca ou cria treinadora
    const treinadora = await getOrCreateTreinadora(supabase, payload.data.buyer);

    // Cria registro da compra
    const { data: compra } = await supabase
      .from('compras')
      .insert({
        treinadora_id: treinadora.id,
        hotmart_transaction_id: payload.data.purchase.transaction,
        hotmart_product_id: payload.data.product.id,
        hotmart_product_name: payload.data.product.name,
        quantidade_codigos: produto.quantidade_codigos,
        valor_total: payload.data.purchase.price.value,
      })
      .select()
      .single();

    // GERA OS CÓDIGOS
    const codigosGerados = [];
    for (let i = 0; i < produto.quantidade_codigos; i++) {
      const codigo = generateUniqueCode(); // DECF-XXXX-XXXX
      
      await supabase.from('codigos').insert({
        codigo,
        compra_id: compra.id,
        treinadora_id: treinadora.id,
        valido_ate: new Date(Date.now() + produto.validade_dias * 24 * 60 * 60 * 1000),
        hotmart_transaction_id: payload.data.purchase.transaction,
      });
      
      codigosGerados.push(codigo);
    }

    // Envia email (async)
    await sendEmailWithCodes(treinadora.email, treinadora.nome, codigosGerados, produto.validade_dias);

    // Marca email como enviado
    await supabase
      .from('compras')
      .update({ email_enviado: true, email_enviado_em: new Date().toISOString() })
      .eq('id', compra.id);

    return new Response(JSON.stringify({ 
      success: true, 
      compra_id: compra.id,
      codigos_gerados: codigosGerados.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Gera código único: DECF-XXXX-XXXX
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Remove I, O, 0, 1 (evita confusão)
  let code = 'DECF-';
  
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

// Busca ou cria treinadora
async function getOrCreateTreinadora(supabase: any, buyer: any) {
  const { data: existente } = await supabase
    .from('treinadoras')
    .select('*')
    .eq('email', buyer.email)
    .single();

  if (existente) return existente;

  // Cria nova conta
  const { data: authUser } = await supabase.auth.admin.createUser({
    email: buyer.email,
    email_confirm: true,
  });

  const { data: novaTreinadora } = await supabase
    .from('treinadoras')
    .insert({
      email: buyer.email,
      nome: buyer.name,
      auth_user_id: authUser.user.id,
    })
    .select()
    .single();

  return novaTreinadora;
}

// Verificação HMAC (placeholder)
function verifyHMAC(payload: any, signature: string | null): boolean {
  // TODO: Implementar verificação com HOTMART_WEBHOOK_SECRET
  return true; // Em desenvolvimento, aceita tudo
}
```

### 2.2 Variáveis de Ambiente

```bash
# Configurar no Supabase Dashboard
SUPABASE_URL=https://wqbppfngjolnxbwqngfo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
HOTMART_WEBHOOK_SECRET=<quando_cliente_forneceer>
```

---

## 📧 ETAPA 3: SISTEMA DE EMAIL (RESEND)

### 3.1 Edge Function de Email

**Arquivo:** `supabase/functions/send-email/index.ts`

```typescript
import { Resend } from 'https://esm.sh/resend@1.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      color: #2D1518;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #FAF8F3;
    }
    .header { 
      background: linear-gradient(135deg, #C45A3D 0%, #6B2D3A 100%); 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      color: white; 
      margin: 0;
      font-size: 32px;
      letter-spacing: 2px;
    }
    .content { 
      padding: 40px 30px; 
    }
    .codes-box {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border: 2px solid #C45A3D;
    }
    .code-item {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      font-weight: bold;
      color: #C45A3D;
      padding: 12px;
      margin: 8px 0;
      background: #F5F0E6;
      border-radius: 8px;
      text-align: center;
      letter-spacing: 2px;
    }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: #C45A3D;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DECIFRA</h1>
    </div>
    <div class="content">
      <h2>Olá, {{nome}}!</h2>
      <p>✅ Seu pagamento foi confirmado!</p>
      <p>Você comprou <strong>{{quantidade}} códigos</strong> de acesso para o DECIFRA.</p>
      
      <div class="codes-box">
        <h3 style="margin-top: 0; color: #6B2D3A;">🎟️ Seus Códigos:</h3>
        {{codigos}}
      </div>
      
      <p><strong>Como usar:</strong></p>
      <ol>
        <li>Envie um código para cada cliente</li>
        <li>A cliente baixa o app DECIFRA</li>
        <li>Ela digita o código no início do teste</li>
      </ol>
      
      <p style="color: #C45A3D; font-weight: 600;">
        ⚠️ Validade: {{validade}} dias
      </p>
      
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Acessar Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>DECIFRA by Ártio © 2026</p>
      <p>Dúvidas? Responda a este email.</p>
    </div>
  </div>
</body>
</html>
`;

async function sendEmailWithCodes(
  to: string, 
  nome: string, 
  codigos: string[], 
  validadeDias: number
) {
  const codigosHtml = codigos.map(c => `<div class="code-item">${c}</div>`).join('');
  
  const html = emailTemplate
    .replace('{{nome}}', nome)
    .replace('{{quantidade}}', String(codigos.length))
    .replace('{{codigos}}', codigosHtml)
    .replace('{{validade}}', String(validadeDias))
    .replace('{{dashboardUrl}}', 'https://decifra.app/treinadora');

  await resend.emails.send({
    from: 'DECIFRA <contato@artio.com.br>',
    to,
    subject: `DECIFRA - ${codigos.length} códigos de acesso`,
    html,
  });
}
```

---

## 📱 ETAPA 4: TELA "MEUS CÓDIGOS" (Treinadora)

### 4.1 Hook de Dados

**Arquivo:** `hooks/useMeusCodigos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface CodigoDisponivel {
  id: string;
  codigo: string;
  validoAte: string;
  diasRestantes: number;
}

export const useMeusCodigos = (treinadoraId?: string) => {
  return useQuery({
    queryKey: ['meus-codigos', treinadoraId],
    queryFn: async (): Promise<{ disponiveis: CodigoDisponivel[]; total: number }> => {
      if (!treinadoraId) return { disponiveis: [], total: 0 };

      const { data, error } = await supabase
        .from('codigos')
        .select('id, codigo, valido_ate')
        .eq('treinadora_id', treinadoraId)
        .eq('usado', false)
        .gt('valido_ate', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const disponiveis = data?.map(c => ({
        id: c.id,
        codigo: c.codigo,
        validoAte: c.valido_ate,
        diasRestantes: Math.ceil(
          (new Date(c.valido_ate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })) || [];

      return { disponiveis, total: disponiveis.length };
    },
    enabled: !!treinadoraId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

### 4.2 Componente da Tela

**Arquivo:** `app/treinadora/codigos.tsx`

```typescript
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useMeusCodigos } from '@/hooks/useMeusCodigos';
import { useAuth } from '@/lib/supabase/useAuth';
import { COLORS_ARTIO, GRADIENTS } from '@/constants/colors-artio';

export default function MeusCodigosScreen() {
  const { treinadora } = useAuth();
  const { data, isLoading, refetch } = useMeusCodigos(treinadora?.id);
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarCodigo = async (codigo: string) => {
    await Clipboard.setStringAsync(codigo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const copiarTodos = async () => {
    if (!data?.disponiveis.length) return;
    const todos = data.disponiveis.map(c => c.codigo).join('\n');
    await Clipboard.setStringAsync(todos);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copiado!', `${data.disponiveis.length} códigos copiados`);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loading}>Carregando...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meus Códigos</Text>
          <Text style={styles.subtitle}>
            Você tem {data?.total || 0} código{data?.total !== 1 ? 's' : ''} disponível
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Lista de Códigos */}
          {data?.disponiveis.map((item) => (
            <View key={item.id} style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <Text style={styles.codeText}>{item.codigo}</Text>
                {copiado === item.codigo && (
                  <Text style={styles.copiedBadge}>✓ Copiado</Text>
                )}
              </View>
              
              <View style={styles.codeInfo}>
                <Text style={[
                  styles.validade,
                  item.diasRestantes <= 7 && styles.validadeUrgente
                ]}>
                  {item.diasRestantes <= 0 
                    ? 'Vence hoje' 
                    : item.diasRestantes === 1 
                      ? 'Vence amanhã' 
                      : `Vence em ${item.diasRestantes} dias`
                  }
                </Text>
              </View>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copiarCodigo(item.codigo)}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>
                  {copiado === item.codigo ? 'Copiado!' : 'Copiar Código'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Empty State */}
          {data?.disponiveis.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎟️</Text>
              <Text style={styles.emptyTitle}>Nenhum código disponível</Text>
              <Text style={styles.emptyText}>
                Compre mais códigos na Hotmart para continuar.
              </Text>
            </View>
          )}

          {/* Botão Copiar Todos */}
          {data && data.disponiveis.length > 1 && (
            <TouchableOpacity
              style={styles.copyAllButton}
              onPress={copiarTodos}
              activeOpacity={0.8}
            >
              <Text style={styles.copyAllText}>
                Copiar Todos ({data.total})
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Envie um código para cada cliente.{'\n'}
              Cada código só pode ser usado uma vez.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loading: { color: COLORS_ARTIO.cream, textAlign: 'center', marginTop: 40 },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS_ARTIO.creamLight,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS_ARTIO.cream,
    opacity: 0.9,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  codeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 90, 61, 0.3)',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS_ARTIO.creamLight,
    letterSpacing: 2,
  },
  copiedBadge: {
    color: COLORS_ARTIO.success,
    fontSize: 14,
    fontWeight: '600',
  },
  codeInfo: {
    marginBottom: 16,
  },
  validade: {
    fontSize: 14,
    color: COLORS_ARTIO.cream,
    opacity: 0.8,
  },
  validadeUrgente: {
    color: COLORS_ARTIO.terracotaLight,
    fontWeight: '600',
  },
  
  copyButton: {
    backgroundColor: COLORS_ARTIO.terracota,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyButtonText: {
    color: COLORS_ARTIO.creamLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  copyAllButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS_ARTIO.terracota,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  copyAllText: {
    color: COLORS_ARTIO.terracotaLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS_ARTIO.creamLight,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS_ARTIO.cream,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS_ARTIO.cream,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

---

## 📝 ETAPA 5: AJUSTE TELA RESULTADO (Cliente)

**Arquivo:** `app/cliente/resultado.tsx` (adicionar seção)

```typescript
// Adicionar na query de carregamento do resultado:
const { data: codigoInfo } = await supabase
  .from('codigos')
  .select('codigo, usado_em, teste_completado_em')
  .eq('cliente_id', clienteId)
  .single();

// Adicionar no render, antes da mandala:
{codigoInfo && (
  <View style={styles.codigoInfoCard}>
    <Text style={styles.codigoLabel}>Código utilizado</Text>
    <Text style={styles.codigoValue}>{codigoInfo.codigo}</Text>
    <Text style={styles.dataTeste}>
      Teste realizado em {new Date(codigoInfo.teste_completado_em).toLocaleDateString('pt-BR')}
    </Text>
  </View>
)}
```

---

## 📊 ETAPA 6: REAL-TIME UPDATES (Opcional)

```typescript
// hooks/useMeusCodigosRealtime.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export const useMeusCodigosRealtime = (treinadoraId: string, refetch: () => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`codigos-treinadora-${treinadoraId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'codigos',
          filter: `treinadora_id=eq.${treinadoraId}`,
        },
        (payload) => {
          // Código foi usado! Atualiza a lista
          if (payload.new.usado && !payload.old.usado) {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [treinadoraId, refetch]);
};
```

---

## 🛠️ DEPENDÊNCIAS A INSTALAR

```bash
# Expo Clipboard (para copiar códigos)
npx expo install expo-clipboard

# React Query (já deve estar instalado, senão:)
npm install @tanstack/react-query
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

```
□ ETAPA 1: Schema do Banco
  □ Executar migrations SQL
  □ Verificar índices criados
  □ Inserir produtos_hotmart (quando tiver IDs reais)

□ ETAPA 2: Hotmart Webhook
  □ Criar Edge Function
  □ Configurar variáveis de ambiente
  □ Testar com payload mock
  □ (Aguardar) Configurar webhook na Hotmart

□ ETAPA 3: Email
  □ Criar conta Resend
  □ Verificar domínio artio.com.br
  □ Criar Edge Function send-email
  □ Testar envio

□ ETAPA 4: Tela Meus Códigos
  □ Criar hook useMeusCodigos
  □ Criar tela app/treinadora/codigos.tsx
  □ Adicionar navegação no menu
  □ Testar cópia de códigos

□ ETAPA 5: Ajuste Resultado
  □ Modificar query para buscar código usado
  □ Adicionar seção na UI

□ ETAPA 6: Testes Finais
  □ Fluxo completo: Compra → Email → Código no app → Uso
  □ Verificar rastreabilidade (data uso, conclusão)
```

---

## 📋 INFORMAÇÕES NECESSÁRIAS DO CLIENTE

| Item | Descrição | Status |
|------|-----------|--------|
| **Product IDs Hotmart** | IDs dos produtos na Hotmart | ⏳ Pendente |
| **Webhook Secret** | HMAC Secret para validação | ⏳ Pendente |
| **Conta Resend** | API Key para emails | ⏳ Pendente |
| **Domínio email** | contato@artio.com.br verificado | ⏳ Pendente |

---

## 🎯 PRÓXIMA ETAPA

Após esta implementação, o sistema estará:
- ✅ Integrado com Hotmart (webhook)
- ✅ Gerando códigos automaticamente
- ✅ Enviando emails com códigos
- ✅ Mostrando códigos disponíveis no app
- ✅ Rastreando uso dos códigos

**O que sobra para o futuro:**
- Painel Admin Web (cadastro/listagem)
- Notificações Push (requer Apple Dev)
- Exportação PDF (pode ser local)

---

*Documento criado seguindo skills: expo-app-design, react-native-best-practices, ui-ux-pro-max*
