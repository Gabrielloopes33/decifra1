# IPIP-NEO-120 - Avaliação de Personalidade Big Five

  Aplicativo mobile completo para aplicação do teste de personalidade IPIP-NEO-120 com sistema de créditos, códigos de acesso, e recomendação inteligente de protocolos comportamentais.

  ## 🎯 Visão Geral

  Este aplicativo permite que **treinadoras** gerem códigos de acesso para **clientes** realizarem o teste de personalidade Big Five (IPIP-NEO-120). Após a conclusão do teste, o sistema calcula automaticamente:

  - **30 facetas** de personalidade
  - **5 fatores** do Big Five (N, E, O, A, C)
  - **Percentis** comparativos (5-95%)
  - **Classificações** (Muito Baixo, Baixo, Médio, Alto, Muito Alto)
  - **Protocolos comportamentais** personalizados

  ## 📱 Funcionalidades MVP

  ### Para Treinadoras:
  1. ✅ Cadastro e login com Supabase Auth
  2. ✅ Dashboard com saldo de créditos
  3. ✅ Geração de códigos ART-XXXX (únicos, válidos por 30 dias)
  4. ✅ Lista de clientes com status (ativo/em andamento/completo)
  5. ✅ Visualização de resultados completos dos clientes

  ### Para Clientes:
  1. ✅ Acesso via código de 30 dias
  2. ✅ Cadastro rápido (nome + email opcional)
  3. ✅ Teste IPIP-NEO-120 em 4 estações temáticas (120 questões)
  4. ✅ Persistência local com AsyncStorage
  5. ✅ Resultado visual com mandala (gráfico radar)
  6. ✅ 4 protocolos comportamentais recomendados

  ### Sistema:
  1. ✅ Algoritmo de cálculo de scores e percentis
  2. ✅ Sistema de recomendação de protocolos
  3. ✅ Supabase Database com 7 tabelas + Row Level Security
  4. ✅ 120 questões do IPIP-NEO-120 em português

  ---

  ## 🚀 Setup - Configuração Inicial

  ### 1. Instalar Dependências

  ```bash
  npm install
  ```

  ### 2. Configurar Supabase

  #### 2.1. Criar projeto no Supabase
  1. Acesse [supabase.com](https://supabase.com)
  2. Crie uma nova organização (se necessário)
  3. Crie um novo projeto
  4. Aguarde ~2 minutos para o projeto ser criado

  #### 2.2. Executar o Schema SQL
  1. No dashboard do Supabase, vá em **SQL Editor**
  2. Clique em **New Query**
  3. Abra o arquivo `supabase-schema.sql` deste projeto
  4. Copie **todo o conteúdo** do arquivo
  5. Cole no editor SQL do Supabase
  6. Clique em **Run** (ou pressione Ctrl+Enter)
  7. Aguarde até ver a mensagem "Success. No rows returned"

  Isso criará:
  - 7 tabelas: `treinadoras`, `codigos`, `clientes`, `respostas`, `resultados`, `protocolos`, `protocolos_recomendados`
  - Políticas de Row Level Security (RLS)
  - Função `gerar_codigo_unico()`
  - 4 protocolos de exemplo (seed inicial)

  #### 2.3. Obter Credenciais
  1. No dashboard do Supabase, vá em **Project Settings** → **API**
  2. Copie as seguintes informações:
     - **Project URL** (formato: `https://xxxxx.supabase.co`)
     - **anon/public key** (começa com `eyJ...`)

  #### 2.4. Configurar Variáveis de Ambiente
  Crie um arquivo `.env` na raiz do projeto:

  ```bash
  # Copie o arquivo de exemplo
  cp .env.example .env
  ```

  Edite o arquivo `.env` e adicione suas credenciais:

  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
  ```

  ⚠️ **IMPORTANTE**: Nunca compartilhe suas credenciais ou faça commit do arquivo `.env`!

  ---

  ## 🏃 Executar o Aplicativo

  ### No Expo Go (Recomendado para desenvolvimento)

  ```bash
  npm start
  ```

  Depois:
  1. Escaneie o QR code com o app **Expo Go** (iOS/Android)
  2. Ou pressione:
     - `a` para abrir no Android
     - `i` para abrir no iOS Simulator
     - `w` para abrir no navegador

  ### Build para Produção

  ```bash
  # Android (APK)
  npm run build:android

  # iOS (requer Mac)
  npm run build:ios
  ```

  ---

  ## 📊 Estrutura do Projeto

  ```
  ├── app/                          # Telas do aplicativo (Expo Router)
  │   ├── index.tsx                # Tela inicial (escolher: Treinadora ou Cliente)
  │   ├── treinadora/
  │   │   ├── login.tsx           # Login da treinadora
  │   │   ├── cadastro.tsx        # Cadastro da treinadora
  │   │   └── index.tsx           # Dashboard (créditos, códigos, clientes)
  │   └── cliente/
  │       ├── codigo.tsx          # Validar código de acesso
  │       ├── cadastro.tsx        # Cadastro rápido do cliente
  │       ├── instrucoes.tsx      # Instruções do teste
  │       ├── teste.tsx           # Teste em 4 estações (120 questões)
  │       ├── processando.tsx     # Cálculo dos resultados
  │       └── resultado.tsx       # Visualização: mandala + protocolos
  │
  ├── components/
  │   └── ui/
  │       └── Mandala.tsx         # Gráfico radar SVG (5 fatores)
  │
  ├── constants/
  │   ├── ipip.ts                 # Fatores, facetas, mapeamentos
  │   └── questoes.ts             # 120 questões do IPIP-NEO-120
  │
  ├── lib/
  │   ├── query-client.ts         # React Query
  │   └── supabase/
  │       ├── client.ts           # Cliente Supabase
  │       └── useAuth.ts          # Hook de autenticação
  │
  ├── types/
  │   └── database.ts             # TypeScript types do Supabase
  │
  ├── utils/
  │   ├── calculadora.ts          # Algoritmo: 30 facetas + 5 fatores + percentis
  │   └── recomendacao.ts         # Sistema de recomendação de protocolos
  │
  ├── supabase-schema.sql         # Schema completo do banco de dados
  ├── .env.example                # Exemplo de configuração
  └── README.md                   # Este arquivo
  ```

  ---

  ## 🧪 Testar o Aplicativo

  ### 1. Criar Conta de Treinadora
  1. Abra o app
  2. Clique em "Sou Treinadora"
  3. Clique em "Cadastre-se"
  4. Preencha: nome, email, senha
  5. Você ganhará **5 créditos de boas-vindas**

  ### 2. Gerar Código
  1. Faça login com a conta criada
  2. No dashboard, clique em "Gerar Código"
  3. Anote o código gerado (formato: ART-1234)

  ### 3. Realizar Teste como Cliente
  1. Volte para a tela inicial
  2. Clique em "Tenho um Código"
  3. Insira o código ART-1234
  4. Preencha nome (email opcional)
  5. Leia as instruções
  6. Responda as 120 questões em 4 estações
  7. Visualize seus resultados!

  ---

  ## 🗄️ Estrutura do Banco de Dados

  ### Tabelas:

  1. **treinadoras**
     - Profissionais que aplicam o teste
     - Campos: id, email, nome, creditos, auth_user_id

  2. **codigos**
     - Códigos ART-XXXX gerados
     - Campos: id, codigo, treinadora_id, valido_ate, usado, cliente_id

  3. **clientes**
     - Pessoas que realizam o teste
     - Campos: id, nome, email, codigo_id, treinadora_id, status

  4. **respostas**
     - 120 respostas do teste (1-5)
     - Campos: id, cliente_id, questao_id, resposta

  5. **resultados**
     - Scores calculados (JSON)
     - Campos: id, cliente_id, scores_facetas, scores_fatores, percentis, classificacoes

  6. **protocolos**
     - 90 protocolos comportamentais (3 por faceta)
     - Campos: id, faceta, tipo, titulo, descricao, exercicios

  7. **protocolos_recomendados**
     - Protocolos recomendados por cliente
     - Campos: id, resultado_id, protocolo_id, prioridade

  ---

  ## 🔒 Segurança

  - ✅ **Row Level Security (RLS)** habilitado em todas as tabelas
  - ✅ Treinadoras veem apenas seus próprios dados
  - ✅ Clientes veem apenas seus próprios resultados
  - ✅ Códigos validados antes do uso
  - ✅ Senhas criptografadas pelo Supabase Auth

  ---

  ## 📈 Próximas Fases (Next Phase)

  1. **Integração Hotmart**: Webhook para compra automática de créditos
  2. **Exportação PDF**: Relatórios completos para treinadoras
  3. **Notificações Email**: Resend (confirmações, códigos, resultados)
  4. **Validações Avançadas**: Tempo mínimo, padrões suspeitos
  5. **Seed Completo**: 90 protocolos com exercícios detalhados
  6. **Textos Interpretativos**: 115 textos personalizados (fatores + polos + facetas)

  ---

  ## 🛠️ Tecnologias Utilizadas

  - **Frontend**: React Native + Expo SDK 54
  - **Navegação**: Expo Router (file-based)
  - **Backend**: Supabase (PostgreSQL + Auth + RLS)
  - **Persistência Local**: AsyncStorage + Expo Secure Store
  - **Gráficos**: React Native SVG
  - **Styling**: StyleSheet (React Native)
  - **State Management**: React Query
  - **TypeScript**: 100% tipado

  ---

  ## 📝 Licença

  Este projeto é proprietário. Todos os direitos reservados.

  ---

  ## 📞 Suporte

  Para dúvidas ou problemas:
  1. Verifique se o Supabase está configurado corretamente
  2. Verifique se o arquivo `.env` existe e contém as credenciais corretas
  3. Veja os logs do console para erros específicos
  4. Certifique-se de que o schema SQL foi executado completamente

  ---

  ## ✨ Créditos

  - **Teste IPIP-NEO-120**: Baseado no International Personality Item Pool
  - **Big Five**: Modelo dos Cinco Grandes Fatores de Personalidade
  - **Desenvolvido com**: Replit AI Agent

  ---

  **Desenvolvido com 💜 por [Seu Nome]**
  