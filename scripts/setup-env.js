#!/usr/bin/env node

/**
 * Script para configurar ambientes de desenvolvimento e produção
 * Uso: node scripts/setup-env.js [development|production]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2] || 'development';

if (!['development', 'production'].includes(environment)) {
  console.error('❌ Ambiente inválido. Use: development ou production');
  process.exit(1);
}

console.log(`🔧 Configurando ambiente: ${environment}`);

// Caminhos dos arquivos
const frontendEnvSource = path.join(__dirname, '..', `.env.${environment}`);
const frontendEnvTarget = path.join(__dirname, '..', '.env.local');

const backendEnvSource = path.join(__dirname, '..', 'backend', `.env.${environment}`);
const backendEnvTarget = path.join(__dirname, '..', 'backend', '.env.local');

try {
  // Frontend
  if (fs.existsSync(frontendEnvSource)) {
    fs.copyFileSync(frontendEnvSource, frontendEnvTarget);
    console.log(`✅ Frontend: Copiado ${frontendEnvSource} → ${frontendEnvTarget}`);
  } else {
    console.warn(`⚠️  Frontend: Arquivo ${frontendEnvSource} não encontrado`);
  }

  // Backend
  if (fs.existsSync(backendEnvSource)) {
    fs.copyFileSync(backendEnvSource, backendEnvTarget);
    console.log(`✅ Backend: Copiado ${backendEnvSource} → ${backendEnvTarget}`);
  } else {
    console.warn(`⚠️  Backend: Arquivo ${backendEnvSource} não encontrado`);
  }

  console.log(`\n🎉 Ambiente ${environment} configurado com sucesso!`);
  
  if (environment === 'production') {
    console.log('\n⚠️  IMPORTANTE para produção:');
    console.log('1. Edite os arquivos .env.local com valores reais');
    console.log('2. Configure as variáveis no seu provedor de hospedagem');
    console.log('3. Nunca commite arquivos .env.local');
  }

  console.log('\n🚀 Para iniciar os servidores:');
  console.log('Frontend: npm run dev');
  console.log('Backend: cd backend && npm run dev');

} catch (error) {
  console.error('❌ Erro ao configurar ambiente:', error.message);
  process.exit(1);
}