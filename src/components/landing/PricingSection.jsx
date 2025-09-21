import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingSection.css';

const PricingSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="section-header">
          <h2 className="section-title">
            Preços Simples e Transparentes
          </h2>
          <p className="section-subtitle">
            Use suas próprias chaves API e pague apenas pelo que consumir
          </p>
        </div>

        <div className="pricing-cards">
          {/* Plano Gratuito */}
          <div className="pricing-card free">
            <div className="card-header">
              <div className="plan-icon">🚀</div>
              <h3 className="plan-name">Free</h3>
              <div className="plan-price">
                <span className="price">R$ 0</span>
                <span className="period">/sempre</span>
              </div>
            </div>
            
            <div className="card-content">
              <ul className="features-list">
                <li>✅ Agentes ilimitados</li>
                <li>✅ Todos os modelos de IA</li>
                <li>✅ Interface em português</li>
                <li>✅ Templates prontos</li>
                <li>✅ Histórico completo</li>
              </ul>
              
              <div className="api-costs">
                <p className="cost-note">💰 Custos das APIs (pagos diretamente):</p>
                <div className="cost-examples">
                  <span>Gemini: ~R$ 0,01/1K tokens</span>
                  <span>GPT-4: ~R$ 0,15/1K tokens</span>
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <button className="cta-button primary" onClick={handleGetStarted}>
                Começar Agora
              </button>
              <p className="cta-subtitle">Sem cartão de crédito</p>
            </div>
          </div>

          {/* Plano Premium */}
          <div className="pricing-card premium">
            <div className="popular-badge">⭐ Popular</div>
            <div className="card-header">
              <div className="plan-icon">💎</div>
              <h3 className="plan-name">Pro</h3>
              <div className="plan-price">
                <span className="price">R$ 97</span>
                <span className="period">/mês</span>
              </div>
            </div>
            
            <div className="card-content">
              <ul className="features-list">
                <li>✅ Tudo do plano gratuito</li>
                <li>✅ Suporte prioritário</li>
                <li>✅ Backup na nuvem</li>
                <li>✅ Templates exclusivos</li>
                <li>✅ Análise de performance</li>
                <li>✅ Acesso antecipado</li>
              </ul>
            </div>
            
            <div className="card-footer">
              <button className="cta-button premium-btn" onClick={handleGetStarted}>
                Teste 7 Dias Grátis
              </button>
              <p className="trial-info">Cancele quando quiser</p>
            </div>
          </div>

          {/* Plano Empresarial */}
          <div className="pricing-card enterprise">
            <div className="card-header">
              <div className="plan-icon">🏢</div>
              <h3 className="plan-name">Enterprise</h3>
              <div className="plan-price">
                <span className="price">Sob consulta</span>
              </div>
            </div>
            
            <div className="card-content">
              <ul className="features-list">
                <li>✅ Tudo do plano premium</li>
                <li>✅ Deploy on-premise</li>
                <li>✅ Suporte 24/7</li>
                <li>✅ Customização completa</li>
                <li>✅ SLA garantido</li>
                <li>✅ Treinamento da equipe</li>
              </ul>
            </div>
            
            <div className="card-footer">
              <button className="cta-button enterprise-btn">
                Agendar Demo
              </button>
              <p className="contact-info">Demonstração gratuita</p>
            </div>
          </div>
        </div>

        {/* FAQ Simplificado */}
        <div className="pricing-faq">
          <h3>Dúvidas Frequentes</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Como funcionam as chaves API?</h4>
              <p>Você usa suas próprias chaves dos provedores (Google, OpenAI, etc.) e paga diretamente a eles pelos tokens consumidos.</p>
            </div>
            <div className="faq-item">
              <h4>O plano gratuito tem limitações?</h4>
              <p>Não! Acesso completo para criar agentes ilimitados. Você só paga pelas APIs que usar.</p>
            </div>
            <div className="faq-item">
              <h4>Meus dados estão seguros?</h4>
              <p>Sim! Suas chaves ficam armazenadas localmente no seu navegador. Não enviamos dados para nossos servidores.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;