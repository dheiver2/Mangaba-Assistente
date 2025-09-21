import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const words = ['Agentes de IA', 'Assistentes Virtuais', 'Chatbots Inteligentes', 'Soluções de IA'];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentWord.length) {
          setTypedText(currentWord.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentWord.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typedText, currentWordIndex, isDeleting, words]);

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <section className="hero-section">
      <div className="hero-background-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>
            <span>Nova Era da IA Conversacional</span>
          </div>
          
          <h1 className="hero-title">
            Mangaba Assistente
            <br />
            <span className="highlight">Plataforma de Criação de </span>
            <span className="typed-text">
              {typedText}
              <span className="cursor">|</span>
            </span>
          </h1>
          
          <p className="hero-subtitle">
            🎯 Crie, configure e gerencie seus próprios agentes de IA personalizados com facilidade. 
            <br />
            🔗 Conecte múltiplos provedores como <strong>Google Gemini</strong>, <strong>OpenAI GPT-4</strong>, 
            <strong>Claude</strong>, <strong>Cohere</strong> e <strong>Hugging Face</strong> 
            em uma única plataforma intuitiva e poderosa.
          </p>

          <div className="hero-features">
            <div className="feature-badge">
              <span className="badge-icon">🤖</span>
              <span>Criação de Agentes Personalizados</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">🔗</span>
              <span>Múltiplos Provedores de IA</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">🇧🇷</span>
              <span>Interface 100% em Português</span>
            </div>
          </div>

          <div className="hero-cta">
            <button 
              className="btn btn-large cta-primary pulse-animation" 
              onClick={handleGetStarted}
            >
              <span className="btn-icon">🚀</span>
              Criar Meu Primeiro Agente
              <span className="btn-arrow">→</span>
            </button>
            <button 
              className="btn btn-secondary btn-large cta-secondary hover-lift"
              onClick={() => document.getElementById('demo').scrollIntoView()}
            >
              <span className="btn-icon">▶️</span>
              Ver Como Funciona
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat hover-scale">
              <div className="stat-icon">🤖</div>
              <span className="stat-number">5+</span>
              <span className="stat-label">Modelos de IA</span>
            </div>
            <div className="stat hover-scale">
              <div className="stat-icon">∞</div>
              <span className="stat-number">Ilimitados</span>
              <span className="stat-label">Agentes Únicos</span>
            </div>
            <div className="stat hover-scale">
              <div className="stat-icon">⚡</div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Personalizável</span>
            </div>
          </div>

          <div className="hero-trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <span>Dados Seguros</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⚡</span>
              <span>Resposta Instantânea</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🌟</span>
              <span>Qualidade Premium</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card main-card">
            <div className="card-header">
              <div className="card-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="card-title">
                <span className="title-icon">🤖</span>
                Mangaba Assistente
              </span>
              <div className="card-status">
                <span className="status-indicator online"></span>
                <span>Online</span>
              </div>
            </div>
            <div className="card-content">
              <div className="message-bubble user">
                <div className="message-avatar">👤</div>
                <div className="message-text">
                  Quero criar um agente para atendimento ao cliente
                </div>
                <div className="message-time">14:32</div>
              </div>
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="message-bubble ai">
                <div className="message-avatar ai-avatar">🤖</div>
                <div className="message-text">
                  Perfeito! Vou te ajudar a criar um agente especializado em atendimento. 
                  <br />
                  <div className="feature-list">
                    <div className="feature-item">✨ Configurar personalidade e tom de voz</div>
                    <div className="feature-item">📚 Definir base de conhecimento</div>
                    <div className="feature-item">🔗 Integrar com seus sistemas</div>
                    <div className="feature-item">🎯 Treinar respostas específicas</div>
                  </div>
                </div>
                <div className="message-time">14:33</div>
              </div>
            </div>
            <div className="card-footer">
              <div className="input-preview">
                <span className="input-placeholder">Digite sua mensagem...</span>
                <div className="input-actions">
                  <span className="action-icon">📎</span>
                  <span className="action-icon">😊</span>
                  <span className="action-icon send">➤</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="floating-elements">
            <div className="floating-badge badge-1">
              <span className="badge-icon">⚡</span>
              <span>Resposta Rápida</span>
            </div>
            <div className="floating-badge badge-2">
              <span className="badge-icon">🎯</span>
              <span>Alta Precisão</span>
            </div>
            <div className="floating-badge badge-3">
              <span className="badge-icon">🔒</span>
              <span>100% Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;