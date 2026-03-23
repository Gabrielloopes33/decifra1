#!/usr/bin/env node
/**
 * Script de teste para o serviço PDF
 * Uso: node scripts/test-pdf.js <resultado_id> <tipo> <token>
 */

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3000';

async function testPDFGeneration() {
  const [, , resultadoId, tipo, token] = process.argv;

  if (!resultadoId || !tipo || !token) {
    console.log(`
Uso: node scripts/test-pdf.js <resultado_id> <tipo> <token>

Exemplo:
  node scripts/test-pdf.js uuid-aqui cliente eyJhbGciOiJIUzI1NiIs...

Variáveis de ambiente:
  PDF_SERVICE_URL - URL do serviço (padrão: http://localhost:3000)
    `);
    process.exit(1);
  }

  if (!['cliente', 'treinadora'].includes(tipo)) {
    console.error('Erro: tipo deve ser "cliente" ou "treinadora"');
    process.exit(1);
  }

  console.log('🧪 Testando serviço PDF...\n');
  console.log(`URL: ${PDF_SERVICE_URL}`);
  console.log(`Resultado ID: ${resultadoId}`);
  console.log(`Tipo: ${tipo}\n`);

  try {
    // Test 1: Health check
    console.log('1️⃣ Testando health check...');
    const healthRes = await fetch(`${PDF_SERVICE_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health:', health);

    // Test 2: Status
    console.log('\n2️⃣ Testando status...');
    const statusRes = await fetch(`${PDF_SERVICE_URL}/api/pdf/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const status = await statusRes.json();
    console.log('✅ Status:', JSON.stringify(status, null, 2));

    // Test 3: Gerar PDF
    console.log('\n3️⃣ Gerando PDF...');
    const startTime = Date.now();
    
    const response = await fetch(`${PDF_SERVICE_URL}/api/pdf/gerar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resultadoId,
        tipo,
        token,
      }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro:', data);
      process.exit(1);
    }

    console.log('✅ PDF gerado com sucesso!');
    console.log(`⏱️  Tempo: ${duration}ms`);
    console.log(`📄 Arquivo: ${data.data.filename}`);
    console.log(`📊 Tamanho: ${(data.data.tamanho / 1024).toFixed(2)} KB`);
    
    if (data.data.url) {
      console.log(`🔗 URL: ${data.data.url}`);
    }

    // Salvar PDF se for base64
    if (data.data.pdf && !data.data.url) {
      const fs = await import('fs');
      const filename = data.data.filename;
      fs.writeFileSync(filename, Buffer.from(data.data.pdf, 'base64'));
      console.log(`💾 PDF salvo: ${filename}`);
    }

    console.log('\n✨ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testPDFGeneration();
