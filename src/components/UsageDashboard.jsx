import React, { useState, useEffect } from 'react';
import './UsageDashboard.css';
import { aiManager } from '../services/aiService';

const UsageDashboard = ({ isOpen, onClose }) => {
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsageData();
    }
  }, [isOpen, timeRange, selectedProvider]);

  const loadUsageData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simular dados de uso (em uma implementação real, isso viria de uma API)
      const mockData = await generateMockUsageData();
      setUsageData(mockData);
    } catch (err) {
      console.error('Erro ao carregar dados de uso:', err);
      setError('Erro ao carregar dados de uso');
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsageData = async () => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const providers = ['openai', 'anthropic', 'cohere', 'huggingface'];
    const data = {};

    providers.forEach(provider => {
      data[provider] = {
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        requests: Math.floor(Math.random() * 1000) + 100,
        tokens: Math.floor(Math.random() * 50000) + 10000,
        cost: (Math.random() * 50 + 5).toFixed(2),
        models: {
          'gpt-4': { requests: 45, tokens: 12000, cost: 15.20 },
          'gpt-3.5-turbo': { requests: 120, tokens: 25000, cost: 8.50 },
          'claude-3': { requests: 30, tokens: 8000, cost: 12.00 }
        },
        dailyUsage: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { weekday: 'short' }),
          requests: Math.floor(Math.random() * 200) + 20,
          tokens: Math.floor(Math.random() * 10000) + 2000
        })),
        status: Math.random() > 0.8 ? 'warning' : 'normal',
        quota: {
          used: Math.floor(Math.random() * 80) + 10,
          limit: 100
        }
      };
    });

    return data;
  };

  const getTotalStats = () => {
    const providers = selectedProvider === 'all' 
      ? Object.keys(usageData) 
      : [selectedProvider];

    return providers.reduce((total, provider) => {
      const data = usageData[provider];
      if (data) {
        total.requests += data.requests;
        total.tokens += data.tokens;
        total.cost += parseFloat(data.cost);
      }
      return total;
    }, { requests: 0, tokens: 0, cost: 0 });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getQuotaStatus = (quota) => {
    const percentage = (quota.used / quota.limit) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'normal';
  };

  if (!isOpen) return null;

  const totalStats = getTotalStats();
  const providers = Object.keys(usageData);

  return (
    <div className="usage-dashboard-overlay">
      <div className="usage-dashboard-modal">
        <div className="usage-dashboard-header">
          <div className="header-info">
            <h3>📊 Dashboard de Uso</h3>
            <p>Monitoramento de consumo de APIs</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="usage-dashboard-content">
          <div className="dashboard-controls">
            <div className="time-range-selector">
              <label>Período:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
              </select>
            </div>

            <div className="provider-selector">
              <label>Provedor:</label>
              <select 
                value={selectedProvider} 
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="provider-select"
              >
                <option value="all">Todos</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>
                    {usageData[provider]?.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="refresh-btn"
              onClick={loadUsageData}
              disabled={loading}
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

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando dados de uso...</p>
            </div>
          ) : (
            <div className="dashboard-data">
              {/* Estatísticas Gerais */}
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">🔢</div>
                  <div className="stat-info">
                    <div className="stat-value">{formatNumber(totalStats.requests)}</div>
                    <div className="stat-label">Requisições</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <div className="stat-value">{formatNumber(totalStats.tokens)}</div>
                    <div className="stat-label">Tokens</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <div className="stat-value">${totalStats.cost.toFixed(2)}</div>
                    <div className="stat-label">Custo</div>
                  </div>
                </div>
              </div>

              {/* Lista de Provedores */}
              <div className="providers-section">
                <h4>Uso por Provedor</h4>
                <div className="providers-list">
                  {(selectedProvider === 'all' ? providers : [selectedProvider]).map(provider => {
                    const data = usageData[provider];
                    if (!data) return null;

                    return (
                      <div key={provider} className="provider-card">
                        <div className="provider-header">
                          <div className="provider-info">
                            <h5>{data.name}</h5>
                            <span className={`status-indicator status-${data.status}`}>
                              {data.status === 'warning' ? '⚠️' : '✅'}
                            </span>
                          </div>
                          <div className="provider-stats">
                            <span className="requests">{formatNumber(data.requests)} req</span>
                            <span className="cost">${data.cost}</span>
                          </div>
                        </div>

                        <div className="quota-section">
                          <div className="quota-info">
                            <span>Quota: {data.quota.used}% de {data.quota.limit}</span>
                          </div>
                          <div className="quota-bar">
                            <div 
                              className={`quota-fill quota-${getQuotaStatus(data.quota)}`}
                              style={{ width: `${(data.quota.used / data.quota.limit) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="usage-chart">
                          <div className="chart-header">
                            <span>Uso nos últimos 7 dias</span>
                          </div>
                          <div className="chart-bars">
                            {data.dailyUsage.map((day, index) => (
                              <div key={index} className="chart-bar">
                                <div 
                                  className="bar-fill"
                                  style={{ 
                                    height: `${(day.requests / Math.max(...data.dailyUsage.map(d => d.requests))) * 100}%` 
                                  }}
                                  title={`${day.date}: ${day.requests} requisições`}
                                ></div>
                                <span className="bar-label">{day.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedProvider !== 'all' && (
                          <div className="models-breakdown">
                            <h6>Uso por Modelo</h6>
                            <div className="models-list">
                              {Object.entries(data.models).map(([model, stats]) => (
                                <div key={model} className="model-stat">
                                  <span className="model-name">{model}</span>
                                  <div className="model-stats">
                                    <span>{stats.requests} req</span>
                                    <span>{formatNumber(stats.tokens)} tokens</span>
                                    <span>${stats.cost}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="usage-dashboard-footer">
          <div className="footer-info">
            <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
          <div className="footer-actions">
            <button className="export-btn">
              📊 Exportar Dados
            </button>
            <button className="close-footer-btn" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;