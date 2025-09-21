import React, { useState, useEffect } from 'react';
import './GPTSelector.css';
import { AI_PROVIDERS } from '../services/aiService';

// Ícones SVG nativos

const GPTSelector = ({ currentGPT, onSelectGPT, compact = false }) => {
  const [gpts, setGpts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGPT, setNewGPT] = useState({
    name: '',
    description: '',
    prompt: '',
    preferredProvider: 'gemini'
  });

  // Carregar GPTs do localStorage
  useEffect(() => {
    const savedGPTs = localStorage.getItem('customGPTs');
    if (savedGPTs) {
      setGpts(JSON.parse(savedGPTs));
    } else {
      // GPTs padrão
      const defaultGPTs = [
        {
          id: 'default',
          name: 'Mangaba Assistente',
          description: 'Assistente geral para conversas',
          prompt: 'Você é um assistente útil e amigável.',
          preferredProvider: 'gemini'
        },
        {
          id: 'code-helper',
          name: 'Assistente de Código',
          description: 'Especialista em programação',
          prompt: 'Você é um especialista em programação. Ajude com código, debugging e melhores práticas.',
          preferredProvider: 'openai'
        }
      ];
      setGpts(defaultGPTs);
      localStorage.setItem('customGPTs', JSON.stringify(defaultGPTs));
    }
  }, []);

  const handleCreateGPT = () => {
    if (!newGPT.name.trim()) return;

    const gpt = {
      id: Date.now().toString(),
      ...newGPT,
      createdAt: new Date().toISOString()
    };

    const updatedGPTs = [...gpts, gpt];
    setGpts(updatedGPTs);
    localStorage.setItem('customGPTs', JSON.stringify(updatedGPTs));

    setNewGPT({ name: '', description: '', prompt: '', preferredProvider: 'gemini' });
    setShowCreateForm(false);
  };

  const handleDeleteGPT = (id) => {
    if (id === 'default') return; // Não permitir deletar o padrão

    const updatedGPTs = gpts.filter(gpt => gpt.id !== id);
    setGpts(updatedGPTs);
    localStorage.setItem('customGPTs', JSON.stringify(updatedGPTs));
  };

  const handleSelectGPT = (gpt) => {
    onSelectGPT(gpt);
    setIsOpen(false);
  };

  return (
    <div className={`gpt-selector ${compact ? 'compact' : ''}`}>
      {/* Trigger */}
      <div 
        className="gpt-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-label={`Seletor de modelo GPT - ${currentGPT?.name || 'Nenhum modelo selecionado'}`}
        title={`Trocar modelo GPT (atual: ${currentGPT?.name || 'nenhum'})`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
      >
        <div className="gpt-info-container">
          <svg className="gpt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          {currentGPT && !compact && (
            <div className="current-gpt">
              <span className="gpt-name">{currentGPT.name}</span>
              {currentGPT.description && (
                <span className="gpt-description">{currentGPT.description}</span>
              )}
            </div>
          )}
        </div>
        <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="gpt-selector-overlay" onClick={() => setIsOpen(false)} />
          <div className="gpt-selector-dropdown">
            <div className="gpt-list">
              {gpts.map(gpt => (
                <div 
                  key={gpt.id} 
                  className={`gpt-item ${currentGPT?.id === gpt.id ? 'active' : ''}`}
                  onClick={() => handleSelectGPT(gpt)}
                  role="option"
                  aria-label={`Selecionar modelo ${gpt.name}`}
                  title={`Trocar para modelo ${gpt.name} - ${gpt.description}`}
                  aria-selected={currentGPT?.id === gpt.id}
                  tabIndex={0}
                >
                  <div className="gpt-item-content">
                    <svg className="gpt-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    <div className="gpt-info">
                      <div className="gpt-name">{gpt.name}</div>
                      <div className="gpt-description">{gpt.description}</div>
                      {gpt.preferredProvider && (
                        <div className="gpt-provider">
                          {AI_PROVIDERS[gpt.preferredProvider]?.name || gpt.preferredProvider}
                        </div>
                      )}
                    </div>
                  </div>
                  {gpt.id !== 'default' && (
                    <button 
                      className="delete-gpt-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGPT(gpt.id);
                      }}
                      aria-label={`Excluir modelo ${gpt.name}`}
                      title={`Excluir o modelo personalizado ${gpt.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Formulário para criar novo GPT */}
            <div className="gpt-actions">
              {!showCreateForm ? (
                <button 
                  className="create-gpt-btn"
                  onClick={() => setShowCreateForm(true)}
                  aria-label="Criar novo modelo GPT personalizado"
                  title="Abrir formulário para criar um novo modelo GPT"
                >
                  + Criar Novo GPT
                </button>
              ) : (
                <div className="create-gpt-form">
                  <input
                    type="text"
                    placeholder="Nome do GPT"
                    value={newGPT.name}
                    onChange={(e) => setNewGPT({...newGPT, name: e.target.value})}
                    aria-label="Nome do novo modelo GPT"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={newGPT.description}
                    onChange={(e) => setNewGPT({...newGPT, description: e.target.value})}
                    aria-label="Descrição do novo modelo GPT"
                  />
                  <textarea
                    placeholder="Prompt do sistema"
                    value={newGPT.prompt}
                    onChange={(e) => setNewGPT({...newGPT, prompt: e.target.value})}
                    rows="3"
                    aria-label="Prompt do sistema para o novo modelo GPT"
                  />
                  <select
                    value={newGPT.preferredProvider}
                    onChange={(e) => setNewGPT({...newGPT, preferredProvider: e.target.value})}
                    aria-label="Provedor de IA preferido para o novo modelo"
                  >
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <option key={key} value={key}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewGPT({ name: '', description: '', prompt: '', preferredProvider: 'gemini' });
                      }}
                      aria-label="Cancelar criação do novo modelo GPT"
                    >
                      Cancelar
                    </button>
                    <button 
                      className="save-btn"
                      onClick={handleCreateGPT}
                      disabled={!newGPT.name.trim()}
                      aria-label="Salvar e criar o novo modelo GPT"
                    >
                      Criar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GPTSelector;
