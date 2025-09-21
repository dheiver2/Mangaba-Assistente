import React, { useState, useEffect } from 'react';
import './ModelSelector.css';
import { aiManager, AI_PROVIDERS } from '../services/aiService';

const ModelSelector = ({ 
  isOpen, 
  onClose, 
  currentProvider, 
  currentModel, 
  onModelChange 
}) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && currentProvider) {
      loadModels();
    }
  }, [isOpen, currentProvider]);

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const service = aiManager.getService(currentProvider);
      if (service && typeof service.getAvailableModels === 'function') {
        const models = await service.getAvailableModels();
        setAvailableModels(Array.isArray(models) ? models : []);
      } else {
        // Fallback para modelos estáticos
        const provider = AI_PROVIDERS[currentProvider.toUpperCase()];
        if (provider && provider.models) {
          const staticModels = provider.models.map(model => ({
            id: model,
            name: model,
            type: 'static'
          }));
          setAvailableModels(staticModels);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar modelos:', err);
      setError('Erro ao carregar modelos disponíveis');
      
      // Fallback para modelos estáticos em caso de erro
      const provider = AI_PROVIDERS[currentProvider.toUpperCase()];
      if (provider && provider.models) {
        const staticModels = provider.models.map(model => ({
          id: model,
          name: model,
          type: 'static'
        }));
        setAvailableModels(staticModels);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleSave = () => {
    if (selectedModel && onModelChange) {
      onModelChange(selectedModel);
    }
    onClose();
  };

  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getModelTypeIcon = (type) => {
    switch (type) {
      case 'conversational':
        return '💬';
      case 'instruction':
        return '📝';
      case 'code':
        return '💻';
      case 'chat':
        return '🗨️';
      case 'assistant':
        return '🤖';
      default:
        return '🔧';
    }
  };

  const getProviderInfo = () => {
    const provider = AI_PROVIDERS[currentProvider?.toUpperCase()];
    return provider || { name: currentProvider, models: [] };
  };

  if (!isOpen) return null;

  const providerInfo = getProviderInfo();

  return (
    <div className="model-selector-overlay">
      <div className="model-selector-modal">
        <div className="model-selector-header">
          <div className="header-info">
            <h3>🎯 Seleção de Modelo</h3>
            <p className="provider-name">{providerInfo.name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="model-selector-content">
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="model-search"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button 
              className="refresh-btn"
              onClick={loadModels}
              disabled={loading}
              title="Atualizar lista de modelos"
            >
              {loading ? '⟳' : '🔄'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="models-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Carregando modelos disponíveis...</p>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Nenhum modelo encontrado</p>
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div className="models-list">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className={`model-item ${selectedModel === model.id ? 'selected' : ''} ${currentModel === model.id ? 'current' : ''}`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="model-info">
                      <div className="model-header">
                        <span className="model-type-icon">
                          {getModelTypeIcon(model.type)}
                        </span>
                        <h4 className="model-name">{model.name}</h4>
                        {currentModel === model.id && (
                          <span className="current-badge">Atual</span>
                        )}
                      </div>
                      {model.description && (
                        <p className="model-description">{model.description}</p>
                      )}
                      {model.type && (
                        <span className="model-type-label">{model.type}</span>
                      )}
                    </div>
                    <div className="model-actions">
                      {selectedModel === model.id && (
                        <span className="selected-icon">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="model-selector-footer">
          <div className="model-count">
            {filteredModels.length} modelo(s) disponível(is)
          </div>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={!selectedModel || selectedModel === currentModel}
            >
              Selecionar Modelo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;