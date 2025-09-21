import React, { useState } from 'react';
import './KeyboardShortcuts.css';

const KeyboardShortcuts = ({ isVisible, onToggle }) => {

  const shortcuts = [
    {
      category: "Navegação",
      items: [
        { keys: ["↑", "↓"], description: "Navegar no histórico de comandos" },
        { keys: ["Ctrl", "Enter"], description: "Enviar mensagem (alternativo)" },
        { keys: ["Shift", "Enter"], description: "Nova linha no input" }
      ]
    },
    {
      category: "Ações",
      items: [
        { keys: ["Ctrl", "C"], description: "Copiar texto selecionado" },
        { keys: ["Ctrl", "V"], description: "Colar texto" },
        { keys: ["Ctrl", "Z"], description: "Desfazer" },
        { keys: ["Ctrl", "Y"], description: "Refazer" }
      ]
    },
    {
      category: "Interface",
      items: [
        { keys: ["Esc"], description: "Fechar modais/cancelar ações" },
        { keys: ["F11"], description: "Modo tela cheia" },
        { keys: ["Ctrl", "B"], description: "Alternar sidebar" }
      ]
    }
  ];

  const toggleVisibility = () => {
    onToggle();
  };

  return (
    <>
      <button 
        className="keyboard-shortcuts-toggle"
        onClick={toggleVisibility}
        title="Atalhos de teclado (Ctrl + ?)"
      >
        ⌨️
      </button>

      {isVisible && (
        <div className="keyboard-shortcuts-overlay" onClick={toggleVisibility}>
          <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>⌨️ Atalhos de Teclado</h3>
              <button 
                className="close-shortcuts"
                onClick={toggleVisibility}
                title="Fechar"
              >
                ✕
              </button>
            </div>
            
            <div className="shortcuts-content">
              {shortcuts.map((category, index) => (
                <div key={index} className="shortcut-category">
                  <h4>{category.category}</h4>
                  <div className="shortcut-list">
                    {category.items.map((shortcut, itemIndex) => (
                      <div key={itemIndex} className="shortcut-item">
                        <div className="shortcut-keys">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="key">{key}</kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="key-separator">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <span className="shortcut-description">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="shortcuts-footer">
              <p>💡 Pressione <kbd className="key">Ctrl</kbd> + <kbd className="key">?</kbd> para abrir/fechar este painel</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;