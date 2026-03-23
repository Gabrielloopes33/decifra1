# Configuração do Supabase para Serviço PDF

## 1. Criar Bucket de Storage

No Dashboard do Supabase:

1. Vá em **Storage** → **New bucket**
2. Nome: `pdfs`
3. **Desmarque** "Public bucket" (vamos controlar via políticas)
4. Clique em **Create bucket**

## 2. Configurar Políticas de Acesso

### Política de Upload (Service Role)

```sql
CREATE POLICY "Service role can upload PDFs"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (
  bucket_id = 'pdfs'
);
```

### Política de Leitura (Usuários Autenticados)

```sql
CREATE POLICY "Users can read own PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pdfs' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM clientes 
    WHERE treinadora_id IN (
      SELECT id FROM treinadoras WHERE auth_user_id = auth.uid()
    )
  )
);
```

### Política de Leitura Pública (Opcional)

Se quiser URLs públicas diretas:

```sql
-- Tornar bucket público via UI primeiro!
CREATE POLICY "PDFs are publicly accessible"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'pdfs');
```

## 3. Obter Service Role Key

1. Vá em **Project Settings** → **API**
2. Copie o **service_role key** (⚠️ Mantenha seguro!)
3. Nunca exponha este key no frontend!

## 4. Configurar CORS (se necessário)

Em **Storage** → **Policies** → **CORS**:```json
{
  "origins": ["https://seu-app.com"],
  "methods": ["GET", "POST"],
  "headers": ["Authorization"]
}
```

## 5. Testar Upload

```bash
curl -X POST 'https://seu-projeto.supabase.co/storage/v1/object/pdfs/test/cliente/teste.pdf' \
  -H 'Authorization: Bearer SUA_SERVICE_KEY' \
  -H 'Content-Type: application/pdf' \
  --data-binary '@/caminho/para/teste.pdf'
```

## 6. Verificar Configuração

```sql
-- Listar buckets
SELECT * FROM storage.buckets;

-- Listar objetos
SELECT * FROM storage.objects WHERE bucket_id = 'pdfs';

-- Verificar políticas
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

## Notas Importantes

- ⚠️ **Nunca** use o `service_role` key no app móvel
- ⚠️ **Sempre** valide permissões no backend antes de gerar PDFs
- 💡 Considere implementar limpeza automática de PDFs antigos
- 💡 Monitore o uso de storage no dashboard da Supabase
