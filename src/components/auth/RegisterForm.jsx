import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import './LoginForm.css';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const validatePassword = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Pelo menos 8 caracteres');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Uma letra maiúscula');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Uma letra minúscula');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Um número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Um caractere especial');
    }

    return { score, feedback };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar força da senha
    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }

    // Limpar erro quando usuário começar a digitar
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validações
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Por favor, insira um email válido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (passwordStrength.score < 3) {
      setFormError('A senha deve ser mais forte. Verifique os requisitos abaixo.');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setFormError(result.error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Fraca';
    if (passwordStrength.score <= 3) return 'Média';
    return 'Forte';
  };

  return (
    <div className="login-form-card">
      <div className="text-center mb-8">
        <div className="login-form-icon">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="login-form-title">Criar nova conta</h2>
        <p className="login-form-subtitle">Junte-se ao Mangaba Assistente</p>
      </div>

      {(error || formError) && (
        <div className="login-form-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{formError || error}</p>
        </div>
      )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nome completo
            </label>
            <div className="form-input-wrapper">
              <User className="form-input-icon h-5 w-5" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon h-5 w-5" />
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
              <Lock className="form-input-icon h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <p className="mb-1">A senha deve conter:</p>
                    <ul className="space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar senha
            </label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon h-5 w-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password && (
              <div className="mt-1 flex items-center gap-1">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">As senhas coincidem</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600">As senhas não coincidem</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-submit-button"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Criando conta...
              </div>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className="form-switch">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="form-switch-link"
            >
              Faça login aqui
            </button>
          </p>
        </div>
    </div>
  );
};

export default RegisterForm;