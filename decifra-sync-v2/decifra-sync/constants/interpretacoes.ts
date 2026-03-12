/**
 * Textos Interpretativos - DECIFRA
 * 
 * 25 textos personalizados (5 fatores × 5 faixas)
 * Cada texto explica o significado do score em uma faixa específica
 */

export interface InterpretacaoFator {
  titulo: string;
  subtitulo: string;
  descricao: string;
  pontosFortes: string[];
  atencao: string[];
  relacoes: string;
  carreira: string;
  crescimento: string;
}

export type Faixa = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
export type FatorKey = 'N' | 'E' | 'O' | 'A' | 'C';

// ============================================
// N - NEUROTICISMO (Estabilidade Emocional)
// ============================================

const INTERPRETACOES_N: Record<Faixa, InterpretacaoFator> = {
  'Muito Baixo': {
    titulo: 'Fortaleza Emocional',
    subtitulo: 'Serenidade e Resiliência',
    descricao: 'Você raramente se abala com as circunstâncias da vida. Mantém a calma em situações que geram ansiedade em outras pessoas, demonstrando uma estabilidade emocional admirável.',
    pontosFortes: [
      'Capacidade de manter o foco sob pressão',
      'Resiliência diante de adversidades',
      'Tomada de decisões racionais',
      'Equilíbrio emocional consistente',
    ],
    atencao: [
      'Pode parecer distante em situações que exigem empatia',
      'Evite minimizar os sentimentos dos outros',
      'Cuidado para não ignorar sinais de alerta legítimos',
    ],
    relacoes: 'Você traz estabilidade aos relacionamentos, sendo uma âncora emocional para as pessoas próximas. Seu parceiro pode confiar em sua constância emocional.',
    carreira: 'Performa excepcionalmente bem em ambientes de alta pressão, como liderança de crises, cirurgia, negociações complexas ou operações militares.',
    crescimento: 'Pratique a vulnerabilidade seletiva - compartilhar ocasionalmente suas preocupações pode aprofundar conexões sem comprometer sua estabilidade.',
  },
  'Baixo': {
    titulo: 'Equilíbrio Emocional',
    subtitulo: 'Calma e Autocontrole',
    descricao: 'Você mantém a compostura na maioria das situações, lidando bem com o estresse cotidiano. Demonstra maturidade emocional e capacidade de recuperação.',
    pontosFortes: [
      'Bom manejo do estresse',
      'Recuperação rápida de contratempos',
      'Comunicação clara sob pressão',
      'Perspectiva equilibrada dos problemas',
    ],
    atencao: [
      'Monitore sinais de burnout mesmo se não sentir ansiedade',
      'Permita-se expressar frustração quando necessário',
      'Não ignore completamente preocupações legítimas',
    ],
    relacoes: 'Parceiros e amigos valorizam sua presença calmante. Você raramente cria drama desnecessário e resolve conflitos de forma construtiva.',
    carreira: 'Bem adaptado para a maioria dos ambientes profissionais, especialmente aqueles que valorizam colaboração e resolução pacífica de conflitos.',
    crescimento: 'Desenvolva consciência de como sua calma afeta os outros - às vezes pessoas mais ansiosas precisam de validação antes de soluções.',
  },
  'Médio': {
    titulo: 'Fluidez Emocional',
    subtitulo: 'Equilíbrio Dinâmico',
    descricao: 'Você experimenta emoções de forma equilibrada - nem excessivamente suprimida nem dominado por elas. Tem capacidade de se preocupar quando apropriado sem deixar que isso paralise suas ações.',
    pontosFortes: [
      'Flexibilidade emocional',
      'Adaptação saudável a mudanças',
      'Empatia equilibrada',
      'Resiliência natural',
    ],
    atencao: [
      'Atenção aos momentos de maior vulnerabilidade',
      'Pratique autocuidado preventivo',
      'Mantenha hábitos de bem-estar regulares',
    ],
    relacoes: 'Sua flexibilidade emocional permite adaptar-se a diferentes tipos de personalidade. Consegue tanto apoiar quanto ser apoiado.',
    carreira: 'Versátil em diferentes ambientes de trabalho, consegue lidar com pressão moderada e colaborar efetivamente com diversos perfis.',
    crescimento: 'Mantenha práticas de bem-estar consistentes para preservar esse equilíbrio valioso ao longo do tempo.',
  },
  'Alto': {
    titulo: 'Sensibilidade Emocional',
    subtitulo: 'Intensidade e Percepção',
    descricao: 'Você experimenta emoções com intensidade e tem consciência aguçada das nuances emocionais. Isso traz profundidade às suas experiências, embora possa aumentar a vulnerabilidade ao estresse.',
    pontosFortes: [
      'Autoconhecimento profundo',
      'Empatia intensa',
      'Criatividade emocional',
      'Intuição apurada',
    ],
    atencao: [
      'Desenvolva técnicas de regulação emocional',
      'Estabeleça limites saudáveis',
      'Pratique autocuidado regular',
      'Busque apoio quando necessário',
    ],
    relacoes: 'Relacionamentos são vividos intensamente. Sua capacidade de conexão profunda é valiosa, mas requer parceiros compreensivos.',
    carreira: 'Excelente em carreiras que valorizam sensibilidade e intuição: arte, terapia, design, pesquisa qualitativa. Evite ambientes excessivamente estressantes.',
    crescimento: 'Invista em um "kit de ferramentas emocionais": mindfulness, terapia, journaling e atividades reguladoras como exercícios.',
  },
  'Muito Alto': {
    titulo: 'Intensidade Emocional',
    subtitulo: 'Profundidade e Vulnerabilidade',
    descricao: 'Você vive emoções de forma profunda e intensa, com alta sensibilidade a estímulos internos e externos. Isso pode ser fonte de riqueza interior mas também de vulnerabilidade significativa.',
    pontosFortes: [
      'Profundidade de experiência',
      'Compaixão genuína',
      'Criatividade alimentada pela emoção',
      'Autenticidade nas relações',
    ],
    atencao: [
      'Priorize saúde mental com profissionais',
      'Desenvolva estratégias de coping robustas',
      'Evite autocrítica excessiva',
      'Crie rotinas de estabilização',
    ],
    relacoes: 'Conexões são profundas mas podem ser turbulentas. Comunicação clara sobre necessidades emocionais é essencial.',
    carreira: 'Considere ambientes de trabalho com apoio psicológico disponível. Carreiras criativas ou de ajuda podem ser gratificantes mas exigem cuidado.',
    crescimento: 'Trabalhe com um terapeuta para desenvolver habilidades de regulação. Sua sensibilidade é uma dádiva - aprenda a canalizá-la construtivamente.',
  },
};

// ============================================
// E - EXTROVERSÃO
// ============================================

const INTERPRETACOES_E: Record<Faixa, InterpretacaoFator> = {
  'Muito Baixo': {
    titulo: 'Profundidade Interior',
    subtitulo: 'Introspecção e Autonomia',
    descricao: 'Você recupera energia na solidão e prefere ambientes tranquilos. Sua riqueza interior é profunda, e você tende a refletir bastante antes de agir ou falar.',
    pontosFortes: [
      'Pensamento profundo e reflexivo',
      'Independência social',
      'Observação atenta',
      'Relações significativas e duradouras',
    ],
    atencao: [
      'Não evite completamente situações sociais',
      'Pratique expressão de ideias',
      'Desenvolva habilidades de networking',
    ],
    relacoes: 'Prefere poucos amigos próxios a muitos conhecidos. Qualidade sobre quantidade em relacionamentos.',
    carreira: 'Excelente em trabalhos independentes, análise profunda, pesquisa, escrita, programação. Ambientes com interrupções mínimas são ideais.',
    crescimento: 'Desafie-se gradualmente em situações sociais. Sua introspecção é valiosa - compartilhá-la pode enriquecer os outros.',
  },
  'Baixo': {
    titulo: 'Reserva Seletiva',
    subtitulo: 'Equilíbrio Social',
    descricao: 'Você valoriza o espaço pessoal mas consegue interagir socialmente quando necessário. Prefere ambientes íntimos a multidões e precisa de tempo para processar experiências.',
    pontosFortes: [
      'Bom ouvinte',
      'Interações significativas',
      'Independência saudável',
      'Reflexão antes de falar',
    ],
    atencao: [
      'Não deixe oportunidades passarem por timidez',
      'Expresse necessidades de espaço aos outros',
      'Equilibre solitude e conexão',
    ],
    relacoes: 'Bom parceiro para quem valoriza calma e profundidade. Pode precisar comunicar claramente necessidades de espaço.',
    carreira: 'Funciona bem em equipes pequenas ou com autonomia. Evite funções que exijam networking constante ou apresentações frequentes.',
    crescimento: 'Identifique situações sociais onde você se sente confortável e expanda gradualmente a partir daí.',
  },
  'Médio': {
    titulo: 'Adaptabilidade Social',
    subtitulo: 'Flexibilidade Ambivertida',
    descricao: 'Você se adapta a diferentes contextos sociais, conseguindo tanto liderar conversas quanto ouvir atentamente. Tem capacidade de ajustar seu nível de sociabilidade conforme necessário.',
    pontosFortes: [
      'Versatilidade social',
      'Comunicação equilibrada',
      'Adaptação a contextos',
      'Ambos: falar e ouvir',
    ],
    atencao: [
      'Monitore seus níveis de energia social',
      'Não force extroversão excessiva',
      'Permita-se tempo de descanso',
    ],
    relacoes: 'Flexível em relacionamentos, consegue atender tanto parceiros extrovertidos quanto introvertidos.',
    carreira: 'Versátil em diversos ambientes. Consegue tanto trabalho colaborativo quanto independente.',
    crescimento: 'Desenvolva autoconsciência sobre quando precisa de interação versus solitude.',
  },
  'Alto': {
    titulo: 'Energia Social',
    subtitulo: 'Entusiasmo e Conexão',
    descricao: 'Você ganha energia em interações sociais e tende a ser entusiasmado, falante e assertivo. Prefere ambientes dinâmicos e tem facilidade em conhecer novas pessoas.',
    pontosFortes: [
      'Networking natural',
      'Motivação de equipes',
      'Comunicação fluida',
      'Entusiasmo contagiante',
    ],
    atencao: [
      'Pratique escuta ativa',
      'Respeite o espaço dos mais reservados',
      'Evite dominar conversas',
      'Crie momentos de reflexão',
    ],
    relacoes: 'Trás energia e entusiasmo para relacionamentos. Atenção para não sobrecarregar parceiros mais introvertidos.',
    carreira: 'Excelente em vendas, marketing, gestão, apresentações, RH. Ambientes sociais e dinâmicos são ideais.',
    crescimento: 'Desenvolva paciência para processos que exigem calma e reflexão. Sua energia é valiosa quando canalizada.',
  },
  'Muito Alto': {
    titulo: 'Magnetismo Social',
    subtitulo: 'Carisma e Intensidade',
    descricao: 'Você é naturalmente o centro das atenções em grupos sociais, com alta energia e entusiasmo. Tem facilidade extrema em conectar-se com pessoas e inspirar outros.',
    pontosFortes: [
      'Liderança carismática',
      'Influência natural',
      'Motivação de massas',
      'Networking excepcional',
    ],
    atencao: [
      'Cuidado com superficialidade nas relações',
      'Pratique introspecção regular',
      'Respeite limites de introvertidos',
      'Evite impulsividade excessiva',
    ],
    relacoes: 'Pode ser uma presença dominante. Relações profundas requerem intencionalidade além da charme superficial.',
    carreira: 'Natural para liderança executiva, política, entretenimento, vendas de alto nível. Ambientes que recompensam visibilidade.',
    crescimento: 'Invista em relacionamentos profundos, não apenas amplos. Desenvolva habilidades de introspecção e escuta profunda.',
  },
};

// ============================================
// O - ABERTURA
// ============================================

const INTERPRETACOES_O: Record<Faixa, InterpretacaoFator> = {
  'Muito Baixo': {
    titulo: 'Praticidade Concreta',
    subtitulo: 'Foco no Presente',
    descricao: 'Você valoriza o concreto, o prático e o testado. Prefere lidar com fatos tangíveis a especulações abstratas, trazendo estabilidade e confiabilidade.',
    pontosFortes: [
      'Execução confiável',
      'Atenção a detalhes práticos',
      'Soluções realistas',
      'Conservação do que funciona',
    ],
    atencao: [
      'Esteja aberto a inovações necessárias',
      'Evite rejeitar ideias apenas por serem novas',
      'Pratique criatividade ocasionalmente',
    ],
    relacoes: 'Parceiro confiável e previsível. Traz estabilidade prática para relacionamentos.',
    carreira: 'Excelente em operações, logística, contabilidade, manutenção, funções que valorizam precisão e confiabilidade.',
    crescimento: 'Experimente sair da zona de conforto ocasionalmente - inovações controladas podem surpreender positivamente.',
  },
  'Baixo': {
    titulo: 'Realismo Aplicado',
    subtitulo: 'Pragmatismo e Consistência',
    descricao: 'Você prefere o que é funcional e comprovado, mas consegue considerar novas ideias quando apresentadas com evidências. Equilibra tradição com necessidade de mudança.',
    pontosFortes: [
      'Implementação eficiente',
      'Avaliação crítica de ideias',
      'Manutenção de padrões',
      'Resolução prática de problemas',
    ],
    atencao: [
      'Não descarte inovações prematuramente',
      'Cultive curiosidade ocasional',
      'Permita-se experimentar',
    ],
    relacoes: 'Balança estabilidade com adaptação. Parceiro confiável que não cria mudanças desnecessárias.',
    carreira: 'Bem adaptado para funções técnicas, gestão operacional, qualidade, onde equilíbrio entre inovação e consistência é valorizado.',
    crescimento: 'Pratique a criatividade como hobby - pode trazer insights surpreendentes para a vida prática.',
  },
  'Médio': {
    titulo: 'Equilíbrio Criativo',
    subtitulo: 'Pragmatismo e Imaginação',
    descricao: 'Você equilibra criatividade com praticidade, conseguindo tanto imaginar novas possibilidades quanto implementar soluções concretas. Adapta-se a situações que exigem inovação ou tradição.',
    pontosFortes: [
      'Resolução criativa de problemas',
      'Adaptabilidade a contextos',
      'Ideias viáveis',
      'Flexibilidade mental',
    ],
    atencao: [
      'Identifique quando priorizar criatividade versus praticidade',
      'Desenvolva ambos os lados igualmente',
      'Evite mediocridade em ambos',
    ],
    relacoes: 'Consegue tanto surpreender com gestos criativos quanto proporcionar segurança através de consistência.',
    carreira: 'Versátil em diversos ambientes. Consegue tanto inovar quanto executar com eficiência.',
    crescimento: 'Desenvolva autoconsciência sobre preferências situacionais e escolha intencionalmente o melhor approach.',
  },
  'Alto': {
    titulo: 'Imaginação Criativa',
    subtitulo: 'Curiosidade e Originalidade',
    descricao: 'Você tem mente aberta para novas experiências, ideias e perspectivas. Valoriza criatividade, apreciação estética e pensamento independente.',
    pontosFortes: [
      'Criatividade genuína',
      'Pensamento divergente',
      'Curiosidade intelectual',
      'Sensibilidade estética',
    ],
    atencao: [
      'Equilibre ideias com execução',
      'Evite dispersão por muitos interesses',
      'Pratique foco e conclusão',
      'Valorize também o que é tradicional',
    ],
    relacoes: 'Traz novas perspectivas e experiências. Relações nunca são monótonas, mas podem carecer de rotina.',
    carreira: 'Excelente em design, inovação, pesquisa, arte, consultoria criativa. Ambientes que valorizam ideias originais.',
    crescimento: 'Desenvolva disciplina para transformar ideias em realidade. Criatividade sem execução é apenas potencial.',
  },
  'Muito Alto': {
    titulo: 'Visão Visionária',
    subtitulo: 'Originalidade e Intelecto',
    descricao: 'Você tem mente extremamente aberta, com fascínio por ideias complexas, arte, cultura e experiências incomuns. Pensa de formas que desafiam convenções e enxerga possibilidades onde outros não veem.',
    pontosFortes: [
      'Originalidade excepcional',
      'Pensamento sistêmico complexo',
      'Sensibilidade refinada',
      'Visão de longo prazo',
    ],
    atencao: [
      'Transforme ideias em ação concreta',
      'Evite alienação por complexidade excessiva',
      'Pratique comunicação simples',
      'Valorize implementação prática',
    ],
    relacoes: 'Pode ser desafiador de acompanhar. Relações precisam de esforço para tornar visões acessíveis.',
    carreira: 'Natural para pesquisa avançada, arte conceitual, estratégia, inovação disruptiva. Ambientes que toleram ou recompensam não-conformidade.',
    crescimento: 'Encontre colaboradores práticos que possam ajudar a materializar suas visões. Sua mente é um presente - compartilhe-o acessivelmente.',
  },
};

// ============================================
// A - AMABILIDADE
// ============================================

const INTERPRETACOES_A: Record<Faixa, InterpretacaoFator> = {
  'Muito Baixo': {
    titulo: 'Independência Assertiva',
    subtitulo: 'Autonomia e Ceticismo',
    descricao: 'Você prioriza seus próprios interesses e mantém uma postura cética sobre intenções alheias. Prefere honestidade direta a agradar os outros, valorizando autonomia.',
    pontosFortes: [
      'Autenticidade inabalável',
      'Tomada de decisões independente',
      'Honestidade direta',
      'Resistência a manipulação',
    ],
    atencao: [
      'Pratique empatia ativa',
      'Suavize a entrega de críticas',
      'Reconheça quando ajudar é apropriado',
      'Evite cinismo excessivo',
    ],
    relacoes: 'Relacionamentos baseados em honestidade, embora possa parecer frio. Parceiros valorizam sua autenticidade mas podem sentir falta de calor.',
    carreira: 'Bem adaptado para negociação dura, advocacia, auditoria, análise crítica onde objetividade é essencial.',
    crescimento: 'Desenvolva habilidades de colaboração - independência não precisa significar isolamento.',
  },
  'Baixo': {
    titulo: 'Honestidade Direta',
    subtitulo: 'Franqueza e Autonomia',
    descricao: 'Você valoriza a verdade e a competência acima de agradar os outros. Consegue ser cooperativo, mas não hesita em expressar desacordo quando necessário.',
    pontosFortes: [
      'Comunicação honesta',
      'Avaliação crítica objetiva',
      'Autonomia saudável',
      'Confronto construtivo quando necessário',
    ],
    atencao: [
      'Pratique diplomacia na entrega',
      'Reconheça sentimentos dos outros',
      'Evite parecer insensível',
      'Desenvolva paciência',
    ],
    relacoes: 'Parceiros valoriam sua honestidade. Atenção à forma como feedback é entregue pode fortalecer laços.',
    carreira: 'Funciona bem em consultoria, gestão, análise, onde honestidade é valorizada sobre popularidade.',
    crescimento: 'Desenvolva inteligência emocional para complementar sua honestidade - a verdade pode ser gentil.',
  },
  'Médio': {
    titulo: 'Cooperação Equilibrada',
    subtitulo: 'Assertividade e Empatia',
    descricao: 'Você equilibra seus próprios interesses com os dos outros, conseguindo tanto cooperar quanto defender suas posições quando necessário.',
    pontosFortes: [
      'Negociação efetiva',
      'Colaboração quando apropriado',
      'Defesa saudável de limites',
      'Flexibilidade social',
    ],
    atencao: [
      'Seja consistente em limites',
      'Não varie comportamento excessivamente',
      'Comunique intenções claramente',
    ],
    relacoes: 'Versátil em relacionamentos, consegue tanto apoiar quanto ser apoiado. Boa capacidade de resolução de conflitos.',
    carreira: 'Adaptável a diversos ambientes. Consegue tanto liderança colaborativa quanto execução independente.',
    crescimento: 'Desenvolva autoconsciência sobre quando é mais produtivo cooperar versus competir.',
  },
  'Alto': {
    titulo: 'Compaixão Ativa',
    subtitulo: 'Empatia e Cooperação',
    descricao: 'Você valoriza o bem-estar dos outros e tende a ser cooperativo, confiável e atencioso. Naturalmente considera impacto emocional das ações nos outros.',
    pontosFortes: [
      'Empatia genuína',
      'Construção de confiança',
      'Resolução pacífica de conflitos',
      'Apoio emocional natural',
    ],
    atencao: [
      'Não negligencie suas próprias necessidades',
      'Evite ser excessivamente complacente',
      'Aprenda a dizer não',
      'Cuide do burnout por dar muito',
    ],
    relacoes: 'Parceiro atencioso e cuidadoso. Relacionamentos tendem a ser harmoniosos e de suporte mútuo.',
    carreira: 'Excelente em atendimento, recursos humanos, enfermagem, educação, onde empatia é essencial.',
    crescimento: 'Desenvolva assertividade - bondade não significa concordar com tudo. Seus limites são importantes.',
  },
  'Muito Alto': {
    titulo: 'Altruísmo Profundo',
    subtitulo: 'Empatia e Dedicação',
    descricao: 'Você tem compaixão profunda e tende a colocar necessidades dos outros acima das suas. Altamente cooperativo, confiável e orientado para o bem-estar coletivo.',
    pontosFortes: [
      'Cuidado excepcional com outros',
      'Construção de comunidade',
      'Perdão genuíno',
      'Serviço altruísta',
    ],
    atencao: [
      'Cuidado extremo com burnout',
      'Não permita ser explorado',
      'Pratique autocompaixão',
      'Desenvolva discernimento sobre quem ajudar',
    ],
    relacoes: 'Extremamente dedicado aos outros, mas pode negligenciar próprias necessições. Parceiros devem incentivar autocuidado.',
    carreira: 'Natural para enfermagem, terapia, assistência social, trabalho missionário, onde dedicação altruísta é central.',
    crescimento: 'Lembre-se: você não pode dar de um copo vazio. Autocuidado é necessário para sustentar cuidado com outros.',
  },
};

// ============================================
// C - CONSCIENCIOSIDADE
// ============================================

const INTERPRETACOES_C: Record<Faixa, InterpretacaoFator> = {
  'Muito Baixo': {
    titulo: 'Flexibilidade Espontânea',
    subtitulo: 'Adaptação e Liberdade',
    descricao: 'Você vive no momento presente, adaptando-se facilmente a mudanças. Prefere espontaneidade a planejamento rigoroso, trazendo flexibilidade e criatividade situacional.',
    pontosFortes: [
      'Adaptação rápida a mudanças',
      'Pensamento lateral sob pressão',
      'Flexibilidade criativa',
      'Ausência de rigidez',
    ],
    atencao: [
      'Desenvolva sistemas básicos de organização',
      'Cumpra compromissos importantes',
      'Evite procrastinação crônica',
      'Estabeleça prioridades mínimas',
    ],
    relacoes: 'Traz espontaneidade e diversão. Parceiros mais organizados podem compensar áreas de estrutura.',
    carreira: 'Bem adaptado para ambientes dinâmicos, startups, arte, resposta a crises onde flexibilidade é essencial.',
    crescimento: 'Implemente sistemas mínimos de organização - até criativos precisam de alguma estrutura para prosperar.',
  },
  'Baixo': {
    titulo: 'Adaptabilidade Prática',
    subtitulo: 'Flexibilidade com Responsabilidade',
    descricao: 'Você prefere flexibilidade a rigidez, mas consegue ser organizado quando necessário. Equilibra espontaneidade com responsabilidade básica.',
    pontosFortes: [
      'Adaptação a imprevistos',
      'Abordagem relaxada',
      'Capacidade de delegar',
      'Criatividade situacional',
    ],
    atencao: [
      'Estabeleça prazos realistas',
      'Não deixe organização acumular',
      'Crie hábitos básicos de consistência',
    ],
    relacoes: 'Traz leveza aos relacionamentos. Bom parceiro para quem equilibra com mais estrutura.',
    carreira: 'Funciona bem em ambientes colaborativos, criativos, onde rigidez excessiva é desvantagem.',
    crescimento: 'Identifique áreas críticas onde organização é essencial e foque esforços nessas.',
  },
  'Médio': {
    titulo: 'Organização Equilibrada',
    subtitulo: 'Disciplina e Flexibilidade',
    descricao: 'Você equilibra organização com adaptabilidade, conseguindo tanto planejar quanto improvisar quando necessário. Sabe quando ser rigoroso e quando relaxar.',
    pontosFortes: [
      'Planejamento realista',
      'Execução consistente',
      'Adaptação quando necessário',
      'Equilíbrio trabalho-descanso',
    ],
    atencao: [
      'Seja consistente em áreas importantes',
      'Evite oscilação excessiva',
      'Estabeleça prioridades claras',
    ],
    relacoes: 'Consegue tanto planejar juntos quanto ser espontâneo. Boa capacidade de dividir responsabilidades.',
    carreira: 'Versátil em diversos ambientes. Consegue tanto execução disciplinada quanto adaptação criativa.',
    crescimento: 'Desenvolva autoconsciência sobre quando cada approach é mais apropriado.',
  },
  'Alto': {
    titulo: 'Excelência Orientada',
    subtitulo: 'Disciplina e Confiabilidade',
    descricao: 'Você é organizado, responsável e orientado para metas. Valoriza competência, cumpre compromissos e se esforça para fazer bem o que faz.',
    pontosFortes: [
      'Confiabilidade excepcional',
      'Planejamento efetivo',
      'Atenção a detalhes',
      'Persistência diante de obstáculos',
    ],
    atencao: [
      'Evite perfeccionismo paralisante',
      'Permita-se descanso',
      'Não seja excessivamente crítico consigo mesmo',
      'Flexibilidade ocasional é saudável',
    ],
    relacoes: 'Parceiro confiável e responsável. Atenção para não ser excessivamente crítico ou controlador.',
    carreira: 'Excelente em gestão de projetos, medicina, engenharia, finanças, onde precisão e confiabilidade são essenciais.',
    crescimento: 'Lembre-se que "bom o suficiente" às vezes é perfeito. Perfeccionismo excessivo pode levar a burnout.',
  },
  'Muito Alto': {
    titulo: 'Maestria Disciplinada',
    subtitulo: 'Perfeccionismo e Dedicação',
    descricao: 'Você tem controle excepcional sobre impulsos e um forte senso de dever. Extremamente organizado, detalhista e comprometido com excelência em tudo que faz.',
    pontosFortes: [
      'Excelência consistente',
      'Planejamento meticuloso',
      'Autodisciplina excepcional',
      'Confiabilidade absoluta',
    ],
    atencao: [
      'Cuidado extremo com burnout',
      'Evite rigidez excessiva',
      'Permita-se imperfeição ocasional',
      'Relaxe padrões quando apropriado',
    ],
    relacoes: 'Extremamente dedicado e responsável, mas pode ser excessivamente crítico ou rígido. Relaxar é essencial.',
    carreira: 'Natural para cirurgia, advocacia de alto nível, executivo, pesquisa científica, onde excelência é imperativa.',
    crescimento: 'Perfeição é ideal inatingível. Pratique "perfeição seletiva" - reserve excelência máxima para o que realmente importa.',
  },
};

// ============================================
// EXPORT
// ============================================

export const INTERPRETACOES: Record<FatorKey, Record<Faixa, InterpretacaoFator>> = {
  N: INTERPRETACOES_N,
  E: INTERPRETACOES_E,
  O: INTERPRETACOES_O,
  A: INTERPRETACOES_A,
  C: INTERPRETACOES_C,
};

// Helper para obter interpretação
export function getInterpretacao(fator: FatorKey, faixa: Faixa): InterpretacaoFator {
  return INTERPRETACOES[fator][faixa];
}

// Títulos dos fatores
export const FATOR_TITULOS: Record<FatorKey, string> = {
  N: 'Neuroticismo (Estabilidade Emocional)',
  E: 'Extroversão',
  O: 'Abertura à Experiência',
  A: 'Amabilidade',
  C: 'Conscienciosidade',
};

// Cores dos fatores
export const FATOR_CORES: Record<FatorKey, string> = {
  N: '#E74C3C',
  E: '#F39C12',
  O: '#9B59B6',
  A: '#27AE60',
  C: '#3498DB',
};

// Ícones dos fatores
export const FATOR_ICONES: Record<FatorKey, string> = {
  N: '🧠',
  E: '⚡',
  O: '🔮',
  A: '❤️',
  C: '📋',
};
