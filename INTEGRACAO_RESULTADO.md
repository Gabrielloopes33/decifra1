# Guia de Integração - Nova Interpretação Principal

Este documento mostra como integrar a nova interpretação principal na tela de resultado do cliente.

## Alterações no arquivo `app/cliente/resultado.tsx`

### 1. Adicionar imports

```typescript
// Adicionar no topo do arquivo
import { 
  gerarInterpretacaoPrincipal,
  type InterpretacaoPrincipalCompleta 
} from '@/utils/interpretacaoPrincipal';
import { InterpretacaoPrincipal } from '@/components/InterpretacaoPrincipal';
```

### 2. Adicionar estado

```typescript
// Dentro do componente ClienteResultadoScreen
const [interpretacaoPrincipal, setInterpretacaoPrincipal] = 
  useState<InterpretacaoPrincipalCompleta | null>(null);
```

### 3. Gerar interpretação ao carregar resultado

```typescript
// Na função carregarResultado, após carregar os dados:
if (resultadoData) {
  // Gerar interpretação principal completa
  const interpretacao = gerarInterpretacaoPrincipal(
    resultadoData.scores_fatores,
    resultadoData.scores_facetas || [],
    protocolosFormatados.length > 0 ? protocolosFormatados : 
      resultadoData.scores_facetas ? 
        recomendarProtocolosCliente(resultadoData.scores_facetas).map(r => ({
          id: r.protocolo.codigo,
          titulo: r.protocolo.titulo,
          descricao: r.protocolo.descricao,
          prioridade: r.prioridade
        })) : []
  );
  
  setInterpretacaoPrincipal(interpretacao);
}
```

### 4. Substituir a seção de interpretação antiga

**Código antigo (linhas 258-271):**

```typescript
{interpretacaoDestaque && fatorDestaque && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Quem Você É</Text>
    <Text style={styles.sectionSubtitle}>
      Interpretação principal em {FATORES[fatorDestaque.fator]}
    </Text>

    <View style={styles.interpretacaoCard}>
      <Text style={styles.interpretacaoTitulo}>{interpretacaoDestaque.titulo}</Text>
      <Text style={styles.interpretacaoSubtitulo}>{interpretacaoDestaque.subtitulo}</Text>
      <Text style={styles.interpretacaoDescricao}>{interpretacaoDestaque.descricao}</Text>
    </View>
  </View>
)}
```

**Código novo:**

```typescript
{interpretacaoPrincipal && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Análise do Seu Perfil</Text>
    <Text style={styles.sectionSubtitle}>
      Interpretação completa baseada nos 5 Fatores da Personalidade
    </Text>
    
    <InterpretacaoPrincipal 
      interpretacao={interpretacaoPrincipal}
      onProtocoloPress={(protocolo) => {
        // Navegar para detalhes do protocolo se necessário
        console.log('Protocolo selecionado:', protocolo);
      }}
    />
  </View>
)}
```

## Código Completo da Seção

Aqui está a seção completa pronta para substituição:

```typescript
{/* Interpretação Principal Completa */}
{interpretacaoPrincipal && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Análise do Seu Perfil</Text>
    <Text style={styles.sectionSubtitle}>
      Interpretação completa baseada nos 5 Fatores da Personalidade
    </Text>
    
    <InterpretacaoPrincipal 
      interpretacao={interpretacaoPrincipal}
      onProtocoloPress={(protocolo) => {
        // Opcional: navegar para detalhes do protocolo
        // ou rolar até o protocolo na lista
      }}
    />
  </View>
)}
```

## Estilos Adicionais (se necessário)

Se precisar ajustar estilos, adicione no StyleSheet:

```typescript
interpretacaoContainer: {
  marginTop: 8,
},
```

## Testes com Diferentes Perfis

Para testar, você pode criar dados mockados:

```typescript
// Perfil equilibrado
const perfilEquilibrado = {
  scores_fatores: [
    { fator: 'N', percentil: 45, classificacao: 'Médio', score: 72 },
    { fator: 'E', percentil: 55, classificacao: 'Médio', score: 78 },
    { fator: 'O', percentil: 50, classificacao: 'Médio', score: 75 },
    { fator: 'A', percentil: 48, classificacao: 'Médio', score: 73 },
    { fator: 'C', percentil: 52, classificacao: 'Médio', score: 76 },
  ],
  scores_facetas: []
};

// Perfil com fator dominante
const perfilDominanteN = {
  scores_fatores: [
    { fator: 'N', percentil: 88, classificacao: 'Muito Alto', score: 95 },
    { fator: 'E', percentil: 42, classificacao: 'Médio', score: 65 },
    { fator: 'O', percentil: 65, classificacao: 'Alto', score: 82 },
    { fator: 'A', percentil: 70, classificacao: 'Alto', score: 85 },
    { fator: 'C', percentil: 35, classificacao: 'Baixo', score: 62 },
  ],
  scores_facetas: []
};

// Perfil Visionária Realizadora
const perfilVisionaria = {
  scores_fatores: [
    { fator: 'N', percentil: 35, classificacao: 'Baixo', score: 62 },
    { fator: 'E', percentil: 72, classificacao: 'Alto', score: 88 },
    { fator: 'O', percentil: 85, classificacao: 'Muito Alto', score: 92 },
    { fator: 'A', percentil: 55, classificacao: 'Médio', score: 78 },
    { fator: 'C', percentil: 82, classificacao: 'Muito Alto', score: 90 },
  ],
  scores_facetas: []
};
```

## Benefícios da Nova Interpretação

1. **Mais Completa**: Vai além de um único fator
2. **Empoderadora**: Linguagem positiva focada em potencial
3. **Acionável**: Conecta com protocolos específicos
4. **Personalizada**: Detecta combinações únicas
5. **Visualmente Rica**: Cards bem estruturados com cores e ícones

## Próximos Passos

1. Testar a integração com dados reais
2. Ajustar textos conforme feedback de usuários
3. Adicionar mais combinações se necessário
4. Considerar adicionar visualizações gráficas das combinações
