import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AI_PROVIDERS, aiManager } from '../services/aiService.js';
import './AISelector.css';

const AISelector = ({ currentProvider, onProviderChange, onConfigureAPI, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeServices, setActiveServices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const dropdownRef = useRef(null);

  // Atualiza serviços ativos
  const updateActiveServices = useCallback(() => {
    const services = aiManager.getActiveServices();
    setActiveServices(services);
  }, []);

  // Checa status de conexão
  const checkConnectionStatus = useCallback(async () => {
    const status = {};
    const services = aiManager.getActiveServices();

    for (const serviceId of services) {
      try {
        const service = aiManager.getService(serviceId);
        status[serviceId] = service?.isReady() ? 'connected' : 'disconnected';
      } catch (error) {
        status[serviceId] = 'error';
      }
    }
    setConnectionStatus(status);
  }, []);

  useEffect(() => {
    updateActiveServices();
    checkConnectionStatus();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [updateActiveServices, checkConnectionStatus]);

  const handleProviderSelect = (providerId) => {
    if (activeServices.includes(providerId)) {
      onProviderChange?.(providerId);
      setIsOpen(false);
    } else {
      onConfigureAPI?.(providerId, false);
      setIsOpen(false);
    }
  };

  // Ícone de status (conectado/desconectado)
  const getStatusIcon = (providerId) => {
    const status = connectionStatus[providerId];
    if (status === 'connected') {
      return (
        <svg viewBox="0 0 24 24" className="status-icon connected">
          <circle cx="12" cy="12" r="10" />
          <polyline points="9,12 12,15 16,9" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" className="status-icon disconnected">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    );
  };

  // Ícone por provedor
  const getProviderIcon = (providerId) => {
    const iconProps = {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "provider-icon"
    };

    switch (providerId) {
      case 'openai':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case 'anthropic':
        return (
          <svg {...iconProps}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="7.5,8 12,5 16.5,8"/>
            <polyline points="7.5,16 12,19 16.5,16"/>
          </svg>
        );
      case 'gemini':
        return (
          <svg {...iconProps}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        );
      case 'cohere':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'huggingface':
        return (
          <svg {...iconProps}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
        );
    }
  };

  const normalizedProvider = currentProvider?.toLowerCase();
  const currentProviderName = AI_PROVIDERS[normalizedProvider]?.name || 'Selecionar IA';

  return (
    <div className={`ai-selector ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <button 
        className={`ai-selector-trigger ${isOpen ? 'open' : ''} ${compact ? 'compact' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Provedor atual: ${currentProviderName}`}
        aria-label={`Seletor de IA - ${currentProviderName}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="provider-info">
          {getProviderIcon(normalizedProvider)}
          {!compact && <span className="ai-selector-text">{currentProviderName}</span>}
        </span>
        <span className="ai-selector-status">
          {getStatusIcon(normalizedProvider)}
        </span>
        <svg className="ai-selector-arrow" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="ai-selector-dropdown" role="listbox">
          <div className="ai-selector-list">
            {Object.entries(AI_PROVIDERS).map(([key, provider]) => {
              const providerId = key.toLowerCase();
              const isActive = activeServices.includes(providerId);
              const isCurrent = normalizedProvider === providerId;
              
              return (
                <div
                  key={providerId}
                  className={`ai-selector-item ${isCurrent ? 'current' : ''} ${isActive ? 'active' : 'inactive'}`}
                  onClick={() => handleProviderSelect(providerId)}
                  aria-label={`Selecionar ${provider.name}`}
                  role="option"
                  aria-selected={isCurrent}
                  title={`Trocar para ${provider.name}`}
                >
                  <div className="provider-item-info">
                    {getProviderIcon(providerId)}
                    <span className="ai-selector-item-name">{provider.name}</span>
                  </div>
                  <span className="ai-selector-item-status">
                    {getStatusIcon(providerId)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISelector;
