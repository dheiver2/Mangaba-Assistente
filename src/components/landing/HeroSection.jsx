import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Mangaba Assistente
            <span className="highlight"> Plataforma de Criação de Agentes de IA</span>
          </h1>
          
          <p className="hero-subtitle">
            Crie, configure e gerencie seus próprios agentes de IA personalizados. 
            Conecte múltiplos provedores como <strong>Google Gemini</strong>, <strong>OpenAI GPT-4</strong>, 
            <strong>Claude</strong>, <strong>Cohere</strong> e <strong>Hugging Face</strong> 
            em uma única plataforma intuitiva.
          </p>

          <div className="hero-features">
            <div className="feature-badge">
              <span>Criação de Agentes Personalizados</span>
            </div>
            <div className="feature-badge">
              <span>Múltiplos Provedores de IA</span>
            </div>
            <div className="feature-badge">
              <span>Interface 100% em Português</span>
            </div>
          </div>

          <div className="hero-cta">
            <button 
              className="btn btn-large cta-primary" 
              onClick={handleGetStarted}
            >
              Criar Meu Primeiro Agente
            </button>
            <button 
              className="btn btn-secondary btn-large cta-secondary"
              onClick={() => document.getElementById('demo').scrollIntoView()}
            >
              Ver Como Funciona
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5+</span>
              <span className="stat-label">Modelos de IA</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Agentes Únicos</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Personalizável</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-header">
              <div className="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="card-title">Mangaba Assistente</span>
            </div>
            <div className="card-content">
              <div className="message-bubble user">
                Quero criar um agente para atendimento ao cliente
              </div>
              <div className="message-bubble ai">
                Perfeito! Vou te ajudar a criar um agente especializado em atendimento. 
                <br />• Configurar personalidade e tom de voz
                <br />• Definir base de conhecimento
                <br />• Integrar com seus sistemas
                <br />• Treinar respostas específicas
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;