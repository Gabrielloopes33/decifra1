# 📱 Guia de Integração - App DECIFRA

Este guia mostra como integrar o serviço PDF ao app DECIFRA (React Native / Expo).

## Configuração Inicial

### 1. Adicionar constante de API

```typescript
// constants/api.ts
export const PDF_SERVICE_URL = __DEV__ 
  ? 'http://localhost:3000'  // Desenvolvimento
  : 'https://pdf.decifra.app';  // Produção
```

### 2. Criar serviço PDF

```typescript
// services/pdfService.ts
import { PDF_SERVICE_URL } from '@/constants/api';
import { supabase } from '@/lib/supabase';

interface GerarPDFParams {
  resultadoId: string;
  tipo: 'cliente' | 'treinadora';
}

interface GerarPDFResponse {
  success: boolean;
  data?: {
    pdf?: string;        // base64
    url?: string;        // URL do storage
    filename: string;
    tamanho: number;
    tipo: 'cliente' | 'treinadora';
  };
  error?: {
    code: string;
    message: string;
  };
}

export class PDFService {
  /**
   * Gera um PDF do relatório
   */
  static async gerarPDF(params: GerarPDFParams): Promise<GerarPDFResponse> {
    try {
      // Obter sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${PDF_SERVICE_URL}/api/pdf/gerar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resultadoId: params.resultadoId,
          tipo: params.tipo,
          token: session.access_token,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao gerar PDF');
      }

      return data;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return {
        success: false,
        error: {
          code: 'CLIENT_ERROR',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      };
    }
  }
}
```

### 3. Hook para gerenciamento de PDF

```typescript
// hooks/usePDF.ts
import { useState, useCallback } from 'react';
import { PDFService } from '@/services/pdfService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface UsePDFOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function usePDF(options: UsePDFOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateAndShare = useCallback(async (
    resultadoId: string,
    tipo: 'cliente' | 'treinadora'
  ) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      setProgress(20);
      
      const response = await PDFService.gerarPDF({
        resultadoId,
        tipo,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao gerar PDF');
      }

      setProgress(60);

      const { url, pdf, filename } = response.data;

      if (url) {
        // Opção 1: URL pública
        setProgress(100);
        options.onSuccess?.(url);
        
        // Abrir/compartilhar URL
        await Sharing.shareAsync(url, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Relatório',
        });
        
      } else if (pdf) {
        // Opção 2: Base64 - salvar localmente
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(fileUri, pdf, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setProgress(100);
        options.onSuccess?.(fileUri);

        // Compartilhar arquivo
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartilhar Relatório',
          });
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      options.onError?.(message);
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  return {
    generateAndShare,
    isGenerating,
    progress,
  };
}
```

### 4. Componente de Botão PDF

```typescript
// components/GerarPDFButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { usePDF } from '@/hooks/usePDF';

interface GerarPDFButtonProps {
  resultadoId: string;
  tipo: 'cliente' | 'treinadora';
  label?: string;
}

export function GerarPDFButton({
  resultadoId,
  tipo,
  label = 'Gerar PDF',
}: GerarPDFButtonProps) {
  const { generateAndShare, isGenerating } = usePDF({
    onSuccess: (url) => {
      console.log('PDF gerado:', url);
    },
    onError: (error) => {
      console.error('Erro:', error);
      alert('Erro ao gerar PDF: ' + error);
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, isGenerating && styles.buttonDisabled]}
      onPress={() => generateAndShare(resultadoId, tipo)}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator color="#2D1518" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#C4785A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#2D1518',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Uso nas Telas

### Tela de Resultado (Cliente)

```typescript
// app/(app)/resultado/[id].tsx
import { GerarPDFButton } from '@/components/GerarPDFButton';

export default function ResultadoScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* ... conteúdo do resultado ... */}
      
      <GerarPDFButton
        resultadoId={id as string}
        tipo="cliente"
        label="Baixar Meu Relatório"
      />
    </View>
  );
}
```

### Tela de Resultado (Treinadora)

```typescript
// app/(app)/treinadora/cliente/[id]/resultado.tsx
import { GerarPDFButton } from '@/components/GerarPDFButton';

export default function ResultadoTreinadoraScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* ... conteúdo do resultado ... */}
      
      <View style={styles.pdfButtons}>
        <GerarPDFButton
          resultadoId={id as string}
          tipo="cliente"
          label="PDF para Cliente"
        />
        
        <GerarPDFButton
          resultadoId={id as string}
          tipo="treinadora"
          label="PDF Profissional"
        />
      </View>
    </View>
  );
}
```

## Tratamento de Erros

### Códigos de Erro Comuns

| Código | Significado | Ação Recomendada |
|--------|-------------|------------------|
| `UNAUTHORIZED` | Token inválido | Redirecionar para login |
| `RESULTADO_NOT_FOUND` | Resultado não existe | Verificar ID |
| `FORBIDDEN` | Sem permissão | Mostrar mensagem apropriada |
| `RATE_LIMIT_EXCEEDED` | Muitas requisições | Aguardar 1 minuto |
| `INTERNAL_ERROR` | Erro no servidor | Tentar novamente |

### Exemplo de tratamento

```typescript
function handlePDFError(code: string): string {
  const messages: Record<string, string> = {
    UNAUTHORIZED: 'Sua sessão expirou. Por favor, faça login novamente.',
    RESULTADO_NOT_FOUND: 'Relatório não encontrado.',
    FORBIDDEN: 'Você não tem permissão para acessar este relatório.',
    RATE_LIMIT_EXCEEDED: 'Muitas tentativas. Aguarde um momento.',
    INTERNAL_ERROR: 'Erro ao gerar PDF. Tente novamente.',
  };
  
  return messages[code] || 'Erro desconhecido';
}
```

## Testes

### Teste manual

```bash
# 1. Iniciar serviço local
cd pdf-service
npm run dev

# 2. Testar com curl
curl -X POST http://localhost:3000/api/pdf/gerar \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resultadoId": "uuid-aqui",
    "tipo": "cliente",
    "token": "seu-token"
  }'
```

### Teste no app

```typescript
// Teste simples
async function testPDFService() {
  const result = await PDFService.gerarPDF({
    resultadoId: 'test-uuid',
    tipo: 'cliente',
  });
  
  console.log('Resultado:', result);
}
```

## Considerações de Performance

1. **Cache de PDFs**: O serviço gera PDFs dinamicamente. Considere cache no app.
2. **Tamanho**: PDFs típicos têm 100-300KB
3. **Tempo**: Geração leva 2-5 segundos
4. **Background**: Use `expo-background-fetch` para geração em background

## Segurança

1. ✅ Nunca armazene o `service_role` key no app
2. ✅ Sempre use o token JWT do usuário autenticado
3. ✅ Verifique permissões no backend
4. ✅ Use HTTPS em produção
5. ✅ Implemente rate limiting no cliente também
