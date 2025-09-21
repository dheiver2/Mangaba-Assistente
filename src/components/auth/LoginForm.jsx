import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validações básicas
    if (!formData.email || !formData.password) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Por favor, insira um email válido');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="w-full">
      <div className="login-form-card">
        <div className="text-center mb-8">
          <div className="login-form-icon">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="login-form-title">Bem-vindo de volta</h2>
          <p className="login-form-subtitle">Entre na sua conta para continuar</p>
        </div>

        {(error || formError) && (
          <div className="login-form-error">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{formError || error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="form-input-wrapper">
              <div className="form-input-icon">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <div className="form-input-wrapper">
              <div className="form-input-icon">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-submit-button"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="form-switch">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="form-switch-link"
            >
              Registre-se aqui
            </button>
          </p>
        </div>

        <div className="form-demo-credentials">
          <div className="demo-credentials-content">
            <p className="demo-credentials-title">Credenciais de teste (Admin):</p>
            <p><strong>Email:</strong> admin@mangaba.com</p>
            <p><strong>Senha:</strong> Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;