import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoSection.css';

const DemoSection = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('chat');

  const demoTypes = [
    {
      id: 'chat',
      title: 'Chat Inteligente',
      icon: '💬',
      description: 'Converse com agentes especializados'
    },
    {
      id: 'code',
      title: 'Geração de Código',
      icon: '⚡',
      description: 'Crie código automaticamente'
    },
    {
      id: 'analysis',
      title: 'Análise de Dados',
      icon: '📊',
      description: 'Analise documentos e imagens'
    }
  ];

  const handleTryNow = () => {
    navigate('/app');
  };

  return (
    <section className="demo-section" id="demo">
      <div className="demo-container">
        <div className="section-header">
          <h2 className="section-title">
            Experimente o Mangaba
          </h2>
          <p className="section-subtitle">
            Veja como é simples criar e usar agentes de IA especializados
          </p>
        </div>

        <div className="demo-content">
          <div className="demo-tabs">
            {demoTypes.map((demo) => (
              <button
                key={demo.id}
                className={`demo-tab ${activeDemo === demo.id ? 'active' : ''}`}
                onClick={() => setActiveDemo(demo.id)}
              >
                <span className="tab-icon">{demo.icon}</span>
                <div className="tab-content">
                  <span className="tab-title">{demo.title}</span>
                  <span className="tab-description">{demo.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="demo-preview">
            <div className="demo-card">
              {activeDemo === 'chat' && (
                <div className="demo-content-card">
                  <div className="demo-header">
                    <h3>💬 Chat com IA</h3>
                    <p>Converse naturalmente com agentes especializados</p>
                  </div>
                  <div className="demo-example">
                    <div className="message-example user-msg">
                      <span>Como criar uma API REST em Python?</span>
                    </div>
                    <div className="message-example ai-msg">
                      <span>Vou te ajudar! Aqui está um exemplo usando FastAPI...</span>
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === 'code' && (
                <div className="demo-content-card">
                  <div className="demo-header">
                    <h3>⚡ Geração de Código</h3>
                    <p>Crie código automaticamente com IA</p>
                  </div>
                  <div className="demo-example">
                    <div className="code-preview">
                      <div className="code-header">
                        <span>exemplo.py</span>
                      </div>
                      <pre><code>{`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`}</code></pre>
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === 'analysis' && (
                <div className="demo-content-card">
                  <div className="demo-header">
                    <h3>📊 Análise de Dados</h3>
                    <p>Analise documentos e extraia insights</p>
                  </div>
                  <div className="demo-example">
                    <div className="analysis-preview">
                      <div className="analysis-item">
                        <span className="analysis-label">Documento:</span>
                        <span className="analysis-value">Relatório de Vendas Q4</span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Insights:</span>
                        <span className="analysis-value">Crescimento de 23% no período</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="demo-cta">
          <h3>Comece agora mesmo</h3>
          <p>Crie seu primeiro agente de IA em minutos</p>
          <button className="cta-button" onClick={handleTryNow}>
            Experimentar Grátis
          </button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;