import React, { useState, useEffect } from 'react';
import './AdvancedSettings.css';

const AdvancedSettings = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    systemPrompt: '',
    autoSave: true,
    showTokenCount: false,
    showAdvanced: false
  });
  
  const [advancedSettings, setAdvancedSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  });

  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('advancedSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          systemPrompt: parsed.systemPrompt || '',
          autoSave: parsed.autoSave !== undefined ? parsed.autoSave : true,
          showTokenCount: parsed.showTokenCount || false,
          showAdvanced: false
        });
        setAdvancedSettings({
          temperature: parsed.temperature || 0.7,
          maxTokens: parsed.maxTokens || 2048,
          topP: parsed.topP || 1.0,
          frequencyPenalty: parsed.frequencyPenalty || 0.0,
          presencePenalty: parsed.presencePenalty || 0.0
        });
      }
    }
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleAdvancedChange = (key, value) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const allSettings = { ...settings, ...advancedSettings };
    localStorage.setItem('advancedSettings', JSON.stringify(allSettings));
    onSave(allSettings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      systemPrompt: '',
      autoSave: true,
      showTokenCount: false,
      showAdvanced: false
    });
    setAdvancedSettings({
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-settings-overlay" onClick={onClose}>
      <div className="advanced-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="advanced-settings-header">
          <h2>Configurações Avançadas</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="advanced-settings-content">
          <div className="settings-section">
            <h3>Configurações Gerais</h3>
            
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
                <span className="checkmark"></span>
                Salvar conversas automaticamente
              </label>
            </div>

            <div className="setting-item">
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

          <div className="settings-section">
            <div className="advanced-toggle">
              <button 
                className="toggle-advanced-btn"
                onClick={() => handleSettingChange('showAdvanced', !settings.showAdvanced)}
              >
                {settings.showAdvanced ? '▼' : '▶'} Parâmetros Avançados do Modelo
              </button>
            </div>
            
            {settings.showAdvanced && (
              <div className="advanced-parameters">
                <div className="setting-item">
                  <label htmlFor="temperature">Temperatura</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={advancedSettings.temperature}
                      onChange={(e) => handleAdvancedChange('temperature', parseFloat(e.target.value))}
                    />
                    <span className="setting-value">{advancedSettings.temperature}</span>
                  </div>
                  <p className="setting-description">
                    Controla a criatividade das respostas.
                  </p>
                </div>

                <div className="setting-item">
                  <label htmlFor="maxTokens">Máximo de Tokens</label>
                  <div className="setting-control">
                    <input
                      type="number"
                      id="maxTokens"
                      min="100"
                      max="8192"
                      value={advancedSettings.maxTokens}
                      onChange={(e) => handleAdvancedChange('maxTokens', parseInt(e.target.value))}
                    />
                  </div>
                  <p className="setting-description">
                    Limite máximo de tokens para as respostas.
                  </p>
                </div>

                <div className="setting-item">
                  <label htmlFor="topP">Top P</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      id="topP"
                      min="0"
                      max="1"
                      step="0.1"
                      value={advancedSettings.topP}
                      onChange={(e) => handleAdvancedChange('topP', parseFloat(e.target.value))}
                    />
                    <span className="setting-value">{advancedSettings.topP}</span>
                  </div>
                  <p className="setting-description">
                    Controla a diversidade das respostas.
                  </p>
                </div>

                <div className="setting-item">
                  <label htmlFor="frequencyPenalty">Penalidade de Frequência</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      id="frequencyPenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={advancedSettings.frequencyPenalty}
                      onChange={(e) => handleAdvancedChange('frequencyPenalty', parseFloat(e.target.value))}
                    />
                    <span className="setting-value">{advancedSettings.frequencyPenalty}</span>
                  </div>
                  <p className="setting-description">
                    Reduz a repetição de palavras.
                  </p>
                </div>

                <div className="setting-item">
                  <label htmlFor="presencePenalty">Penalidade de Presença</label>
                  <div className="setting-control">
                    <input
                      type="range"
                      id="presencePenalty"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={advancedSettings.presencePenalty}
                      onChange={(e) => handleAdvancedChange('presencePenalty', parseFloat(e.target.value))}
                    />
                    <span className="setting-value">{advancedSettings.presencePenalty}</span>
                  </div>
                  <p className="setting-description">
                    Encoraja novos tópicos.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>Prompt do Sistema</h3>
            <div className="setting-item">
              <label htmlFor="systemPrompt">Instruções Personalizadas</label>
              <textarea
                id="systemPrompt"
                value={settings.systemPrompt}
                onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                placeholder="Digite instruções personalizadas para o assistente..."
                rows={4}
              />
              <p className="setting-description">
                Instruções que serão aplicadas a todas as conversas para personalizar o comportamento do assistente.
              </p>
            </div>
          </div>


        </div>
        
        <div className="advanced-settings-footer">
          <button className="reset-btn" onClick={handleReset}>
            Restaurar Padrões
          </button>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="save-btn" onClick={handleSave}>
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;