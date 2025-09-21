import React, { useState, useEffect } from 'react';
import './GPTManager.css';
import { AI_PROVIDERS } from '../services/aiService';

const GPTManager = ({ onSelectGPT, currentGPT, onClose }) => {
  const [gpts, setGpts] = useState([]);
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
    onClose();
  };

  return (
    <div className="gpt-manager-overlay">
      <div className="gpt-manager">
        <div className="gpt-manager-header">
          <h2>Gerenciar GPTs</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="gpt-manager-content">
          <div className="gpts-list">
            {gpts.map(gpt => (
              <div 
                key={gpt.id} 
                className={`gpt-card ${currentGPT?.id === gpt.id ? 'active' : ''}`}
                onClick={() => handleSelectGPT(gpt)}
              >
                <div className="gpt-info">
                  <h3>{gpt.name}</h3>
                  <p>{gpt.description}</p>
                  {gpt.preferredProvider && (
                    <div className="gpt-provider">
                      <span className="provider-badge">
                        {AI_PROVIDERS[gpt.preferredProvider]?.name || gpt.preferredProvider}
                      </span>
                    </div>
                  )}
                </div>
                {gpt.id !== 'default' && (
                  <button 
                    className="delete-gpt-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGPT(gpt.id);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {!showCreateForm ? (
            <button 
              className="create-gpt-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Criar Novo GPT
            </button>
          ) : (
            <div className="create-gpt-form">
              <h3>Criar Novo GPT</h3>
              
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  value={newGPT.name}
                  onChange={(e) => setNewGPT({...newGPT, name: e.target.value})}
                  placeholder="Nome do GPT"
                />
              </div>

              <div className="form-group">
                <label>Descrição:</label>
                <input
                  type="text"
                  value={newGPT.description}
                  onChange={(e) => setNewGPT({...newGPT, description: e.target.value})}
                  placeholder="Breve descrição"
                />
              </div>



              <div className="form-group">
                <label>Prompt do Sistema:</label>
                <textarea
                  value={newGPT.prompt}
                  onChange={(e) => setNewGPT({...newGPT, prompt: e.target.value})}
                  placeholder="Defina como este GPT deve se comportar..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Provedor de IA Preferido:</label>
                <select
                  value={newGPT.preferredProvider}
                  onChange={(e) => setNewGPT({...newGPT, preferredProvider: e.target.value})}
                >
                  {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                    <option key={key} value={key}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGPT({ name: '', description: '', prompt: '', preferredProvider: 'gemini' });
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={handleCreateGPT}
                  disabled={!newGPT.name.trim()}
                >
                  Criar GPT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPTManager;