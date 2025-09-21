const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validações
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// POST /api/auth/register - Registrar novo usuário
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Criar usuário
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'user'
    });

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.toJSON(),
      token,
      code: 'USER_CREATED'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Fazer login
router.post('/login', authLimiter, loginValidation, async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findByEmail(email);
    if (!user) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      throw createError('Conta desativada', 401, 'ACCOUNT_DISABLED');
    }

    // Verificar senha
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    // Atualizar último login
    await user.updateLastLogin();

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      user: user.toJSON(),
      token,
      code: 'LOGIN_SUCCESS'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Obter dados do usuário logado
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json({
      user: user.toJSON(),
      code: 'USER_DATA'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile - Atualizar perfil do usuário
router.put('/profile', authenticateToken, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
], async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const updatedUser = await user.update(req.body);

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser.toJSON(),
      code: 'PROFILE_UPDATED'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/change-password - Alterar senha
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
], async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar senha atual
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Alterar senha
    await user.changePassword(newPassword);

    res.json({
      message: 'Senha alterada com sucesso',
      code: 'PASSWORD_CHANGED'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout - Logout (opcional, para invalidar token no frontend)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso',
    code: 'LOGOUT_SUCCESS'
  });
});

module.exports = router;