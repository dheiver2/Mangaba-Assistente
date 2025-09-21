import React, { useState, useEffect } from 'react';
import { AI_PROVIDERS, aiManager } from '../services/aiService.js';
import './UnifiedSettings.css';

const UnifiedSettings = ({ isOpen, onClose, onSave, currentProvider }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    systemPrompt: '',
    autoSave: true,
    showTokenCount: false
  });
  
  const [apiConfigs, setApiConfigs] = useState({});
  const [gpts, setGpts] = useState([]);
  const [newGPT, setNewGPT] = useState({ name: '', description: '', prompt: '' });
  const [showCreateGPT, setShowCreateGPT] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadApiConfigs();
      loadGPTs();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const saved = localStorage.getItem('advancedSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        systemPrompt: parsed.systemPrompt || '',
        autoSave: parsed.autoSave !== undefined ? parsed.autoSave : true,
        showTokenCount: parsed.showTokenCount || false
      });
    }
  };

  const loadApiConfigs = () => {
    const configs = {};
    Object.keys(AI_PROVIDERS).forEach(provider => {
      const key = provider.toLowerCase();
      const saved = localStorage.getItem(`ai_config_${key}`);
      if (saved) {
        configs[key] = JSON.parse(saved);
      }
    });
    setApiConfigs(configs);
  };

  const loadGPTs = () => {
    const saved = localStorage.getItem('customGPTs');
    if (saved) {
      setGpts(JSON.parse(saved));
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApiConfigSave = async (providerId, apiKey, model) => {
    try {
      const config = { model: model || AI_PROVIDERS[providerId.toUpperCase()]?.models[0] };
      await aiManager.addService(providerId, apiKey, config);
      
      const newConfig = { apiKey, model, configured: true };
      setApiConfigs(prev => ({ ...prev, [providerId]: newConfig }));
      localStorage.setItem(`ai_config_${providerId}`, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Erro ao configurar API:', error);
    }
  };

  const handleCreateGPT = () => {
    if (newGPT.name.trim()) {
      const gpt = {
        id: Date.now().toString(),
        ...newGPT,
        createdAt: new Date().toISOString()
      };
      
      const updatedGPTs = [...gpts, gpt];
      setGpts(updatedGPTs);
      localStorage.setItem('customGPTs', JSON.stringify(updatedGPTs));
      
      setNewGPT({ name: '', description: '', prompt: '' });
      setShowCreateGPT(false);
    }
  };

  const handleDeleteGPT = (id) => {
    const updatedGPTs = gpts.filter(gpt => gpt.id !== id);
    setGpts(updatedGPTs);
    localStorage.setItem('customGPTs', JSON.stringify(updatedGPTs));
  };

  const handleSave = () => {
    localStorage.setItem('advancedSettings', JSON.stringify(settings));
    if (onSave) {
      onSave(settings);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="unified-settings-overlay">
      <div className="unified-settings-modal">
        <div className="unified-settings-header">
          <h2>Configurações</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="unified-settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Geral
          </button>
          <button 
            className={`tab-btn ${activeTab === 'apis' ? 'active' : ''}`}
            onClick={() => setActiveTab('apis')}
          >
            APIs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gpts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gpts')}
          >
            GPTs Personalizados
          </button>
        </div>

        <div className="unified-settings-content">
          {activeTab === 'general' && (
            <div className="settings-tab">
              <div className="setting-group">
                <h3>Prompt do Sistema</h3>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                  placeholder="Instruções personalizadas para o assistente..."
                  rows={4}
                />
              </div>

              <div className="setting-group">
                <h3>Preferências</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Salvar conversas automaticamente
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.showTokenCount}
                    onChange={(e) => handleSettingChange('showTokenCount', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Mostrar contagem de tokens
                </label>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="apis-tab">
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => {
                const providerId = key.toLowerCase();
                const config = apiConfigs[providerId];
                
                return (
                  <div key={providerId} className="api-config-item">
                    <div className="api-header">
                      <h3>{provider.name}</h3>
                      <span className={`status ${config?.configured ? 'connected' : 'disconnected'}`}>
                        {config?.configured ? '●' : '○'}
                      </span>
                    </div>
                    
                    <div className="api-form">
                      <input
                        type="password"
                        placeholder="Chave da API"
                        defaultValue={config?.apiKey || ''}
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleApiConfigSave(providerId, e.target.value, config?.model);
                          }
                        }}
                      />
                      
                      <select
                        defaultValue={config?.model || ''}
                        onChange={(e) => {
                          if (config?.apiKey) {
                            handleApiConfigSave(providerId, config.apiKey, e.target.value);
                          }
                        }}
                      >
                        <option value="">Modelo padrão</option>
                        {provider.models.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'gpts' && (
            <div className="gpts-tab">
              <div className="gpts-header">
                <h3>GPTs Personalizados</h3>
                <button 
                  className="create-gpt-btn"
                  onClick={() => setShowCreateGPT(!showCreateGPT)}
                >
                  + Criar GPT
                </button>
              </div>

              {showCreateGPT && (
                <div className="create-gpt-form">
                  <input
                    type="text"
                    placeholder="Nome do GPT"
                    value={newGPT.name}
                    onChange={(e) => setNewGPT(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={newGPT.description}
                    onChange={(e) => setNewGPT(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <textarea
                    placeholder="Prompt do sistema"
                    value={newGPT.prompt}
                    onChange={(e) => setNewGPT(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={3}
                  />
                  <div className="form-actions">
                    <button onClick={() => setShowCreateGPT(false)}>Cancelar</button>
                    <button onClick={handleCreateGPT} className="primary">Criar</button>
                  </div>
                </div>
              )}

              <div className="gpts-list">
                {gpts.map(gpt => (
                  <div key={gpt.id} className="gpt-item">
                    <div className="gpt-info">
                      <h4>{gpt.name}</h4>
                      <p>{gpt.description}</p>
                    </div>
                    <button 
                      className="delete-gpt-btn"
                      onClick={() => handleDeleteGPT(gpt.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="unified-settings-footer">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave} className="primary">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSettings;