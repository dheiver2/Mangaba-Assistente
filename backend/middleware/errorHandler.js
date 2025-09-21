// Middleware para tratamento centralizado de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: err.errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erro de banco de dados
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      message: 'Dados já existem no sistema',
      code: 'DUPLICATE_DATA'
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      message: 'Referência inválida',
      code: 'INVALID_REFERENCE'
    });
  }

  // Erro customizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code || 'CUSTOM_ERROR'
    });
  }

  // Erro interno do servidor
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Função para criar erros customizados
const createError = (message, statusCode = 500, code = 'CUSTOM_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = createError(
    `Rota ${req.method} ${req.originalUrl} não encontrada`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

module.exports = {
  errorHandler,
  createError,
  notFoundHandler
};