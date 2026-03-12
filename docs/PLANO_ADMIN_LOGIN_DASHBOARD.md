# Plano de Implementação — Admin Panel Decifra
**Data:** 2026-03-12
**Escopo:** Login + Dashboard Admin (5 melhorias)

---

## Diagnóstico Técnico

| # | Problema | Causa Raiz |
|---|----------|-----------|
| 1 | Enter não loga | Campo senha sem `onSubmitEditing` nem `returnKeyType` |
| 2 | Gráfico vazio | `height: '${height}%'` não funciona em RN — requer valor numérico |
| 3 | `useCodigosAdmin` bugado | Sintaxe `treinadoras:nome` no select está errada (PostgREST usa `treinadoras(nome)`) |
| 4 | Quick Actions sem rota | `QuickActionButton` sem `onPress` |
| 5 | Sidebar sem logo | Usa badge de texto "A", não a imagem real |

---

## Tarefas

### TAREFA 1 — Login: Enter + Spinner
**Arquivo:** `app/(admin)/login.tsx`

**O que fazer:**
- Adicionar `ref` no campo de email para focar o de senha com `returnKeyType="next"`
- Adicionar `returnKeyType="done"` + `onSubmitEditing={handleLogin}` no campo de senha
- O spinner já existe (`ActivityIndicator`) — garantir que `loading` state sobe antes do await

**Critério de aceite:**
- [ ] Pressionar Enter/Return no campo de senha aciona o login
- [ ] Botão exibe spinner animado enquanto `loading === true`
- [ ] Formulário fica desabilitado durante o loading

---

### TAREFA 2 — Sidebar: Logo do app
**Arquivo:** `app/(admin)/(dashboard)/_layout.tsx`

**O que fazer:**
- Importar `Image` do React Native
- Substituir o `logoBadge` (View com "A") por `<Image source={require('@/assets/images/icon.png')} style={styles.logoImage} />`
- Ajustar estilo: `width: 40, height: 40, borderRadius: 10`

**Asset disponível:** `assets/images/icon.png`

**Critério de aceite:**
- [ ] Logo do app aparece no topo da sidebar
- [ ] Logo tem bordas arredondadas e tamanho consistente com o layout atual

---

### TAREFA 3 — Fix hooks: Dados reais em Treinadoras e Códigos
**Arquivos:** `hooks/useCodigosAdmin.ts`, `hooks/useTreinadorasAdmin.ts`

**O que fazer:**

*useCodigosAdmin* — Bug na query select:
```ts
// ERRADO:
treinadoras:nome,

// CORRETO (join PostgREST):
treinadoras(nome),
```
Remover as N+1 queries de treinadora por código — usar o join direto no select principal.
Para clientes, manter a query separada (código usa, cliente pode não existir).

*useTreinadorasAdmin* — Verificar se a query chega ao Supabase:
- Checar se `supabase` client usa a session autenticada
- Se RLS exige auth, o client anon retorna `[]` silenciosamente

**Possível causa RLS:** O client usa `anon key` — se as tabelas têm RLS exigindo auth, as queries retornam `[]` silenciosamente. Verificar política ou garantir que o access token está sendo passado.

**Critério de aceite:**
- [ ] Tela `/treinadoras` lista treinadoras reais do banco
- [ ] Tela `/codigos` lista códigos reais com nome da treinadora
- [ ] Erros de query aparecem no console (não silenciosos)

---

### TAREFA 4 — Gráfico funcional com dados reais
**Arquivo:** `app/(admin)/(dashboard)/index.tsx`

**O que fazer:**

Substituir o gráfico de barras com `height: '%'` (broken in RN) por gráfico com valores absolutos usando `useDashboardStats`:

```
totalCodigos        → total gerados
totalCodigosUsados  → utilizados
codigosDisponiveis  → disponíveis
```

**Opção A (sem nova lib):** Barras horizontais com `width` proporcional ao total usando `flex`.
Ex: `(valor / totalCodigos) * containerWidth`

**Opção B (com lib):** Verificar se `victory-native` ou `react-native-chart-kit` está no `package.json`. Se não, usar Opção A.

**Critério de aceite:**
- [ ] Gráfico exibe dados reais (não hardcoded)
- [ ] Legenda mostra valores numéricos (ex: "45 utilizados / 100 gerados")
- [ ] Gráfico renderiza corretamente (sem altura zerada)

---

### TAREFA 5 — Quick Actions: Criar rotas
**Arquivos:** `app/(admin)/(dashboard)/index.tsx` + novos arquivos de rota

**4 botões identificados:**
```
add-treinadora → "Nova Treinadora"  → /(admin)/(dashboard)/treinadoras
add-codigo     → "Gerar Códigos"    → /(admin)/(dashboard)/codigos
relatorio      → "Relatórios"       → /(admin)/(dashboard)/relatorios  (criar)
config         → "Configurações"    → /(admin)/(dashboard)/configuracoes  (criar)
```

**O que fazer:**
1. Adicionar `onPress` no `QuickActionButton` component
2. `add-treinadora` → navegar para `/treinadoras`
3. `add-codigo` → navegar para `/codigos`
4. `relatorio` → criar `app/(admin)/(dashboard)/relatorios.tsx` (placeholder)
5. `config` → criar `app/(admin)/(dashboard)/configuracoes.tsx` (placeholder)
6. Registrar novas rotas no `_layout.tsx`

**Critério de aceite:**
- [ ] Cada botão navega para sua rota ao ser clicado
- [ ] Rotas `relatorios` e `configuracoes` existem (pode ser placeholder)
- [ ] Nenhum crash de rota não encontrada

---

## Sequência de Execução

```
T1 Login (30min) → T2 Logo (15min) → T3 Fix Hooks (1h) → T4 Gráfico (45min) → T5 Rotas (30min)
```

**Total estimado:** ~3h de implementação

---

## Riscos e Mitigação

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| RLS bloqueando queries admin | Alta | Testar manualmente no Supabase Studio com usuário autenticado |
| Lib de gráfico ausente | Média | Implementar gráfico customizado com View/flex |
| Rotas de relatório/config esperadas por outros fluxos | Baixa | Criar como placeholders funcionais |
