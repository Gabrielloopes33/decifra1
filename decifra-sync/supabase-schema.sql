-- ================================================
-- SCHEMA SUPABASE - IPIP-NEO-120 APP (DECIFRA)
-- ================================================

-- Habilitar extensoes necessarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABELAS
-- ================================================

-- 1. TREINADORAS
CREATE TABLE treinadoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  creditos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_treinadoras_email ON treinadoras(email);
CREATE INDEX idx_treinadoras_auth_user_id ON treinadoras(auth_user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treinadoras_updated_at BEFORE UPDATE ON treinadoras
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. CLIENTES (created before codigos to avoid circular ref)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT,
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_andamento', 'completo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clientes_treinadora_id ON clientes(treinadora_id);
CREATE INDEX idx_clientes_status ON clientes(status);

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. CODIGOS
CREATE TABLE codigos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  valido_ate TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT codigo_formato CHECK (codigo ~ '^ART-[0-9]{4}$')
);

CREATE INDEX idx_codigos_codigo ON codigos(codigo);
CREATE INDEX idx_codigos_treinadora_id ON codigos(treinadora_id);
CREATE INDEX idx_codigos_valido_ate ON codigos(valido_ate);

-- Add codigo_id to clientes after codigos table exists
ALTER TABLE clientes ADD COLUMN codigo_id UUID REFERENCES codigos(id) ON DELETE CASCADE;
CREATE INDEX idx_clientes_codigo_id ON clientes(codigo_id);

-- 4. RESPOSTAS
CREATE TABLE respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  questao_id INTEGER NOT NULL CHECK (questao_id >= 1 AND questao_id <= 120),
  resposta INTEGER NOT NULL CHECK (resposta >= 1 AND resposta <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cliente_id, questao_id)
);

CREATE INDEX idx_respostas_cliente_id ON respostas(cliente_id);

-- 5. RESULTADOS
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID UNIQUE NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  scores_facetas JSONB NOT NULL,
  scores_fatores JSONB NOT NULL,
  percentis JSONB NOT NULL,
  classificacoes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resultados_cliente_id ON resultados(cliente_id);

-- 6. PROTOCOLOS
CREATE TABLE protocolos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faceta TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('baixo', 'medio', 'alto')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  exercicios JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(faceta, tipo)
);

CREATE INDEX idx_protocolos_faceta ON protocolos(faceta);
CREATE INDEX idx_protocolos_tipo ON protocolos(tipo);

-- 7. PROTOCOLOS RECOMENDADOS
CREATE TABLE protocolos_recomendados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resultado_id UUID NOT NULL REFERENCES resultados(id) ON DELETE CASCADE,
  protocolo_id UUID NOT NULL REFERENCES protocolos(id) ON DELETE CASCADE,
  prioridade INTEGER NOT NULL CHECK (prioridade >= 1 AND prioridade <= 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(resultado_id, protocolo_id)
);

CREATE INDEX idx_protocolos_recomendados_resultado_id ON protocolos_recomendados(resultado_id);
CREATE INDEX idx_protocolos_recomendados_prioridade ON protocolos_recomendados(prioridade);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE treinadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocolos_recomendados ENABLE ROW LEVEL SECURITY;

-- TREINADORAS
CREATE POLICY "Treinadoras podem ver seus dados"
  ON treinadoras FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Treinadoras podem atualizar seus dados"
  ON treinadoras FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Inserir treinadora no cadastro"
  ON treinadoras FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- CODIGOS
CREATE POLICY "Treinadoras podem ver seus codigos"
  ON codigos FOR SELECT
  USING (
    treinadora_id IN (
      SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Treinadoras podem criar codigos"
  ON codigos FOR INSERT
  WITH CHECK (
    treinadora_id IN (
      SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Acesso publico para validar codigo"
  ON codigos FOR SELECT
  USING (NOT usado AND valido_ate > NOW());

CREATE POLICY "Atualizar codigo quando usado"
  ON codigos FOR UPDATE
  USING (true);

-- CLIENTES
CREATE POLICY "Treinadoras podem ver seus clientes"
  ON clientes FOR SELECT
  USING (
    treinadora_id IN (
      SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Clientes podem se registrar"
  ON clientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem ver seus dados"
  ON clientes FOR SELECT
  USING (true);

CREATE POLICY "Clientes podem atualizar status"
  ON clientes FOR UPDATE
  USING (true);

-- RESPOSTAS
CREATE POLICY "Clientes podem criar respostas"
  ON respostas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem ver suas respostas"
  ON respostas FOR SELECT
  USING (true);

CREATE POLICY "Treinadoras podem ver respostas de clientes"
  ON respostas FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE treinadora_id IN (
        SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RESULTADOS
CREATE POLICY "Clientes podem criar resultados"
  ON resultados FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem ver seus resultados"
  ON resultados FOR SELECT
  USING (true);

CREATE POLICY "Treinadoras podem ver resultados"
  ON resultados FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE treinadora_id IN (
        SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
      )
    )
  );

-- PROTOCOLOS
CREATE POLICY "Protocolos sao publicos"
  ON protocolos FOR SELECT
  USING (true);

-- PROTOCOLOS RECOMENDADOS
CREATE POLICY "Clientes podem criar recomendacoes"
  ON protocolos_recomendados FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem ver recomendacoes"
  ON protocolos_recomendados FOR SELECT
  USING (true);

CREATE POLICY "Treinadoras podem ver recomendacoes de clientes"
  ON protocolos_recomendados FOR SELECT
  USING (
    resultado_id IN (
      SELECT id FROM resultados WHERE cliente_id IN (
        SELECT id FROM clientes WHERE treinadora_id IN (
          SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- ================================================
-- FUNCOES AUXILIARES
-- ================================================

CREATE OR REPLACE FUNCTION gerar_codigo_unico()
RETURNS TEXT AS $$
DECLARE
  novo_codigo TEXT;
  codigo_existe BOOLEAN;
BEGIN
  LOOP
    novo_codigo := 'ART-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM codigos WHERE codigo = novo_codigo) INTO codigo_existe;
    IF NOT codigo_existe THEN
      RETURN novo_codigo;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEED INICIAL (Protocolos)
-- ================================================

INSERT INTO protocolos (faceta, tipo, titulo, descricao, exercicios) VALUES
  ('N1', 'alto', 'Gerenciamento de Ansiedade', 'Tecnicas para reduzir niveis elevados de ansiedade',
   '["Pratica diaria de respiracao 4-7-8", "Journaling de preocupacoes", "Exercicio fisico regular"]'),
  ('N1', 'medio', 'Equilibrio Emocional', 'Manter niveis saudaveis de ansiedade',
   '["Meditacao mindfulness 10min/dia", "Check-in emocional diario", "Tecnicas de grounding"]'),
  ('N1', 'baixo', 'Atencao Plena as Emocoes', 'Desenvolver maior consciencia emocional',
   '["Check-in emocional 3x ao dia", "Identificar gatilhos emocionais", "Praticar validacao de emocoes"]'),
  ('E1', 'baixo', 'Desenvolvimento de Cordialidade', 'Fortalecer conexoes sociais',
   '["Iniciar 3 conversas por dia", "Praticar escuta ativa", "Expressar gratidao regularmente"]'),
  ('E1', 'medio', 'Manutencao Social', 'Equilibrar interacoes sociais',
   '["Manter contato regular com amigos", "Participar de eventos sociais", "Praticar empatia"]'),
  ('E1', 'alto', 'Equilibrio Social', 'Manter energia em interacoes',
   '["Estabelecer limites sociais", "Praticar tempo sozinho", "Qualidade sobre quantidade"]');

COMMENT ON TABLE treinadoras IS 'Profissionais que aplicam o teste';
COMMENT ON TABLE codigos IS 'Codigos de acesso ART-XXXX gerados pelas treinadoras';
COMMENT ON TABLE clientes IS 'Pessoas que realizam o teste usando um codigo';
COMMENT ON TABLE respostas IS '120 respostas do teste IPIP-NEO-120';
COMMENT ON TABLE resultados IS 'Scores calculados (30 facetas + 5 fatores)';
COMMENT ON TABLE protocolos IS '90 protocolos comportamentais (3 por faceta)';
COMMENT ON TABLE protocolos_recomendados IS 'Protocolos recomendados para cada cliente';
