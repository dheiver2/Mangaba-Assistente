import React, { useState, useEffect } from 'react';
import './ModelStatusIndicator.css';
import { aiManager } from '../services/aiService';

const ModelStatusIndicator = ({ 
  provider, 
  model, 
  showDetails = false,
  autoRefresh = false,
  refreshInterval = 30000 // 30 segundos
}) => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (provider && model) {
      checkModelStatus();
    }
  }, [provider, model]);

  useEffect(() => {
    let interval;
    if (autoRefresh && provider && model) {
      interval = setInterval(checkModelStatus, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, provider, model]);

  const checkModelStatus = async () => {
    if (!provider || !model) return;

    setLoading(true);
    setError(null);

    try {
      const service = aiManager.getService(provider);
      
      if (service && typeof service.checkModelStatus === 'function') {
        // Usar método específico do serviço se disponível
        const statusResult = await service.checkModelStatus(model);
        setStatus(statusResult.status || 'available');
        setDetails(statusResult.details || null);
      } else {
        // Fallback: tentar fazer uma requisição simples para verificar
        await testModelAvailability(service, model);
      }
      
      setLastCheck(new Date());
    } catch (err) {
      console.error('Erro ao verificar status do modelo:', err);
      setError(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const testModelAvailability = async (service, modelId) => {
    try {
      // Verificar se o serviço está disponível sem fazer chamada à API
      if (service && typeof service.sendMessage === 'function') {
        // Verificar se há chaves de API configuradas (localStorage ou variáveis de ambiente)
        const hasApiKey = localStorage.getItem('gemini_api_key') || 
                         localStorage.getItem('openai_api_key') || 
                         localStorage.getItem('anthropic_api_key') || 
                         localStorage.getItem('cohere_api_key') ||
                         localStorage.getItem('huggingface_api_key') ||
                         import.meta.env.VITE_GEMINI_API_KEY ||
                         import.meta.env.VITE_OPENAI_API_KEY ||
                         import.meta.env.VITE_ANTHROPIC_API_KEY ||
                         import.meta.env.VITE_COHERE_API_KEY ||
                         import.meta.env.VITE_HUGGINGFACE_API_KEY;
        
        if (hasApiKey) {
          setStatus('available');
        } else {
          setStatus('no_api_key');
        }
      } else {
        setStatus('unknown');
      }
    } catch (err) {
      setStatus('error');
      console.error('Erro ao verificar status do modelo:', err);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'available':
        return {
          icon: '✅',
          label: 'Disponível',
          color: '#28a745',
          description: 'Modelo funcionando normalmente'
        };
      case 'unavailable':
        return {
          icon: '❌',
          label: 'Indisponível',
          color: '#dc3545',
          description: 'Modelo não encontrado ou inacessível'
        };
      case 'rate_limited':
        return {
          icon: '⏳',
          label: 'Limite de Taxa',
          color: '#ffc107',
          description: 'Limite de requisições atingido'
        };
      case 'no_api_key':
        return {
          icon: '🔑',
          label: 'Sem Chave API',
          color: '#ffc107',
          description: 'Nenhuma chave de API configurada'
        };
      case 'error':
        return {
          icon: '⚠️',
          label: 'Erro',
          color: '#fd7e14',
          description: error || 'Erro ao verificar status'
        };
      case 'loading':
        return {
          icon: '🔄',
          label: 'Verificando...',
          color: '#6c757d',
          description: 'Verificando disponibilidade do modelo'
        };
      default:
        return {
          icon: '❓',
          label: 'Desconhecido',
          color: '#6c757d',
          description: 'Status não verificado'
        };
    }
  };

  const formatLastCheck = () => {
    if (!lastCheck) return 'Nunca verificado';
    
    const now = new Date();
    const diff = now - lastCheck;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m atrás`;
    } else {
      return `${seconds}s atrás`;
    }
  };

  const statusInfo = getStatusInfo();

  if (!provider || !model) {
    return null;
  }

  return (
    <div className={`model-status-indicator ${showDetails ? 'detailed' : 'compact'}`}>
      <div 
        className={`status-badge status-${status}`}
        style={{ '--status-color': statusInfo.color }}
        title={statusInfo.description}
      >
        <span className="status-icon">
          {loading ? (
            <div className="status-spinner"></div>
          ) : (
            statusInfo.icon
          )}
        </span>
        <span className="status-label">{statusInfo.label}</span>
      </div>

      {showDetails && (
        <div className="status-details">
          <div className="status-info">
            <div className="model-info">
              <span className="provider-name">{provider}</span>
              <span className="model-name">{model}</span>
            </div>
            <div className="status-description">
              {statusInfo.description}
            </div>
            {lastCheck && (
              <div className="last-check">
                Última verificação: {formatLastCheck()}
              </div>
            )}
          </div>
          
          <div className="status-actions">
            <button
              className="refresh-status-btn"
              onClick={checkModelStatus}
              disabled={loading}
              title="Verificar status novamente"
            >
              {loading ? '⟳' : '🔄'}
            </button>
          </div>
        </div>
      )}

      {details && showDetails && (
        <div className="additional-details">
          {details.latency && (
            <div className="detail-item">
              <span className="detail-label">Latência:</span>
              <span className="detail-value">{details.latency}ms</span>
            </div>
          )}
          {details.region && (
            <div className="detail-item">
              <span className="detail-label">Região:</span>
              <span className="detail-value">{details.region}</span>
            </div>
          )}
          {details.version && (
            <div className="detail-item">
              <span className="detail-label">Versão:</span>
              <span className="detail-value">{details.version}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelStatusIndicator;