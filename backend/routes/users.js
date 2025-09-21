const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// Middleware para todas as rotas (requer autenticação)
router.use(authenticateToken);

// GET /api/users - Listar usuários (apenas admin)
router.get('/', requireAdmin, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role deve ser user ou admin'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Busca deve ter pelo menos 2 caracteres')
], async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Parâmetros inválidos',
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    const { page = 1, limit = 10, role, search } = req.query;

    const result = await User.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search
    });

    res.json({
      message: 'Usuários listados com sucesso',
      data: result.users.map(user => user.toJSON()),
      pagination: result.pagination,
      code: 'USERS_LISTED'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Obter usuário específico
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Usuários normais só podem ver seu próprio perfil
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json({
      message: 'Usuário encontrado',
      user: user.toJSON(),
      code: 'USER_FOUND'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/users - Criar novo usuário (apenas admin)
router.post('/', requireAdmin, [
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
    .withMessage('Sobrenome deve ter entre 2 e 50 caracteres'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role deve ser user ou admin')
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

    const { email, password, firstName, lastName, role = 'user' } = req.body;

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.toJSON(),
      code: 'USER_CREATED'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', [
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
    .withMessage('Email inválido'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role deve ser user ou admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive deve ser boolean')
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

    const { id } = req.params;

    // Verificar permissões
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw createError('Acesso negado', 403, 'ACCESS_DENIED');
    }

    // Usuários normais não podem alterar role ou isActive
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const updatedUser = await user.update(req.body);

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser.toJSON(),
      code: 'USER_UPDATED'
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Não permitir que admin delete a si mesmo
    if (req.user.id === id) {
      throw createError('Não é possível deletar sua própria conta', 400, 'CANNOT_DELETE_SELF');
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    await user.delete();

    res.json({
      message: 'Usuário deletado com sucesso',
      code: 'USER_DELETED'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/toggle-status - Ativar/desativar usuário (apenas admin)
router.put('/:id/toggle-status', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Não permitir que admin desative a si mesmo
    if (req.user.id === id) {
      throw createError('Não é possível alterar o status da sua própria conta', 400, 'CANNOT_MODIFY_SELF');
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const updatedUser = await user.update({ isActive: !user.isActive });

    res.json({
      message: `Usuário ${updatedUser.isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: updatedUser.toJSON(),
      code: 'USER_STATUS_CHANGED'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/stats/overview - Estatísticas dos usuários (apenas admin)
router.get('/stats/overview', requireAdmin, async (req, res, next) => {
  try {
    const { query: dbQuery } = require('../config/database');

    const stats = await dbQuery(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as total_regular_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
      FROM users
    `);

    res.json({
      message: 'Estatísticas obtidas com sucesso',
      stats: stats.rows[0],
      code: 'STATS_RETRIEVED'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;