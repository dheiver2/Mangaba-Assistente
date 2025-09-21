import React from 'react';
import './BrazilianFlags.css';

const BrazilianFlags = () => {
  return (
    <div className="brazilian-flags">
      {/* Bandeira do Brasil */}
      <div className="flag-container" title="Brasil">
        <svg viewBox="0 0 60 42" className="flag-svg">
          <rect width="60" height="42" fill="#009639"/>
          <polygon points="30,6 54,21 30,36 6,21" fill="#FEDF00"/>
          <circle cx="30" cy="21" r="8" fill="#002776"/>
          <path d="M24,18 Q30,15 36,18 Q30,24 24,18" fill="#FEDF00" opacity="0.8"/>
        </svg>
      </div>

      {/* Bandeira de Sergipe */}
      <div className="flag-container" title="Sergipe">
        <svg viewBox="0 0 70 42" className="flag-svg">
          {/* 5 faixas horizontais alternadas verde-amarelo */}
          <rect width="70" height="8.4" fill="#009639"/>
          <rect y="8.4" width="70" height="8.4" fill="#FEDF00"/>
          <rect y="16.8" width="70" height="8.4" fill="#009639"/>
          <rect y="25.2" width="70" height="8.4" fill="#FEDF00"/>
          <rect y="33.6" width="70" height="8.4" fill="#009639"/>
          {/* Canton azul (1/4 da bandeira) */}
          <rect x="0" y="0" width="17.5" height="21" fill="#002776"/>
          {/* 5 estrelas brancas formando Cruz de Malta */}
          <polygon points="8.75,4 9.5,6 11.5,6 10,7.5 10.5,9.5 8.75,8.5 7,9.5 7.5,7.5 6,6 8,6" fill="#FFFFFF"/>
          <polygon points="8.75,12 9.5,14 11.5,14 10,15.5 10.5,17.5 8.75,16.5 7,17.5 7.5,15.5 6,14 8,14" fill="#FFFFFF"/>
          <polygon points="4,8 4.75,10 6.75,10 5.25,11.5 5.75,13.5 4,12.5 2.25,13.5 2.75,11.5 1.25,10 3.25,10" fill="#FFFFFF"/>
          <polygon points="13.5,8 14.25,10 16.25,10 14.75,11.5 15.25,13.5 13.5,12.5 11.75,13.5 12.25,11.5 10.75,10 12.75,10" fill="#FFFFFF"/>
          <polygon points="8.75,8 9.5,10 11.5,10 10,11.5 10.5,13.5 8.75,12.5 7,13.5 7.5,11.5 6,10 8,10" fill="#FFFFFF"/>
        </svg>
      </div>

      {/* Bandeira de Alagoas */}
      <div className="flag-container" title="Alagoas">
        <svg viewBox="0 0 70 42" className="flag-svg">
          {/* 3 faixas verticais de mesma largura */}
          <rect x="0" y="0" width="23.33" height="42" fill="#DC143C"/>
          <rect x="23.33" y="0" width="23.33" height="42" fill="#FFFFFF"/>
          <rect x="46.66" y="0" width="23.34" height="42" fill="#002776"/>
          {/* Brasão simplificado no centro da faixa branca */}
          {/* Escudo */}
          <rect x="31" y="14" width="8" height="10" fill="#002776" rx="1"/>
          <rect x="31" y="14" width="4" height="10" fill="#002776"/>
          <rect x="35" y="14" width="4" height="10" fill="#DC143C"/>
          {/* Peixe no campo azul */}
          <ellipse cx="33" cy="17" rx="1.5" ry="0.8" fill="#FFFFFF"/>
          {/* Cana-de-açúcar no campo vermelho */}
          <rect x="36.5" y="16" width="0.5" height="4" fill="#FEDF00"/>
          <rect x="37.5" y="15" width="0.5" height="5" fill="#FEDF00"/>
          {/* Ondas na base */}
           <path d="M31,22 Q33,21 35,22 Q37,23 39,22" stroke="#002776" strokeWidth="0.5" fill="none"/>
          {/* Estrela acima */}
          <polygon points="35,12 35.5,13 36.5,13 35.75,13.75 36,14.75 35,14.25 34,14.75 34.25,13.75 33.5,13 34.5,13" fill="#FFFFFF"/>
        </svg>
      </div>
    </div>
  );
};

export default BrazilianFlags;