import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import './LandingNavbar.css';

const LandingNavbar = () => {
  const navigate = useNavigate();

  const handleNavigateToApp = () => {
    navigate('/app');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="landing-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Mangaba Assistente</h2>
        </div>
        
        <div className="navbar-menu">
          <button 
            className="nav-link"
            onClick={() => scrollToSection('features')}
          >
            Recursos
          </button>
          <button 
            className="nav-link"
            onClick={() => scrollToSection('demo')}
          >
            Demo
          </button>
          <button 
            className="nav-link"
            onClick={() => scrollToSection('pricing')}
          >
            Preços
          </button>
          <button 
            className="nav-link"
            onClick={() => scrollToSection('contact')}
          >
            Contato
          </button>
        </div>

        <div className="navbar-actions">
          <ThemeToggle size="small" className="navbar-theme-toggle" />
          <button 
            className="btn btn-secondary nav-btn nav-btn-secondary"
            onClick={handleLogin}
          >
            Entrar
          </button>
          <button 
            className="btn nav-btn nav-btn-primary"
            onClick={handleLogin}
          >
            Começar Agora
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;