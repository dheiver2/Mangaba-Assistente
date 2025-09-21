const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { createError } = require('../middleware/errorHandler');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.role = data.role;
    this.isActive = data.is_active;
    this.emailVerified = data.email_verified;
    this.lastLogin = data.last_login;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Criar novo usuário
  static async create({ email, password, firstName, lastName, role = 'user' }) {
    try {
      // Verificar se email já existe
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw createError('Email já está em uso', 409, 'EMAIL_EXISTS');
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Inserir usuário
      const result = await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [email, passwordHash, firstName, lastName, role]);

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Listar todos os usuários (com paginação)
  static async findAll({ page = 1, limit = 10, role = null, search = null }) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        whereClause += ` AND role = $${paramCount}`;
        params.push(role);
      }

      if (search) {
        paramCount++;
        whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      const offset = (page - 1) * limit;
      paramCount++;
      const limitClause = `LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      const offsetClause = `OFFSET $${paramCount}`;
      params.push(offset);

      // Buscar usuários
      const result = await query(`
        SELECT * FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        ${limitClause} ${offsetClause}
      `, params);

      // Contar total
      const countResult = await query(`
        SELECT COUNT(*) as total FROM users ${whereClause}
      `, params.slice(0, -2)); // Remove limit e offset

      const users = result.rows.map(row => new User(row));
      const total = parseInt(countResult.rows[0].total);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar senha
  async verifyPassword(password) {
    try {
      const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [this.id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return await bcrypt.compare(password, result.rows[0].password_hash);
    } catch (error) {
      throw error;
    }
  }

  // Atualizar último login
  async updateLastLogin() {
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [this.id]
      );
      this.lastLogin = new Date();
    } catch (error) {
      throw error;
    }
  }

  // Atualizar dados do usuário
  async update(data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      if (data.firstName !== undefined) {
        paramCount++;
        fields.push(`first_name = $${paramCount}`);
        values.push(data.firstName);
      }

      if (data.lastName !== undefined) {
        paramCount++;
        fields.push(`last_name = $${paramCount}`);
        values.push(data.lastName);
      }

      if (data.email !== undefined) {
        paramCount++;
        fields.push(`email = $${paramCount}`);
        values.push(data.email);
      }

      if (data.role !== undefined) {
        paramCount++;
        fields.push(`role = $${paramCount}`);
        values.push(data.role);
      }

      if (data.isActive !== undefined) {
        paramCount++;
        fields.push(`is_active = $${paramCount}`);
        values.push(data.isActive);
      }

      if (fields.length === 0) {
        return this;
      }

      paramCount++;
      values.push(this.id);

      const result = await query(`
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Alterar senha
  async changePassword(newPassword) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, this.id]
      );
    } catch (error) {
      throw error;
    }
  }

  // Deletar usuário
  async delete() {
    try {
      await query('DELETE FROM users WHERE id = $1', [this.id]);
    } catch (error) {
      throw error;
    }
  }

  // Converter para JSON (sem dados sensíveis)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`,
      role: this.role,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;