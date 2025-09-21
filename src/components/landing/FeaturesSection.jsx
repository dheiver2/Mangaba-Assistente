import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const coreFeatures = [
    {
      title: 'Arquitetura Escalável',
      description: 'Infraestrutura robusta que suporta desde projetos pessoais até implementações empresariais de grande escala.'
    },
    {
      title: 'Integração Multiplataforma',
      description: 'Conecte-se aos principais provedores de IA do mercado através de uma interface unificada e consistente.'
    },
    {
      title: 'Controle Granular',
      description: 'Configuração avançada de parâmetros, comportamentos e especializações com precisão profissional.'
    },
    {
      title: 'Segurança Empresarial',
      description: 'Gerenciamento seguro de credenciais com criptografia de ponta e conformidade com padrões internacionais.'
    },
    {
      title: 'Experiência Localizada',
      description: 'Interface nativa em português brasileiro com otimizações culturais e linguísticas específicas.'
    },
    {
      title: 'Implementação Ágil',
      description: 'Metodologia de deploy otimizada para reduzir tempo de implementação e acelerar time-to-market.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">Tecnologia de Vanguarda</h2>
          <p className="section-subtitle">
            Plataforma empresarial para desenvolvimento e implementação de agentes de inteligência artificial
          </p>
        </div>

        <div className="features-grid">
          {coreFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;