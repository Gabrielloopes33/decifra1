-- ================================================
-- MIGRAÇÃO FASE 5 - EXECUTAR NO SQL EDITOR
-- ================================================
-- Execute este arquivo completo no SQL Editor do Supabase Dashboard

-- ================================================
-- PARTE 1: SISTEMA DE CÓDIGOS + HOTMART
-- ================================================

-- 1. Adicionar campos de rastreabilidade na tabela codigos
ALTER TABLE codigos 
ADD COLUMN IF NOT EXISTS usado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teste_iniciado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teste_completado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compra_id UUID,
ADD COLUMN IF NOT EXISTS hotmart_transaction_id VARCHAR(100);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_codigos_treinadora_usado 
  ON codigos(treinadora_id, usado) 
  WHERE usado = false;

CREATE INDEX IF NOT EXISTS idx_codigos_compra 
  ON codigos(compra_id) 
  WHERE compra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_codigos_hotmart 
  ON codigos(hotmart_transaction_id) 
  WHERE hotmart_transaction_id IS NOT NULL;

-- 3. Criar tabela COMPRAS
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treinadora_id UUID NOT NULL REFERENCES treinadoras(id) ON DELETE CASCADE,
  hotmart_transaction_id VARCHAR(100) UNIQUE NOT NULL,
  hotmart_product_id BIGINT NOT NULL,
  hotmart_product_name VARCHAR(255),
  quantidade_codigos INTEGER NOT NULL CHECK (quantidade_codigos > 0),
  valor_total DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('concluida', 'cancelada', 'pendente')),
  email_enviado BOOLEAN DEFAULT false,
  email_enviado_em TIMESTAMPTZ,
  comprador_email VARCHAR(255),
  comprador_nome VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_treinadora ON compras(treinadora_id);
CREATE INDEX IF NOT EXISTS idx_compras_hotmart ON compras(hotmart_transaction_id);

-- 4. Criar tabela PRODUTOS_HOTMART
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

CREATE INDEX IF NOT EXISTS idx_produtos_hotmart_product_id ON produtos_hotmart(hotmart_product_id);
CREATE INDEX IF NOT EXISTS idx_produtos_hotmart_ativo ON produtos_hotmart(ativo) WHERE ativo = true;

-- 5. Trigger para updated_at
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

DROP TRIGGER IF EXISTS update_produtos_hotmart_updated_at ON produtos_hotmart;
CREATE TRIGGER update_produtos_hotmart_updated_at 
  BEFORE UPDATE ON produtos_hotmart
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Habilitar RLS
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_hotmart ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS
DROP POLICY IF EXISTS "Treinadoras podem ver suas compras" ON compras;
CREATE POLICY "Treinadoras podem ver suas compras"
  ON compras FOR SELECT
  USING (treinadora_id IN (SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Webhook Hotmart pode criar compras" ON compras;
CREATE POLICY "Webhook Hotmart pode criar compras"
  ON compras FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Sistema pode atualizar compras" ON compras;
CREATE POLICY "Sistema pode atualizar compras"
  ON compras FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Produtos hotmart sao publicos para leitura" ON produtos_hotmart;
CREATE POLICY "Produtos hotmart sao publicos para leitura"
  ON produtos_hotmart FOR SELECT USING (ativo = true);

-- 8. Seed de produtos
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
-- PARTE 2: ALTERAR FORMATO DO CÓDIGO
-- ================================================

-- 1. Aumentar tamanho da coluna
ALTER TABLE codigos ALTER COLUMN codigo TYPE VARCHAR(20);

-- 2. Remover constraint antiga se existir
ALTER TABLE codigos DROP CONSTRAINT IF EXISTS codigo_formato;

-- 3. Deletar códigos antigos no formato ART-XXXX (ou converter se quiser preservar)
-- Opção A: Deletar códigos antigos (recomendado para ambiente de teste)
DELETE FROM codigos WHERE codigo ~ '^ART-[0-9]{4}$';

-- Opção B: Se quiser converter em vez de deletar, descomente abaixo e comente o DELETE acima:
-- UPDATE codigos SET codigo = 'DECF-' || substr(codigo, 5, 4) || '-0000' WHERE codigo ~ '^ART-[0-9]{4}$';

-- 4. Adicionar nova constraint (DECF-XXXX-XXXX)
ALTER TABLE codigos ADD CONSTRAINT codigo_formato 
  CHECK (codigo ~ '^DECF-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$');

-- 5. Atualizar função geradora de códigos
CREATE OR REPLACE FUNCTION gerar_codigo_unico()
RETURNS TEXT AS $$
DECLARE
  novo_codigo TEXT;
  codigo_existe BOOLEAN;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  LOOP
    novo_codigo := 'DECF-';
    FOR i IN 1..4 LOOP
      novo_codigo := novo_codigo || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    novo_codigo := novo_codigo || '-';
    FOR i IN 1..4 LOOP
      novo_codigo := novo_codigo || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM codigos WHERE codigo = novo_codigo) INTO codigo_existe;
    IF NOT codigo_existe THEN
      RETURN novo_codigo;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- MIGRAÇÃO CONCLUÍDA!
-- ================================================
