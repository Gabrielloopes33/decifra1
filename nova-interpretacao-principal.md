# Nova Interpretação Principal - DECIFRA

## 1. ESTRUTURA DE DADOS TYPESCRIPT

```typescript
// ============================================
// INTERFACES DA NOVA INTERPRETAÇÃO PRINCIPAL
// ============================================

export type FatorKey = 'N' | 'E' | 'O' | 'A' | 'C';
export type Classificacao = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';

export interface ScoreFator {
  fator: FatorKey;
  score: number;        // 24-120
  percentil: number;    // 5-95
  classificacao: Classificacao;
}

export interface ScoreFaceta {
  faceta: string;       // N1-N6, E1-E6, O1-O6, A1-A6, C1-C6
  score: number;
  percentil: number;
  classificacao: Classificacao;
}

export interface ProtocoloRecomendado {
  id: string;           // código do protocolo (ex: "N1-A", "C5-B")
  titulo: string;
  descricao: string;
  prioridade: number;   // 1-4
}

// ----------------------------------------
// NOVAS INTERFACES PARA INTERPRETAÇÃO
// ----------------------------------------

export interface PerfilDominante {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  titulo: string;
  subtitulo: string;
  descricao: string;
}

export interface CaracteristicaSecundaria {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  tipo: 'forte_alta' | 'forte_baixa';  // ≥75 ou ≤25
  descricaoCurta: string;
  comoComplementa: string;
}

export interface CombinacaoFator {
  id: string;
  nome: string;
  fatores: FatorKey[];
  descricao: string;
  implicacoes: string[];
  corDestaque: string;
}

export interface TraçoDesenvolver {
  fator: FatorKey;
  nome: string;
  percentil: number;
  classificacao: Classificacao;
  descricaoEmpoderada: string;
  beneficios: string[];
  protocolosRelacionados: string[];
}

export interface ResumoPerfil {
  fraseSintese: string;
  arquetipo: string;
  emojiPerfil: string;
  palavrasChave: string[];
}

export interface InterpretacaoPrincipal {
  // 1. Perfil Dominante (mantido/evoluído)
  perfilDominante: PerfilDominante;
  
  // 2. Características Secundárias (novo)
  caracteristicasSecundarias: CaracteristicaSecundaria[];
  
  // 3. Combinações de Fatores (novo)
  combinacoesDetectadas: CombinacaoFator[];
  
  // 4. Traços a Desenvolver (novo)
  tracosDesenvolver: TraçoDesenvolver[];
  
  // 5. Resumo do Perfil (novo)
  resumo: ResumoPerfil;
  
  // Metadados
  geradoEm: Date;
  versaoAlgoritmo: string;
}
```

---

## 2. ALGORITMO EM PSEUDO-CÓDIGO

```
FUNÇÃO gerarInterpretacaoPrincipal(
  scoresFatores: ScoreFator[],
  scoresFacetas: ScoreFaceta[],
  protocolos: ProtocoloRecomendado[]
): InterpretacaoPrincipal

  // =====================================================
  // PASSO 1: IDENTIFICAR PERFIL DOMINANTE
  // =====================================================
  
  fatorDominante = scoresFatores
    .ordenarPor(|percentil - 50| DESC)
    .primeiro()
  
  perfilDominante = {
    fator: fatorDominante.fator,
    nome: obterNomeFator(fatorDominante.fator),
    percentil: fatorDominante.percentil,
    classificacao: fatorDominante.classificacao,
    ...obterInterpretacaoBase(fatorDominante.fator, fatorDominante.classificacao)
  }


  // =====================================================
  // PASSO 2: IDENTIFICAR CARACTERÍSTICAS SECUNDÁRIAS
  // =====================================================
  
  caracteristicasSecundarias = []
  
  PARA CADA score EM scoresFatores ONDE score.fator ≠ fatorDominante.fator:
    
    SE score.percentil >= 75 ENTÃO:
      caracteristicasSecundarias.adicionar({
        fator: score.fator,
        tipo: 'forte_alta',
        descricaoCurta: obterDescricaoForteAlto(score.fator),
        comoComplementa: calcularComplementariedade(fatorDominante.fator, score.fator, 'alta')
      })
    
    SENÃO SE score.percentil <= 25 ENTÃO:
      caracteristicasSecundarias.adicionar({
        fator: score.fator,
        tipo: 'forte_baixa',
        descricaoCurta: obterDescricaoForteBaixo(score.fator),
        comoComplementa: calcularComplementariedade(fatorDominante.fator, score.fator, 'baixa')
      })
  
  // Ordenar por "força" (distância do meio)
  caracteristicasSecundarias.ordenarPor(|percentil - 50| DESC)
  // Limitar a 3 características secundárias
  caracteristicasSecundarias = caracteristicasSecundarias.slice(0, 3)


  // =====================================================
  // PASSO 3: DETECTAR COMBINAÇÕES DE FATORES
  // =====================================================
  
  combinacoesDetectadas = []
  
  // Criar mapa de classificações simplificadas
  mapaClassificacoes = {}
  PARA CADA score EM scoresFatores:
    SE score.percentil >= 65 ENTÃO:
      mapaClassificacoes[score.fator] = 'alto'
    SENÃO SE score.percentil <= 35 ENTÃO:
      mapaClassificacoes[score.fator] = 'baixo'
    SENÃO:
      mapaClassificacoes[score.fator] = 'medio'
  
  // Verificar combinações predefinidas
  combinacoesPossiveis = [
    // Alta Abertura + Alta Conscienciosidade
    {
      condicao: mapaClassificacoes.O == 'alto' E mapaClassificacoes.C == 'alto',
      combinacao: COMBINACOES['VISIONARIA_REALIZADORA']
    },
    // Alta Abertura + Baixa Conscienciosidade  
    {
      condicao: mapaClassificacoes.O == 'alto' E mapaClassificacoes.C == 'baixo',
      combinacao: COMBINACOES['SONHADOR_CRIATIVO']
    },
    // Alto Neuroticismo + Baixa Conscienciosidade
    {
      condicao: mapaClassificacoes.N == 'alto' E mapaClassificacoes.C == 'baixo',
      combinacao: COMBINACOES['SENSIVEL_DESORGANIZADA']
    },
    // Alto Neuroticismo + Alta Conscienciosidade
    {
      condicao: mapaClassificacoes.N == 'alto' E mapaClassificacoes.C == 'alto',
      combinacao: COMBINACOES['PERFEICIONISTA_ANSIOSA']
    },
    // Alta Extroversão + Alta Amabilidade
    {
      condicao: mapaClassificacoes.E == 'alto' E mapaClassificacoes.A == 'alto',
      combinacao: COMBINACOES['CONECTORA_SOCIAL']
    },
    // Alta Extroversão + Baixa Amabilidade
    {
      condicao: mapaClassificacoes.E == 'alto' E mapaClassificacoes.A == 'baixo',
      combinacao: COMBINACOES['LIDER_DETERMINADA']
    },
    // Baixa Extroversão + Alta Amabilidade
    {
      condicao: mapaClassificacoes.E == 'baixo' E mapaClassificacoes.A == 'alto',
      combinacao: COMBINACOES['APOIADORA_SILENCIOSA']
    },
    // Baixa Extroversão + Baixa Abertura
    {
      condicao: mapaClassificacoes.E == 'baixo' E mapaClassificacoes.O == 'baixo',
      combinacao: COMBINACOES['TRADICIONALISTA_RESERVADA']
    },
    // Alta Abertura + Alta Extroversão
    {
      condicao: mapaClassificacoes.O == 'alto' E mapaClassificacoes.E == 'alto',
      combinacao: COMBINACOES['EXPLORADORA_ENTUSIASTA']
    },
    // Alto Neuroticismo + Alta Amabilidade
    {
      condicao: mapaClassificacoes.N == 'alto' E mapaClassificacoes.A == 'alto',
      combinacao: COMBINACOES['EMPATICA_SENSIVEL']
    },
    // Baixo Neuroticismo + Alta Conscienciosidade
    {
      condicao: mapaClassificacoes.N == 'baixo' E mapaClassificacoes.C == 'alto',
      combinacao: COMBINACOES['ROCHA_CONFIIVEL']
    },
    // Baixo Neuroticismo + Alta Extroversão
    {
      condicao: mapaClassificacoes.N == 'baixo' E mapaClassificacoes.E == 'alto',
      combinacao: COMBINACOES['OTIMISTA_RESILIENTE']
    }
  ]
  
  PARA CADA item EM combinacoesPossiveis:
    SE item.condicao ENTÃO:
      combinacoesDetectadas.adicionar(item.combinacao)
  
  // Limitar a 2 combinações mais relevantes
  combinacoesDetectadas = combinacoesDetectadas.slice(0, 2)


  // =====================================================
  // PASSO 4: IDENTIFICAR TRAÇOS A DESENVOLVER
  // =====================================================
  
  tracosDesenvolver = []
  
  // Identificar fatores "fracos" (mais próximos do meio ou extremos problemáticos)
  fatoresPrioritarios = scoresFatores
    .filtrar(s => s.fator !== fatorDominante.fator)
    .ordenarPor(|percentil - 50| ASC)  // Mais próximos do meio = oportunidade
  
  // Ou fatores em extremos que precisam de equilíbrio
  fatoresExtremos = scoresFatores
    .filtrar(s => 
      (s.classificacao == 'Muito Alto' E s.fator == 'N') OU  // Neuroticismo muito alto é sempre alerta
      (s.classificacao == 'Muito Baixo' E s.fator == 'A') OU // Amabilidade muito baixa
      (s.classificacao == 'Muito Baixo' E s.fator == 'C')    // Conscienciosidade muito baixa
    )
  
  candidatosDesenvolvimento = fatoresExtremos.concat(fatoresPrioritarios)
  candidatosDesenvolvimento = removerDuplicatas(candidatosDesenvolvimento)
  candidatosDesenvolvimento = candidatosDesenvolvimento.slice(0, 3)
  
  PARA CADA candidato EM candidatosDesenvolvimento:
    tracosDesenvolver.adicionar({
      fator: candidato.fator,
      nome: obterNomeFator(candidato.fator),
      percentil: candidato.percentil,
      classificacao: candidato.classificacao,
      descricaoEmpoderada: gerarDescricaoEmpoderada(candidato),
      beneficios: obterBeneficiosDesenvolvimento(candidato.fator, candidato.classificacao),
      protocolosRelacionados: encontrarProtocolosRelacionados(
        protocolos, 
        candidato.fator, 
        scoresFacetas
      )
    })


  // =====================================================
  // PASSO 5: GERAR RESUMO DO PERFIL
  // =====================================================
  
  arquetipo = determinarArquetipo(
    fatorDominante, 
    caracteristicasSecundarias, 
    combinacoesDetectadas
  )
  
  fraseSintese = gerarFraseSintese(
    fatorDominante,
    caracteristicasSecundarias,
    tracosDesenvolver
  )
  
  emojiPerfil = selecionarEmoji(arquetipo)
  
  palavrasChave = gerarPalavrasChave(
    perfilDominante,
    caracteristicasSecundarias,
    combinacoesDetectadas
  )
  
  resumo = {
    fraseSintese,
    arquetipo,
    emojiPerfil,
    palavrasChave
  }


  // =====================================================
  // RETORNAR ESTRUTURA COMPLETA
  // =====================================================
  
  RETORNAR {
    perfilDominante,
    caracteristicasSecundarias,
    combinacoesDetectadas,
    tracosDesenvolver,
    resumo,
    geradoEm: agora(),
    versaoAlgoritmo: '2.0'
  }

FIM FUNÇÃO
```

---

## 3. EXEMPLOS DE SAÍDA

### PERFIL 1: Equilibrado (Todos Médios)

**Input:**
```json
{
  "scoresFatores": [
    { "fator": "N", "percentil": 45, "classificacao": "Médio" },
    { "fator": "E", "percentil": 55, "classificacao": "Médio" },
    { "fator": "O", "percentil": 50, "classificacao": "Médio" },
    { "fator": "A", "percentil": 48, "classificacao": "Médio" },
    { "fator": "C", "percentil": 52, "classificacao": "Médio" }
  ]
}
```

**Output:**
```json
{
  "perfilDominante": {
    "fator": "E",
    "nome": "Extroversão",
    "percentil": 55,
    "classificacao": "Médio",
    "titulo": "Adaptabilidade Social",
    "subtitulo": "Flexibilidade Ambivertida",
    "descricao": "Você se adapta a diferentes contextos sociais, conseguindo tanto liderar conversas quanto ouvir atentamente."
  },
  "caracteristicasSecundarias": [],
  "combinacoesDetectadas": [],
  "tracosDesenvolver": [
    {
      "fator": "N",
      "nome": "Estabilidade Emocional",
      "percentil": 45,
      "classificacao": "Médio",
      "descricaoEmpoderada": "Você tem uma base emocional sólida. Aprofundar sua inteligência emocional pode ajudá-la a navegar situações de pressão com ainda mais confiança.",
      "beneficios": ["Maior clareza em momentos de crise", "Melhor regulação do estresse", "Relacionamentos mais harmoniosos" ],
      "protocolosRelacionados": ["N1-A: Ansiedade Cognitiva", "N6-B: Resiliência Emocional"]
    },
    {
      "fator": "A",
      "nome": "Amabilidade",
      "percentil": 48,
      "classificacao": "Médio",
      "descricaoEmpoderada": "Você equilibra bem seus interesses com os dos outros. Desenvolver mais assertividade pode potencializar sua capacidade de liderança.",
      "beneficios": ["Comunicação mais eficaz", "Limites mais claros", "Influência positiva nos outros"],
      "protocolosRelacionados": ["A3-A: Altruísmo Sustentável", "A4-B: Assertividade Gentil"]
    },
    {
      "fator": "C",
      "nome": "Conscienciosidade",
      "percentil": 52,
      "classificacao": "Médio",
      "descricaoEmpoderada": "Você tem disciplina quando necessita. Criar sistemas simples pode liberar energia mental para o que realmente importa.",
      "beneficios": ["Maior produtividade", "Menos esquecimentos", "Realização de metas de longo prazo"],
      "protocolosRelacionados": ["C2-A: Organização Prática", "C5-B: Autodisciplina Progressiva"]
    }
  ],
  "resumo": {
    "fraseSintese": "Você é uma pessoa versátil e adaptável, com grande potencial para se desenvolver em múltiplas direções. Seu perfil equilibrado é uma base sólida para construir competências específicas.",
    "arquetipo": "Potencial Versátil",
    "emojiPerfil": "🌱",
    "palavrasChave": ["Adaptável", "Equilibrada", "Flexível", "Potencial de crescimento"]
  }
}
```

---

### PERFIL 2: Fator Dominante Claro (Alto Neuroticismo)

**Input:**
```json
{
  "scoresFatores": [
    { "fator": "N", "percentil": 88, "classificacao": "Muito Alto" },
    { "fator": "E", "percentil": 42, "classificacao": "Médio" },
    { "fator": "O", "percentil": 65, "classificacao": "Alto" },
    { "fator": "A", "percentil": 70, "classificacao": "Alto" },
    { "fator": "C", "percentil": 35, "classificacao": "Baixo" }
  ]
}
```

**Output:**
```json
{
  "perfilDominante": {
    "fator": "N",
    "nome": "Neuroticismo",
    "percentil": 88,
    "classificacao": "Muito Alto",
    "titulo": "Intensidade Emocional",
    "subtitulo": "Profundidade e Vulnerabilidade",
    "descricao": "Você vive emoções de forma profunda e intensa, com alta sensibilidade a estímulos internos e externos. Isso pode ser fonte de riqueza interior mas também de vulnerabilidade significativa."
  },
  "caracteristicasSecundarias": [
    {
      "fator": "A",
      "nome": "Amabilidade",
      "percentil": 70,
      "tipo": "forte_alta",
      "descricaoCurta": "Você é naturalmente cooperativa, empática e atenta ao bem-estar dos outros.",
      "comoComplementa": "Sua alta sensibilidade emocional se combina com empatia genuína, tornando você uma pessoa profundamente compreensiva. Use isso para criar conexões significativas."
    },
    {
      "fator": "O",
      "nome": "Abertura",
      "percentil": 65,
      "tipo": "forte_alta",
      "descricaoCurta": "Você tem curiosidade intelectual e apreciação por novas experiências.",
      "comoComplementa": "Sua mente aberta permite processar emoções complexas de maneiras criativas. Canais criativos podem ser excelentes vias de expressão emocional."
    }
  ],
  "combinacoesDetectadas": [
    {
      "id": "SENSIVEL_EMPATICA",
      "nome": "A Empática Sensível",
      "fatores": ["N", "A"],
      "descricao": "A combinação de intensidade emocional com alta empatia cria uma pessoa profundamente conectada com os sentimentos - os seus e dos outros.",
      "implicacoes": [
        "Você sente o que os outros sentem - isso pode ser exaustivo",
        "Relacionamentos profundos são seu forte",
        "Precisa de tempo sozinha para recarregar",
        "A fronteira entre seus sentimentos e os dos outros pode ficar tênue"
      ],
      "corDestaque": "#9B59B6"
    },
    {
      "id": "SONHADOR_CRIATIVO",
      "nome": "A Sonhadora Criativa",
      "fatores": ["O", "C"],
      "descricao": "Você tem imaginação fértil e sensibilidade artística, embora às vezes a execução das ideias seja desafiadora.",
      "implicacoes": [
        "Ideias abundantes, mas pode ter dificuldade em concluir projetos",
        "Criatividade emocional é seu diferencial",
        "Sistemas leves de organização podem ajudar a materializar suas visões",
        "Colaborar com pessoas organizadas pode ser muito produtivo"
      ],
      "corDestaque": "#E67E22"
    }
  ],
  "tracosDesenvolver": [
    {
      "fator": "C",
      "nome": "Conscienciosidade",
      "percentil": 35,
      "classificacao": "Baixo",
      "descricaoEmpoderada": "Você tem grande criatividade e sensibilidade. Criar estruturas simples e flexíveis pode ajudar a transformar suas ideias em realidade sem sufocar sua espontaneidade.",
      "beneficios": ["Menos esquecimentos e atrasos", "Projetos finalizados", "Redução da ansiedade por desorganização"],
      "protocolosRelacionados": ["C2-A: Organização Minimalista", "C5-B: Micro-hábitos", "N1-C: Ansiedade e Planejamento"]
    },
    {
      "fator": "E",
      "nome": "Extroversão",
      "percentil": 42,
      "classificacao": "Médio",
      "descricaoEmpoderada": "Você tem momentos de sociabilidade e outros de recolhimento. Fortalecer sua energia social gradualmente pode abrir portas para conexões enriquecedoras.",
      "beneficios": ["Rede de apoio mais ampla", "Oportunidades profissionais", "Diversidade de experiências"],
      "protocolosRelacionados": ["E3-A: Assertividade Social", "N4-B: Autoconsciência Social"]
    }
  ],
  "resumo": {
    "fraseSintese": "Você é uma Empática Visionária que sente intensamente e compreende profundamente. Suas emoções são uma fonte de criatividade - estrutura leve pode ajudá-la a transformar sensibilidade em realização.",
    "arquetipo": "A Empática Criativa",
    "emojiPerfil": "🦋",
    "palavrasChave": ["Intensa", "Empática", "Criativa", "Sensível", "Profunda"]
  }
}
```

---

### PERFIL 3: Combinação Interessante (Visionária Realizadora)

**Input:**
```json
{
  "scoresFatores": [
    { "fator": "N", "percentil": 35, "classificacao": "Baixo" },
    { "fator": "E", "percentil": 72, "classificacao": "Alto" },
    { "fator": "O", "percentil": 85, "classificacao": "Muito Alto" },
    { "fator": "A", "percentil": 55, "classificacao": "Médio" },
    { "fator": "C", "percentil": 82, "classificacao": "Muito Alto" }
  ]
}
```

**Output:**
```json
{
  "perfilDominante": {
    "fator": "O",
    "nome": "Abertura",
    "percentil": 85,
    "classificacao": "Muito Alto",
    "titulo": "Visão Visionária",
    "subtitulo": "Originalidade e Intelecto",
    "descricao": "Você tem mente extremamente aberta, com fascínio por ideias complexas, arte, cultura e experiências incomuns. Pensa de formas que desafiam convenções."
  },
  "caracteristicasSecundarias": [
    {
      "fator": "C",
      "nome": "Conscienciosidade",
      "percentil": 82,
      "tipo": "forte_alta",
      "descricaoCurta": "Você é altamente organizada, disciplinada e orientada para metas.",
      "comoComplementa": "Raramente se vê a combinação de visão criativa com capacidade de execução. Você não apenas imagina o futuro - constrói-o."
    },
    {
      "fator": "E",
      "nome": "Extroversão",
      "percentil": 72,
      "tipo": "forte_alta",
      "descricaoCurta": "Você é energética, comunicativa e ganha energia com interações sociais.",
      "comoComplementa": "Sua energia social ajuda a vender suas ideias visionárias. Você consegue inspirar outros a embarcarem em seus projetos inovadores."
    }
  ],
  "combinacoesDetectadas": [
    {
      "id": "VISIONARIA_REALIZADORA",
      "nome": "A Visionária Realizadora",
      "fatores": ["O", "C"],
      "descricao": "A combinação rara de alta criatividade com alta disciplina. Você imagina o impossível e tem a determinação para torná-lo real.",
      "implicacoes": [
        "Você pode ver oportunidades onde outros veem obstáculos",
        "Tende a ter altos padrões para si mesma",
        "Pode ficar frustrada quando outros não acompanham seu ritmo",
        "Ideal para liderar transformações e inovações"
      ],
      "corDestaque": "#9B59B6"
    },
    {
      "id": "CONECTORA_SOCIAL",
      "nome": "A Comunicadora de Ideias",
      "fatores": ["E", "O"],
      "descricao": "Você combina energia social com mente aberta, sendo capaz de conectar pessoas através de ideias inovadoras.",
      "implicacoes": [
        "Networking é natural para você",
        "Pode inspirar equipes com visão de futuro",
        "Prefere ambientes dinâmicos e desafiadores",
        "Tédio é seu maior inimigo"
      ],
      "corDestaque": "#F39C12"
    }
  ],
  "tracosDesenvolver": [
    {
      "fator": "A",
      "nome": "Amabilidade",
      "percentil": 55,
      "classificacao": "Médio",
      "descricaoEmpoderada": "Você tem foco e determinação. Desenvolver mais consciência sobre o impacto emocional em outros pode torná-la uma líder ainda mais inspiradora.",
      "beneficios": ["Liderança mais inclusiva", "Melhor retenção de talentos", "Ambiente colaborativo mais forte"],
      "protocolosRelacionados": ["A3-A: Liderança Empática", "A6-B: Inteligência Social"]
    },
    {
      "fator": "N",
      "nome": "Estabilidade Emocional",
      "percentil": 35,
      "classificacao": "Baixo",
      "descricaoEmpoderada": "Você mantém a calma na maioria das situações. Fortalecer ainda mais sua base emocional criará resiliência para grandes desafios.",
      "beneficios": ["Melhor tomada de decisão sob pressão", "Menor stress em mudanças", "Presença mais centrada"],
      "protocolosRelacionados": ["N1-A: Ansiedade Produtiva", "N6-B: Resiliência de Alto Performer"]
    }
  ],
  "resumo": {
    "fraseSintese": "Você é uma Visionária Realizadora que transforma ideias audaciosas em resultados concretos. Sua mente criativa encontra na disciplina a ponte para o futuro.",
    "arquetipo": "A Visionária Realizadora",
    "emojiPerfil": "🚀",
    "palavrasChave": ["Visionária", "Determinada", "Inovadora", "Líder", "Criadora"]
  }
}
```

---

## 4. TEXTOS MODELO PARA AS SEÇÕES

### 4.1 Como Apresentar Características Secundárias

**Quando for característica ALTA (≥75):**

```
[ÍCONE] [Nome do Fator]
━━━━━━━━━━━━━━━━━━━━━━━
[Você é/ Tem / Demonstra] [descrição breve do que significa esse fator alto].

💡 Como isso complementa seu perfil:
[Texto personalizado explicando a sinergia com o fator dominante].
```

**Exemplos por fator:**

**Extroversão Alta (E):**
> ⚡ Extroversão
> ━━━━━━━━━━━━━━━━━━━━━━━
> Você é energética, comunicativa e ganha energia com interações sociais.
> 
> 💡 Como isso complementa seu perfil:
> Sua energia social ajuda a [contexto específico baseado no fator dominante]. Você consegue [benefício específico].

**Abertura Alta (O):**
> 🔮 Abertura à Experiência
> ━━━━━━━━━━━━━━━━━━━━━━━
> Você tem curiosidade intelectual, apreciação estética e mente aberta para novas ideias.
> 
> 💡 Como isso complementa seu perfil:
> Sua criatividade permite que você [contexto específico]. Perspectivas inovadoras são seu diferencial.

**Amabilidade Alta (A):**
> ❤️ Amabilidade
> ━━━━━━━━━━━━━━━━━━━━━━━
> Você é naturalmente cooperativa, empática e atenta ao bem-estar dos outros.
> 
> 💡 Como isso complementa seu perfil:
> Sua capacidade de conectar-se genuinamente com pessoas [contexto específico]. Relacionamentos são seu superpoder.

**Conscienciosidade Alta (C):**
> 📋 Conscienciosidade
> ━━━━━━━━━━━━━━━━━━━━━━━
> Você é altamente organizada, disciplinada e orientada para metas.
> 
> 💡 Como isso complementa seu perfil:
> Sua determinação transforma [ideias/intenções/sensibilidade] em resultados concretos. Execução é sua especialidade.

**Neuroticismo BAIXO (≤25):**
> 🧠 Estabilidade Emocional
> ━━━━━━━━━━━━━━━━━━━━━━━
> Você mantém a calma em situações de pressão e recupera-se rapidamente de contratempos.
> 
> 💡 Como isso complementa seu perfil:
> Sua serenidade emocional equilibra [aspectos do fator dominante], permitindo que você [benefício].

---

### 4.2 Como Descrever Combinações de Fatores

**Estrutura para cada combinação:**

```
✨ [Nome da Combinação]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Parágrafo introdutório descrevendo a combinação e sua raridade/importância]

🎯 Implicações desta combinação:
• [Implicação 1 - algo desafiador ou positivo específico]
• [Implicação 2 - outra nuance da combinação]
• [Implicação 3 - orientação sobre relacionamentos ou trabalho]
• [Implicação 4 - cuidado ou oportunidade]
```

**Banco de Combinações:**

| Fatores | Nome | Descrição |
|---------|------|-----------|
| O↑ + C↑ | **A Visionária Realizadora** | Imagina o impossível e tem determinação para torná-lo real. Rara combinação de criatividade e disciplina. |
| O↑ + C↓ | **A Sonhadora Criativa** | Mente fértil e sensibilidade artística, com dificuldade em concretizar. Precisa de parceiros executores. |
| N↑ + C↓ | **A Sensível em Transição** | Emoções intensas + dificuldade com estrutura. Necessita de apoio para organizar a vida interna. |
| N↑ + C↑ | **A Perfeccionista Comprometida** | Alto padrão + autoexigência intensa. Cuidado com burnout. Excelente para qualidade, mas precisa descansar. |
| E↑ + A↑ | **A Conectora Social** | Energia social + calor humano. Naturalmente cria comunidade e conecta pessoas. |
| E↑ + A↓ | **A Líder Determinada** | Carisma + foco em resultados. Excelente para liderança, mas atenção à empatia. |
| E↓ + A↑ | **A Apoiadora Silenciosa** | Prefere ajudar nos bastidores. Profundidade em poucas relações. | 
| E↓ + O↓ | **A Tradicionalista Reservada** | Valoriza estabilidade, rotina e grupos próximos. Mudanças precisam de tempo. |
| O↑ + E↑ | **A Exploradora Entusiasta** | Curiosidade + energia = sempre buscando novas experiências. Não suporta tédio. |
| N↑ + A↑ | **A Empática Sensível** | Sente intensamente o que outros sentem. Fronteira emocional tênse. Cuidado com exaustão. |
| N↓ + C↑ | **A Rocha Confiável** | Estabilidade emocional + disciplina. Pilar em qualquer equipe ou relacionamento. |
| N↓ + E↑ | **A Otimista Resiliente** | Energia social sem o drama. Recupera-se rapidamente e contagia positividade. |

---

### 4.3 Como Apresentar Traços a Desenvolver de Forma Empoderadora

**Princípios:**
1. **Nunca use linguagem deficitária** - "você é ruim em..." / "precisa melhorar..."
2. **Comece com o que já existe** - "Você já tem..." / "Você demonstra..."
3. **Frame como potencialização** - "Desenvolver isso pode..." / "Fortalecer esta área abre..."
4. **Conecte com o que a pessoa valoriza** - Relacione aos objetivos e valores do perfil
5. **Ofereça caminho concreto** - Protocolos relacionados dão ação imediata

**Estrutura:**

```
🌱 [Nome do Fator]
━━━━━━━━━━━━━━━━━━━━━━━

[Frase empoderadora de abertura - reconhecer o que existe]

✨ Ao fortalecer esta área, você pode:
• [Benefício 1 - relacionado aos valores do perfil]
• [Benefício 2 - aplicação prática]
• [Benefício 3 - resultado de longo prazo]

📋 Protocolos recomendados para este desenvolvimento:
[Lista dos protocolos relacionados]
```

**Exemplos por tipo de fator:**

**Para Conscienciosidade Baixa:**
> 🌱 Conscienciosidade
> ━━━━━━━━━━━━━━━━━━━━━━━
> 
> Você tem grande criatividade e espontaneidade. Criar estruturas simples e flexíveis pode ajudar a transformar suas ideias em realidade sem sufocar sua essência livre.
> 
> ✨ Ao fortalecer esta área, você pode:
> • Liberar energia mental para criar mais
> • Reduzir a ansiedade de última hora
> • Concluir projetos que começou com entusiasmo
> • Criar espaço para novas ideias sem bagunça pendente

**Para Extroversão Baixa:**
> 🌱 Extroversão
> ━━━━━━━━━━━━━━━━━━━━━━━
> 
> Você tem profundidade interior e valores conexões significativas. Expandir sua energia social gradualmente pode abrir portas para oportunidades alinhadas com seus valores.
> 
> ✨ Ao fortalecer esta área, você pode:
> • Encontrar pessoas que compartilham seus interesses profundos
> • Amplificar o impacto de suas ideias
> • Construir uma rede de apoio mais diversificada
> • Descobrir colaboradores para seus projetos

**Para Amabilidade Baixa:**
> 🌱 Amabilidade
> ━━━━━━━━━━━━━━━━━━━━━━━
> 
> Você é autêntica e direta. Desenvolver consciência sobre o impacto emocional em outros pode tornar sua comunicação ainda mais eficaz sem perder sua honestidade.
> 
> ✨ Ao fortalecer esta área, você pode:
> • Ser ouvida mais facilmente quando precisar influenciar
> • Construir alianças mais fortes para seus objetivos
> • Reduzir conflitos desnecessários
> • Criar ambientes onde todos se sintam valorizados

**Para Neuroticismo Alto:**
> 🌱 Estabilidade Emocional
> ━━━━━━━━━━━━━━━━━━━━━━━
> 
> Você tem profundidade emocional e sensibilidade refinada. Fortalecer sua base emocional permite que sua intensidade se expresse de formas construtivas.
> 
> ✨ Ao fortalecer esta área, você pode:
> • Canalizar sua intensidade para criação em vez de sofrimento
> • Recuperar-se mais rapidamente de situações difíceis
> • Usar sua sensibilidade como ferramenta, não vulnerabilidade
> • Criar com mais consistência, sem altos e baixos extremos

---

### 4.4 Como Gerar Resumos do Perfil

**Estrutura da Frase Síntese:**

```
"Você é uma [Arquétipo] que [característica principal do fator dominante] 
[conector] [característica secundária relevante]. 
[Frase sobre desenvolvimento ou diferencial]."
```

**Banco de Arquétipos por Combinação:**

| Combinação Dominante | Arquétipo | Emoji |
|---------------------|-----------|-------|
| O↑ + C↑ | Visionária Realizadora | 🚀 |
| O↑ + E↑ | Exploradora Entusiasta | 🧭 |
| O↑ + A↑ | Artista Empática | 🎨 |
| E↑ + A↑ | Conectora Social | 🌟 |
| E↑ + C↑ | Líder Executora | ⚡ |
| N↑ + A↑ | Empática Sensível | 🦋 |
| N↑ + O↑ | Artista Intensa | 🌊 |
| C↑ + A↑ | Profissional Confiável | 🏔️ |
| N↓ + C↑ | Rocha Confiável | 🪨 |
| N↓ + E↑ | Otimista Resiliente | ☀️ |
| E↓ + A↑ | Apoiadora Silenciosa | 🌙 |
| O↓ + C↑ | Especialista Pragmática | 🔧 |
| Todos médios | Potencial Versátil | 🌱 |
| N↑ + C↓ | Criativa em Desenvolvimento | 🌸 |

---

## 5. IMPLEMENTAÇÃO SUGERIDA NO REACT NATIVE

```typescript
// utils/interpretacaoPrincipal.ts

import { getInterpretacao, FatorKey, Faixa } from '@/constants/interpretacoes';
import { FATORES } from '@/constants/ipip';

// ... (interfaces definidas acima)

// Constantes de configuração
const CONFIG = {
  LIMITE_FORTE_ALTA: 75,
  LIMITE_FORTE_BAIXA: 25,
  LIMITE_COMBINACAO_ALTA: 65,
  LIMITE_COMBINACAO_BAIXA: 35,
  MAX_CARACTERISTICAS_SECUNDARIAS: 3,
  MAX_COMBINACOES: 2,
  MAX_TRACOS_DESENVOLVER: 3,
};

// Dicionário de combinações
const COMBINACOES: Record<string, Omit<CombinacaoFator, 'fatores'>> = {
  'VISIONARIA_REALIZADORA': {
    id: 'VISIONARIA_REALIZADORA',
    nome: 'A Visionária Realizadora',
    descricao: 'A combinação rara de alta criatividade com alta disciplina. Você imagina o impossível e tem a determinação para torná-lo real.',
    implicacoes: [
      'Você pode ver oportunidades onde outros veem obstáculos',
      'Tende a ter altos padrões para si mesma',
      'Pode ficar frustrada quando outros não acompanham seu ritmo',
      'Ideal para liderar transformações e inovações'
    ],
    corDestaque: '#9B59B6'
  },
  // ... outras combinações
};

// Função principal exportada
export function gerarInterpretacaoPrincipal(
  scoresFatores: ScoreFator[],
  scoresFacetas: ScoreFaceta[],
  protocolos: ProtocoloRecomendado[]
): InterpretacaoPrincipal {
  // Implementação do algoritmo descrito na seção 2
  // ...
}

// Componente React Native
// components/InterpretacaoPrincipal.tsx

export function InterpretacaoPrincipalCard({ 
  interpretacao 
}: { 
  interpretacao: InterpretacaoPrincipal 
}) {
  return (
    <ScrollView>
      {/* Resumo do Perfil */}
      <ResumoPerfilSection resumo={interpretacao.resumo} />
      
      {/* Perfil Dominante */}
      <PerfilDominanteSection perfil={interpretacao.perfilDominante} />
      
      {/* Características Secundárias */}
      {interpretacao.caracteristicasSecundarias.length > 0 && (
        <CaracteristicasSecundariasSection 
          caracteristicas={interpretacao.caracteristicasSecundarias} 
        />
      )}
      
      {/* Combinações */}
      {interpretacao.combinacoesDetectadas.length > 0 && (
        <CombinacoesSection 
          combinacoes={interpretacao.combinacoesDetectadas} 
        />
      )}
      
      {/* Traços a Desenvolver */}
      <TracosDesenvolverSection 
        tracos={interpretacao.tracosDesenvolver} 
      />
    </ScrollView>
  );
}
```

---

## 6. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar arquivo `utils/interpretacaoPrincipal.ts` com as interfaces
- [ ] Implementar função `gerarInterpretacaoPrincipal()`
- [ ] Criar constantes de combinações (`COMBINACOES`)
- [ ] Implementar funções auxiliares (classificação, detecção, etc.)
- [ ] Criar componente `InterpretacaoPrincipalCard`
- [ ] Criar sub-componentes para cada seção
- [ ] Atualizar `app/cliente/resultado.tsx` para usar nova interpretação
- [ ] Testar com os 3 perfis de exemplo
- [ ] Ajustar textos e algoritmo baseado em feedback

---

*Documento criado para evolução da experiência do usuário no DECIFRA*
*Versão: 2.0 - Interpretação Principal Completa*
