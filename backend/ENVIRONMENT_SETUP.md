# 🔧 Backend - Configuração de Ambientes

## 📋 Variáveis de Ambiente Disponíveis

### 🖥️ Servidor
- `PORT` - Porta do servidor (padrão: 3001)
- `NODE_ENV` - Ambiente Node.js (development/production)
- `HOST` - Host do servidor (localhost para dev, 0.0.0.0 para prod)

### 🗄️ Banco de Dados
- `DATABASE_URL` - String de conexão PostgreSQL completa
- Formato: `postgresql://user:password@host:port/database?sslmode=require`

### 🔐 Autenticação JWT
- `JWT_SECRET` - Chave secreta para assinar tokens JWT
- `JWT_EXPIRES_IN` - Tempo de expiração do token (ex: 24h, 7d)
- `JWT_REFRESH_EXPIRES_IN` - Tempo de expiração do refresh token

### 👤 Admin Padrão
- `ADMIN_EMAIL` - Email do administrador padrão
- `ADMIN_PASSWORD` - Senha do administrador padrão

### 🌐 CORS
- `FRONTEND_URL` - URL principal do frontend
- `ALLOWED_ORIGINS` - URLs permitidas separadas por vírgula

### 🐛 Debug e Logs
- `DEBUG` - Habilita logs de debug (true/false)
- `LOG_LEVEL` - Nível de log (debug, info, warn, error)
- `ENABLE_REQUEST_LOGGING` - Log de requisições HTTP

### 🛡️ Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Janela de tempo em ms
- `RATE_LIMIT_MAX_REQUESTS` - Máximo de requisições por janela

### 🍪 Sessões
- `SESSION_SECRET` - Chave secreta para sessões
- `SESSION_MAX_AGE` - Tempo máximo da sessão em ms

### 📧 Email
- `EMAIL_SERVICE` - Serviço de email (sendgrid, ethereal, etc.)
- `EMAIL_HOST` - Host SMTP
- `EMAIL_PORT` - Porta SMTP
- `EMAIL_USER` - Usuário SMTP
- `EMAIL_PASS` - Senha/API key SMTP
- `EMAIL_FROM` - Email remetente padrão

### 📁 Upload
- `UPLOAD_MAX_SIZE` - Tamanho máximo de upload em bytes
- `UPLOAD_ALLOWED_TYPES` - Tipos MIME permitidos

### 💾 Cache
- `REDIS_URL` - URL de conexão Redis
- `CACHE_TTL` - Time to live do cache em segundos

### 💾 Backup
- `BACKUP_ENABLED` - Habilita backups automáticos
- `BACKUP_INTERVAL` - Intervalo de backup (daily, weekly)
- `BACKUP_RETENTION_DAYS` - Dias para manter backups

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Usar arquivo de desenvolvimento
cp .env.development .env.local

# Rodar em modo desenvolvimento
npm run dev

# Rodar migrações
npm run migrate

# Seed do banco
npm run seed
```

### Produção
```bash
# Verificar configuração
npm run config:check

# Rodar em produção
npm start

# Backup do banco
npm run backup

# Health check
curl http://localhost:3001/api/health
```

## 🔍 Validação de Configuração

O backend valida automaticamente:
- ✅ Conexão com banco de dados
- ✅ Variáveis obrigatórias
- ✅ Formato das URLs
- ✅ Força da senha do admin
- ✅ Configuração de email

## 🚨 Alertas de Segurança

### ⚠️ Desenvolvimento
- Use senhas simples apenas em desenvolvimento
- Mantenha chaves JWT diferentes de produção
- Logs de debug podem expor informações sensíveis

### 🔒 Produção
- **OBRIGATÓRIO**: Use chaves JWT complexas (min. 32 caracteres)
- **OBRIGATÓRIO**: Use senhas fortes para admin
- **OBRIGATÓRIO**: Configure HTTPS
- **OBRIGATÓRIO**: Use rate limiting restritivo
- **RECOMENDADO**: Use Redis para cache
- **RECOMENDADO**: Configure monitoramento

## 📊 Monitoramento

### Health Check
```bash
GET /api/health
```

Retorna:
```json
{
  "status": "ok",
  "environment": "production",
  "database": "connected",
  "uptime": "2h 30m",
  "version": "2.0.0"
}
```

### Métricas (se habilitado)
- Endpoint: `/metrics` (porta 9090)
- Formato: Prometheus
- Inclui: CPU, memória, requisições, erros

---

**🔐 Mantenha suas chaves seguras!**