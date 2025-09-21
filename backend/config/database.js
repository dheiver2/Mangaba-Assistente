const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Forçar SSL para Neon
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Evento de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL (Neon)');
});

// Evento de erro
pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
  process.exit(-1);
});

// Função para testar conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('🔗 Teste de conexão bem-sucedido:', result.rows[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Falha no teste de conexão:', err);
    return false;
  }
};

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Erro na query:', { text, error: err.message });
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};