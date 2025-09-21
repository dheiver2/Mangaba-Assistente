# Mangaba Backend

Backend da aplicação Mangaba com autenticação JWT e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados (Neon)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js 16+ 
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- npm ou yarn

## ⚙️ Configuração

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Banco PostgreSQL (Neon)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Configurações JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Configurações do Admin Padrão
ADMIN_EMAIL=admin@mangaba.com
ADMIN_PASSWORD=Admin123!

# Configurações CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar banco de dados

#### Criar banco no Neon:
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma nova conta/projeto
3. Copie a connection string
4. Cole no arquivo `.env` na variável `DATABASE_URL`

#### Executar migrações:
```bash
npm run migrate
```

#### Popular com admin padrão:
```bash
npm run seed
```

### 4. Iniciar servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 API Endpoints

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/register` | Registrar usuário | ❌ |
| POST | `/login` | Fazer login | ❌ |
| GET | `/me` | Dados do usuário logado | ✅ |
| PUT | `/profile` | Atualizar perfil | ✅ |
| PUT | `/change-password` | Alterar senha | ✅ |
| POST | `/logout` | Logout | ✅ |

### Usuários (`/api/users`)

| Método | Endpoint | Descrição | Auth | Admin |
|--------|----------|-----------|------|-------|
| GET | `/` | Listar usuários | ✅ | ✅ |
| GET | `/:id` | Obter usuário | ✅ | ❌* |
| POST | `/` | Criar usuário | ✅ | ✅ |
| PUT | `/:id` | Atualizar usuário | ✅ | ❌* |
| DELETE | `/:id` | Deletar usuário | ✅ | ✅ |
| PUT | `/:id/toggle-status` | Ativar/desativar | ✅ | ✅ |
| GET | `/stats/overview` | Estatísticas | ✅ | ✅ |

*Usuários podem acessar apenas seus próprios dados

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status do servidor |

## 🔐 Autenticação

### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "MinhaSenh@123",
  "firstName": "João",
  "lastName": "Silva"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "MinhaSenh@123"
}
```

### Usar token
```bash
Authorization: Bearer SEU_JWT_TOKEN
```

## 👤 Admin Padrão

Após executar o seed, será criado um admin com:
- **Email:** admin@mangaba.com
- **Senha:** Admin123!

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login!

## 🛡️ Segurança

- **Rate limiting** - 100 req/15min geral, 5 req/15min para auth
- **Helmet** - Headers de segurança
- **CORS** - Configurado para frontend
- **Validação** - express-validator
- **Hash de senhas** - bcryptjs com salt 12
- **JWT** - Tokens com expiração

## 📊 Estrutura do Banco

### Tabela `users`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (ENUM: 'user', 'admin')
- is_active (BOOLEAN)
- email_verified (BOOLEAN)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela `user_sessions`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- token_hash (VARCHAR)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `VALIDATION_ERROR` | Dados inválidos |
| `EMAIL_EXISTS` | Email já cadastrado |
| `INVALID_CREDENTIALS` | Login/senha incorretos |
| `ACCOUNT_DISABLED` | Conta desativada |
| `USER_NOT_FOUND` | Usuário não encontrado |
| `ACCESS_DENIED` | Acesso negado |
| `TOKEN_EXPIRED` | Token expirado |
| `INVALID_TOKEN` | Token inválido |
| `TOO_MANY_ATTEMPTS` | Muitas tentativas |

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar servidor
npm run dev        # Servidor com nodemon
npm run migrate    # Executar migrações
npm run seed       # Popular banco com admin
```

## 📝 Logs

O servidor registra:
- Todas as requisições (morgan)
- Erros detalhados
- Queries do banco (em desenvolvimento)
- Eventos de conexão

## 🌐 Deploy

Para produção:
1. Configure `NODE_ENV=production`
2. Use um JWT_SECRET forte
3. Configure SSL no PostgreSQL
4. Use um reverse proxy (nginx)
5. Configure logs externos
6. Monitore performance

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do servidor
- Teste a conexão com `/api/health`
- Confirme as variáveis de ambiente
- Verifique a conexão com o banco