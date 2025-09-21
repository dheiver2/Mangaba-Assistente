const { query, testConnection } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');

    // Testar conexão primeiro
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Falha na conexão com o banco');
    }

    // Criar extensão para UUID (se não existir)
    await query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Criar tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices para performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
    `);

    // Criar tabela de sessões (opcional, para controle de sessões)
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índice para sessões
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
    `);

    // Criar trigger para atualizar updated_at automaticamente
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Migração concluída com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - users (usuários do sistema)');
    console.log('   - user_sessions (controle de sessões)');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

// Executar migração se chamado diretamente
if (require.main === module) {
  createTables().then(() => {
    console.log('🎉 Migração finalizada!');
    process.exit(0);
  });
}

module.exports = { createTables };