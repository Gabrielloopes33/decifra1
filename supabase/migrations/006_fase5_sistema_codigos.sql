-- ================================================
-- MIGRATION 006: FASE 5 - SISTEMA DE CÓDIGOS + HOTMART
-- ================================================
-- Data: 11/03/2026
-- Descrição: Adiciona tabelas de compras e produtos, 
--            rastreabilidade de códigos e integração Hotmart
-- ================================================

-- ================================================
-- 1. AJUSTES NA TABELA CODIGOS (Campos de Rastreabilidade)
-- ================================================

-- Adicionar campos de rastreabilidade
ALTER TABLE codigos 
ADD COLUMN IF NOT EXISTS usado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teste_iniciado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teste_completado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compra_id UUID,
ADD COLUMN IF NOT EXISTS hotmart_transaction_id VARCHAR(100);

-- Índices para performance na tabela codigos
CREATE INDEX IF NOT EXISTS idx_codigos_treinadora_usado 
  ON codigos(treinadora_id, usado) 
  WHERE usado = false;

CREATE INDEX IF NOT EXISTS idx_codigos_compra 
  ON codigos(compra_id) 
  WHERE compra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_codigos_hotmart 
  ON codigos(hotmart_transaction_id) 
  WHERE hotmart_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_codigos_usado_em 
  ON codigos(usado_em) 
  WHERE usado_em IS NOT NULL;

-- ================================================
-- 2. NOVA TABELA: COMPRAS
-- ================================================

CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  
  -- Dados Hotmart
  hotmart_transaction_id VARCHAR(100) UNIQUE NOT NULL,
  hotmart_product_id BIGINT NOT NULL,
  hotmart_product_name VARCHAR(255),
  
  -- Detalhes
  quantidade_codigos INTEGER NOT NULL CHECK (quantidade_codigos > 0),
  valor_total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('concluida', 'cancelada', 'pendente')),
  
  -- Email
  email_enviado BOOLEAN DEFAULT false,
  email_enviado_em TIMESTAMPTZ,
  
  -- Dados do comprador (backup)
  comprador_email VARCHAR(255),
  comprador_nome VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para a tabela compras
CREATE INDEX IF NOT EXISTS idx_compras_treinadora 
  ON compras(treinadora_id);

CREATE INDEX IF NOT EXISTS idx_compras_hotmart 
  ON compras(hotmart_transaction_id);

CREATE INDEX IF NOT EXISTS idx_compras_status 
  ON compras(status);

CREATE INDEX IF NOT EXISTS idx_compras_created_at 
  ON compras(created_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_compras_updated_at ON compras;
CREATE TRIGGER update_compras_updated_at 
  BEFORE UPDATE ON compras
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ================================================
-- 3. NOVA TABELA: PRODUTOS_HOTMART
-- ================================================

CREATE TABLE IF NOT EXISTS produtos_hotmart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotmart_product_id BIGINT UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  quantidade_codigos INTEGER NOT NULL CHECK (quantidade_codigos > 0),
  validade_dias INTEGER DEFAULT 30 CHECK (validade_dias > 0),
  preco DECIMAL(10,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para a tabela produtos_hotmart
CREATE INDEX IF NOT EXISTS idx_produtos_hotmart_product_id 
  ON produtos_hotmart(hotmart_product_id);

CREATE INDEX IF NOT EXISTS idx_produtos_hotmart_ativo 
  ON produtos_hotmart(ativo) 
  WHERE ativo = true;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_produtos_hotmart_updated_at ON produtos_hotmart;
CREATE TRIGGER update_produtos_hotmart_updated_at 
  BEFORE UPDATE ON produtos_hotmart
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_hotmart ENABLE ROW LEVEL SECURITY;

-- Políticas para COMPRAS
CREATE POLICY IF NOT EXISTS "Treinadoras podem ver suas compras"
  ON compras FOR SELECT
  USING (
    treinadora_id IN (
      SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Webhook Hotmart pode criar compras"
  ON compras FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Sistema pode atualizar compras"
  ON compras FOR UPDATE
  USING (true);

-- Políticas para PRODUTOS_HOTMART (apenas leitura pública para treinadoras)
CREATE POLICY IF NOT EXISTS "Produtos hotmart sao publicos para leitura"
  ON produtos_hotmart FOR SELECT
  USING (ativo = true);

CREATE POLICY IF NOT EXISTS "Apenas admin pode inserir produtos"
  ON produtos_hotmart FOR INSERT
  WITH CHECK (false); -- Será ajustado quando houver sistema de admin

CREATE POLICY IF NOT EXISTS "Apenas admin pode atualizar produtos"
  ON produtos_hotmart FOR UPDATE
  USING (false); -- Será ajustado quando houver sistema de admin

-- ================================================
-- 5. SEED INICIAL DE PRODUTOS (IDs temporários)
-- ================================================

INSERT INTO produtos_hotmart (hotmart_product_id, nome, descricao, quantidade_codigos, validade_dias, preco, ativo)
VALUES 
  (12345, 'DECIFRA - Pacote 10 Avaliações', 'Pacote com 10 códigos de acesso para avaliações DECIFRA', 10, 30, 97.00, true),
  (12346, 'DECIFRA - Pacote 25 Avaliações', 'Pacote com 25 códigos de acesso para avaliações DECIFRA', 25, 30, 197.00, true),
  (12347, 'DECIFRA - Pacote 50 Avaliações', 'Pacote com 50 códigos de acesso para avaliações DECIFRA', 50, 30, 397.00, true)
ON CONFLICT (hotmart_product_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  quantidade_codigos = EXCLUDED.quantidade_codigos,
  validade_dias = EXCLUDED.validade_dias,
  preco = EXCLUDED.preco,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- ================================================
-- 6. ATUALIZAR COMENTÁRIOS
-- ================================================

COMMENT ON TABLE compras IS 'Registro de compras realizadas na Hotmart';
COMMENT ON TABLE produtos_hotmart IS 'Produtos configurados na Hotmart para geração de códigos';
COMMENT ON COLUMN codigos.usado_em IS 'Data/hora quando o código foi utilizado por uma cliente';
COMMENT ON COLUMN codigos.teste_iniciado_em IS 'Data/hora quando a cliente iniciou o teste';
COMMENT ON COLUMN codigos.teste_completado_em IS 'Data/hora quando a cliente completou o teste';
COMMENT ON COLUMN codigos.compra_id IS 'Referência à compra que gerou este código';
COMMENT ON COLUMN codigos.hotmart_transaction_id IS 'ID da transação na Hotmart para rastreabilidade';
