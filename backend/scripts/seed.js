const bcrypt = require('bcryptjs');
const { query, testConnection } = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Testar conexão
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Falha na conexão com o banco');
    }

    // Verificar se já existe um admin
    const existingAdmin = await query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin já existe no sistema');
      return;
    }

    // Criar admin padrão
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mangaba.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Inserir admin
    const result = await query(`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role
    `, [
      adminEmail,
      passwordHash,
      'Administrador',
      'Sistema',
      'admin',
      true,
      true
    ]);

    const admin = result.rows[0];

    console.log('✅ Admin criado com sucesso!');
    console.log('👤 Dados do admin:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
};

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🎉 Seed finalizado!');
    process.exit(0);
  });
}

module.exports = { seedDatabase };