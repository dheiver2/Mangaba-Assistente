import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { Sparkles, Brain, Zap } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleAuthSuccess = (user) => {
    const from = location.state?.from?.pathname || '/app';
    navigate(from, { replace: true });
  };

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="login-page">
      {/* Background com partículas animadas */}
      <div className="login-background">
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="login-container">
        {/* Lado esquerdo - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Brain className="w-12 h-12" />
              </div>
              <h1 className="logo-text">Mangaba Assistente</h1>
              <p className="logo-subtitle">Inteligência Artificial Avançada</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <Sparkles className="w-6 h-6" />
                <div>
                  <h3>IA Multimodal</h3>
                  <p>Processamento de texto, imagem e voz</p>
                </div>
              </div>
              <div className="feature-item">
                <Zap className="w-6 h-6" />
                <div>
                  <h3>Respostas Instantâneas</h3>
                  <p>Performance otimizada e ultra-rápida</p>
                </div>
              </div>
              <div className="feature-item">
                <Brain className="w-6 h-6" />
                <div>
                  <h3>Aprendizado Contínuo</h3>
                  <p>Melhora constantemente suas respostas</p>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Usuários Ativos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Conversas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="login-form-section">
          <div className="form-container">
            {isLogin ? (
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={switchToRegister}
              />
            ) : (
              <RegisterForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={switchToLogin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;