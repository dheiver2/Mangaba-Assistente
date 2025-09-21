import React, { useState, useEffect } from 'react';
import './ProviderSpecificSettings.css';
import { aiManager } from '../services/aiService';

const ProviderSpecificSettings = ({ isOpen, onClose, provider }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const providerConfigs = {
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      color: '#10a37f',
      tabs: {
        general: {
          name: 'Geral',
          settings: [
            { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 2, step: 0.1, default: 0.7 },
            { key: 'max_tokens', label: 'Max Tokens', type: 'number', min: 1, max: 4096, default: 1000 },
            { key: 'top_p', label: 'Top P', type: 'range', min: 0, max: 1, step: 0.1, default: 1 },
            { key: 'frequency_penalty', label: 'Frequency Penalty', type: 'range', min: -2, max: 2, step: 0.1, default: 0 },
            { key: 'presence_penalty', label: 'Presence Penalty', type: 'range', min: -2, max: 2, step: 0.1, default: 0 }
          ]
        },
        advanced: {
          name: 'Avançado',
          settings: [
            { key: 'stream', label: 'Stream Response', type: 'boolean', default: true },
            { key: 'logit_bias', label: 'Logit Bias', type: 'textarea', default: '{}' },
            { key: 'user', label: 'User ID', type: 'text', default: '' },
            { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 1000, max: 60000, default: 30000 }
          ]
        },
        models: {
          name: 'Modelos',
          settings: [
            { key: 'default_model', label: 'Modelo Padrão', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'], default: 'gpt-3.5-turbo' },
            { key: 'fallback_model', label: 'Modelo Fallback', type: 'select', options: ['gpt-3.5-turbo', 'gpt-4'], default: 'gpt-3.5-turbo' },
            { key: 'vision_model', label: 'Modelo para Visão', type: 'select', options: ['gpt-4-vision-preview', 'gpt-4'], default: 'gpt-4-vision-preview' }
          ]
        }
      }
    },
    anthropic: {
      name: 'Anthropic',
      icon: '🧠',
      color: '#d97706',
      tabs: {
        general: {
          name: 'Geral',
          settings: [
            { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 1, step: 0.1, default: 0.7 },
            { key: 'max_tokens', label: 'Max Tokens', type: 'number', min: 1, max: 100000, default: 1000 },
            { key: 'top_p', label: 'Top P', type: 'range', min: 0, max: 1, step: 0.1, default: 1 },
            { key: 'top_k', label: 'Top K', type: 'number', min: 1, max: 40, default: 40 }
          ]
        },
        advanced: {
          name: 'Avançado',
          settings: [
            { key: 'stream', label: 'Stream Response', type: 'boolean', default: true },
            { key: 'stop_sequences', label: 'Stop Sequences', type: 'textarea', default: '[]' },
            { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 1000, max: 60000, default: 30000 }
          ]
        },
        models: {
          name: 'Modelos',
          settings: [
            { key: 'default_model', label: 'Modelo Padrão', type: 'select', options: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'], default: 'claude-3-sonnet-20240229' },
            { key: 'fallback_model', label: 'Modelo Fallback', type: 'select', options: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'], default: 'claude-3-haiku-20240307' }
          ]
        }
      }
    },
    cohere: {
      name: 'Cohere',
      icon: '🔮',
      color: '#8b5cf6',
      tabs: {
        general: {
          name: 'Geral',
          settings: [
            { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 5, step: 0.1, default: 0.75 },
            { key: 'max_tokens', label: 'Max Tokens', type: 'number', min: 1, max: 4096, default: 1000 },
            { key: 'k', label: 'Top K', type: 'number', min: 0, max: 500, default: 0 },
            { key: 'p', label: 'Top P', type: 'range', min: 0, max: 1, step: 0.01, default: 0.75 }
          ]
        },
        advanced: {
          name: 'Avançado',
          settings: [
            { key: 'stream', label: 'Stream Response', type: 'boolean', default: false },
            { key: 'frequency_penalty', label: 'Frequency Penalty', type: 'range', min: 0, max: 1, step: 0.1, default: 0 },
            { key: 'presence_penalty', label: 'Presence Penalty', type: 'range', min: 0, max: 1, step: 0.1, default: 0 },
            { key: 'end_sequences', label: 'End Sequences', type: 'textarea', default: '[]' }
          ]
        },
        models: {
          name: 'Modelos',
          settings: [
            { key: 'default_model', label: 'Modelo Padrão', type: 'select', options: ['command', 'command-light', 'command-nightly'], default: 'command' },
            { key: 'embed_model', label: 'Modelo Embedding', type: 'select', options: ['embed-english-v3.0', 'embed-multilingual-v3.0'], default: 'embed-english-v3.0' }
          ]
        }
      }
    },
    huggingface: {
      name: 'Hugging Face',
      icon: '🤗',
      color: '#ff6b35',
      tabs: {
        general: {
          name: 'Geral',
          settings: [
            { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 2, step: 0.1, default: 1.0 },
            { key: 'max_new_tokens', label: 'Max New Tokens', type: 'number', min: 1, max: 2048, default: 250 },
            { key: 'top_p', label: 'Top P', type: 'range', min: 0, max: 1, step: 0.1, default: 0.95 },
            { key: 'top_k', label: 'Top K', type: 'number', min: 1, max: 100, default: 50 }
          ]
        },
        advanced: {
          name: 'Avançado',
          settings: [
            { key: 'do_sample', label: 'Do Sample', type: 'boolean', default: true },
            { key: 'repetition_penalty', label: 'Repetition Penalty', type: 'range', min: 1, max: 2, step: 0.1, default: 1.1 },
            { key: 'return_full_text', label: 'Return Full Text', type: 'boolean', default: false },
            { key: 'wait_for_model', label: 'Wait for Model', type: 'boolean', default: true }
          ]
        },
        models: {
          name: 'Modelos',
          settings: [
            { key: 'default_model', label: 'Modelo Padrão', type: 'text', default: 'microsoft/DialoGPT-medium' },
            { key: 'custom_endpoint', label: 'Endpoint Customizado', type: 'text', default: '' }
          ]
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && provider) {
      loadSettings();
    }
  }, [isOpen, provider]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const service = aiManager.getService(provider);
      if (service && typeof service.getSettings === 'function') {
        const providerSettings = await service.getSettings();
        setSettings(providerSettings || {});
      } else {
        // Carregar configurações do localStorage como fallback
        const savedSettings = localStorage.getItem(`ai_settings_${provider}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          // Usar configurações padrão
          const defaultSettings = {};
          const config = providerConfigs[provider];
          if (config) {
            Object.values(config.tabs).forEach(tab => {
              tab.settings.forEach(setting => {
                defaultSettings[setting.key] = setting.default;
              });
            });
          }
          setSettings(defaultSettings);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const service = aiManager.getService(provider);
      if (service && typeof service.updateSettings === 'function') {
        await service.updateSettings(settings);
      } else {
        // Salvar no localStorage como fallback
        localStorage.setItem(`ai_settings_${provider}`, JSON.stringify(settings));
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    const config = providerConfigs[provider];
    if (config) {
      const defaultSettings = {};
      Object.values(config.tabs).forEach(tab => {
        tab.settings.forEach(setting => {
          defaultSettings[setting.key] = setting.default;
        });
      });
      setSettings(defaultSettings);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSettingInput = (setting) => {
    const value = settings[setting.key] ?? setting.default;
    
    switch (setting.type) {
      case 'range':
        return (
          <div className="setting-input-group">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value))}
              className="setting-range"
            />
            <span className="setting-value">{value}</span>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            min={setting.min}
            max={setting.max}
            value={value}
            onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
            className="setting-input"
          />
        );
      
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="setting-input"
            placeholder={setting.placeholder}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="setting-textarea"
            rows={3}
            placeholder={setting.placeholder}
          />
        );
      
      case 'boolean':
        return (
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="setting-select"
          >
            {setting.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen || !provider) return null;

  const config = providerConfigs[provider];
  if (!config) {
    return (
      <div className="provider-settings-overlay">
        <div className="provider-settings-modal">
          <div className="settings-header">
            <h2>Provedor não suportado</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <p>Configurações não disponíveis para este provedor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-settings-overlay">
      <div className="provider-settings-modal">
        <div className="settings-header">
          <div className="provider-info">
            <span className="provider-icon">{config.icon}</span>
            <h2>Configurações - {config.name}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="settings-loading">
            <div className="loading-spinner"></div>
            <p>Carregando configurações...</p>
          </div>
        ) : (
          <>
            <div className="settings-tabs">
              {Object.entries(config.tabs).map(([tabKey, tab]) => (
                <button
                  key={tabKey}
                  className={`tab-btn ${activeTab === tabKey ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="settings-content">
              {config.tabs[activeTab] && (
                <div className="settings-section">
                  {config.tabs[activeTab].settings.map(setting => (
                    <div key={setting.key} className="setting-item">
                      <div className="setting-label">
                        <label>{setting.label}</label>
                        {setting.description && (
                          <span className="setting-description">{setting.description}</span>
                        )}
                      </div>
                      <div className="setting-control">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="settings-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="settings-success">
                <span className="success-icon">✅</span>
                Configurações salvas com sucesso!
              </div>
            )}

            <div className="settings-actions">
              <button
                className="reset-btn"
                onClick={resetSettings}
                disabled={saving}
              >
                Restaurar Padrões
              </button>
              <div className="action-group">
                <button
                  className="cancel-btn"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="save-btn"
                  onClick={saveSettings}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderSpecificSettings;