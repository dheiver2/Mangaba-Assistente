import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FooterSection.css';

const FooterSection = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section" id="contact">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="brand-name">Mangaba</h3>
            <p className="brand-description">
              Crie agentes de IA especializados de forma simples e intuitiva
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                GitHub
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                LinkedIn
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Produto</h4>
              <ul>
                <li><a href="#features">Recursos</a></li>
                <li><a href="#demo">Demo</a></li>
                <li><a href="#pricing">Preços</a></li>
                <li><button onClick={() => handleNavigation('/app')}>Começar</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Suporte</h4>
              <ul>
                <li><a href="/docs">Documentação</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/contact">Contato</a></li>
                <li><a href="/community">Comunidade</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy">Privacidade</a></li>
                <li><a href="/terms">Termos</a></li>
                <li><a href="/security">Segurança</a></li>
              </ul>
            </div>
          </div>
        </div>



        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Mangaba. Todos os direitos reservados.</p>
            <p>Criando o futuro da IA conversacional</p>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default FooterSection;