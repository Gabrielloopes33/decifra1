-- ================================================
-- MIGRATION 007: FASE 5 - ALTERAR FORMATO DO CÓDIGO
-- ================================================
-- Data: 11/03/2026
-- Descrição: Altera o formato do código de ART-XXXX para DECF-XXXX-XXXX
-- ================================================

-- ================================================
-- 1. AJUSTAR TIPO DA COLUNA CODIGO
-- ================================================

-- Aumentar o tamanho da coluna para suportar o novo formato DECF-XXXX-XXXX
ALTER TABLE codigos ALTER COLUMN codigo TYPE VARCHAR(20);

-- ================================================
-- 2. REMOVER CONSTRAINT ANTIGA
-- ================================================

-- Remover a constraint de formato antigo (ART-XXXX)
ALTER TABLE codigos DROP CONSTRAINT IF EXISTS codigo_formato;

-- ================================================
-- 3. ADICIONAR NOVA CONSTRAINT
-- ================================================

-- Adicionar constraint para o novo formato DECF-XXXX-XXXX
-- Formato: DECF-XXXX-XXXX (onde X são letras maiúsculas ou números, sem I, O, 0, 1)
ALTER TABLE codigos ADD CONSTRAINT codigo_formato 
  CHECK (codigo ~ '^DECF-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$');

-- ================================================
-- 4. ATUALIZAR FUNÇÃO GERADORA DE CÓDIGOS
-- ================================================

CREATE OR REPLACE FUNCTION gerar_codigo_unico()
RETURNS TEXT AS $$
DECLARE
  novo_codigo TEXT;
  codigo_existe BOOLEAN;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Remove I, O, 0, 1 (evita confusão)
  i INTEGER;
BEGIN
  LOOP
    -- Gerar código no formato DECF-XXXX-XXXX
    novo_codigo := 'DECF-';
    
    -- Primeiros 4 caracteres
    FOR i IN 1..4 LOOP
      novo_codigo := novo_codigo || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    novo_codigo := novo_codigo || '-';
    
    -- Últimos 4 caracteres
    FOR i IN 1..4 LOOP
      novo_codigo := novo_codigo || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM codigos WHERE codigo = novo_codigo) INTO codigo_existe;
    
    IF NOT codigo_existe THEN
      RETURN novo_codigo;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 5. ATUALIZAR COMENTÁRIO
-- ================================================

COMMENT ON TABLE codigos IS 'Códigos de acesso DECF-XXXX-XXXX gerados automaticamente após compra na Hotmart';
