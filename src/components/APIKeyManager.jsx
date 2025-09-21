import React, { useState, useEffect } from 'react';
import { AI_PROVIDERS, aiManager } from '../services/aiService';
import './APIKeyManager.css';

const APIKeyManager = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Carregar chaves salvas do localStorage
    const savedKeys = {};
    Object.keys(AI_PROVIDERS).forEach(provider => {
      const key = localStorage.getItem(`${provider.toLowerCase()}_api_key`);
      if (key) {
        savedKeys[provider.toLowerCase()] = key;
      }
    });
    setApiKeys(savedKeys);
  }, []);

  const handleKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
    setHasChanges(true);
    
    // Limpar resultado de teste anterior
    if (testResults[provider]) {
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[provider];
        return newResults;
      });
    }
  };

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const testConnection = async (provider) => {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: 'Chave de API não fornecida' }
      }));
      return;
    }

    setTestingProvider(provider);
    try {
      // Tentar adicionar o serviço temporariamente para teste
      await aiManager.addService(provider, apiKey);
      const service = aiManager.getService(provider);
      
      if (service && await service.isReady()) {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: true, message: 'Conexão bem-sucedida!' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: false, message: 'Falha na conexão' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: error.message || 'Erro na conexão' }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const saveKeys = () => {
    Object.entries(apiKeys).forEach(([provider, key]) => {
      if (key.trim()) {
        localStorage.setItem(`${provider}_api_key`, key.trim());
        // Adicionar serviço ao aiManager
        try {
          aiManager.addService(provider, key.trim());
        } catch (error) {
          console.warn(`Erro ao adicionar serviço ${provider}:`, error);
        }
      } else {
        localStorage.removeItem(`${provider}_api_key`);
        // Remover serviço do aiManager
        try {
          aiManager.removeService(provider);
        } catch (error) {
          console.warn(`Erro ao remover serviço ${provider}:`, error);
        }
      }
    });
    setHasChanges(false);
  };

  const clearKey = (provider) => {
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });
    setHasChanges(true);
    
    // Limpar resultado de teste
    if (testResults[provider]) {
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[provider];
        return newResults;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="api-key-manager-overlay">
      <div className="api-key-manager">
        <div className="api-manager-header">
          <h3>🔐 Configuração de API Keys</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="api-manager-content">
          <p className="api-manager-description">
            Configure suas chaves de API para usar diferentes provedores de IA. 
            As chaves são armazenadas localmente no seu navegador.
          </p>
          
          <div className="providers-grid">
            {Object.entries(AI_PROVIDERS).map(([key, provider]) => {
              const providerId = key.toLowerCase();
              const hasKey = apiKeys[providerId];
              const testResult = testResults[providerId];
              const isTesting = testingProvider === providerId;
              
              return (
                <div key={providerId} className="provider-config">
                  <div className="provider-header">
                    <div className="provider-info">
                      <h4>{provider.name}</h4>
                      <span className="provider-models">
                        {provider.models.slice(0, 2).join(', ')}
                        {provider.models.length > 2 && ` +${provider.models.length - 2}`}
                      </span>
                    </div>
                    <div className="provider-status">
                      {hasKey && (
                        <span className={`status-badge ${testResult?.success ? 'success' : testResult?.success === false ? 'error' : 'configured'}`}>
                          {testResult?.success ? '✓' : testResult?.success === false ? '✗' : '🔑'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="api-key-input-group">
                    <div className="input-wrapper">
                      <input
                        type={showKeys[providerId] ? 'text' : 'password'}
                        placeholder={`Chave de API do ${provider.name}`}
                        value={apiKeys[providerId] || ''}
                        onChange={(e) => handleKeyChange(providerId, e.target.value)}
                        className="api-key-input"
                      />
                      <div className="input-actions">
                        {apiKeys[providerId] && (
                          <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => toggleShowKey(providerId)}
                            title={showKeys[providerId] ? 'Ocultar' : 'Mostrar'}
                          >
                            {showKeys[providerId] ? '👁️' : '👁️‍🗨️'}
                          </button>
                        )}
                        {apiKeys[providerId] && (
                          <button
                            type="button"
                            className="test-connection"
                            onClick={() => testConnection(providerId)}
                            disabled={isTesting}
                            title="Testar conexão"
                          >
                            {isTesting ? '⏳' : '🔍'}
                          </button>
                        )}
                        {apiKeys[providerId] && (
                          <button
                            type="button"
                            className="clear-key"
                            onClick={() => clearKey(providerId)}
                            title="Limpar chave"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {testResult && (
                      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                  
                  <div className="provider-help">
                    <a 
                      href={getProviderDocsUrl(providerId)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="docs-link"
                    >
                      📚 Como obter a chave
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="api-manager-footer">
          <div className="footer-info">
            <span className="security-note">
              🔒 Suas chaves são armazenadas apenas localmente
            </span>
          </div>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
              onClick={saveKeys}
              disabled={!hasChanges}
            >
              {hasChanges ? 'Salvar Alterações' : 'Salvo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// URLs de documentação para cada provedor
const getProviderDocsUrl = (provider) => {
  const urls = {
    gemini: 'https://ai.google.dev/tutorials/setup',
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/account/keys',
    cohere: 'https://dashboard.cohere.ai/api-keys',
    huggingface: 'https://huggingface.co/settings/tokens'
  };
  return urls[provider] || '#';
};

export default APIKeyManager;