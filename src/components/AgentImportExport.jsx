import React, { useState, useRef } from 'react';
import './AgentImportExport.css';
import { aiManager } from '../services/aiService';

const AgentImportExport = ({ isOpen, onClose, onAgentImported }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportData, setExportData] = useState(null);
  const [importData, setImportData] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [includeSettings, setIncludeSettings] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      loadAvailableAgents();
    }
  }, [isOpen]);

  const loadAvailableAgents = async () => {
    setLoading(true);
    try {
      // Simular carregamento de agentes disponíveis
      const agents = [
        {
          id: 'agent-1',
          name: 'Assistente Geral',
          description: 'Assistente para tarefas gerais',
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          settings: {
            temperature: 0.7,
            max_tokens: 1000
          },
          created: new Date('2024-01-15'),
          lastUsed: new Date('2024-01-20')
        },
        {
          id: 'agent-2',
          name: 'Especialista em Código',
          description: 'Assistente especializado em programação',
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          settings: {
            temperature: 0.3,
            max_tokens: 2000
          },
          created: new Date('2024-01-10'),
          lastUsed: new Date('2024-01-22')
        },
        {
          id: 'agent-3',
          name: 'Criativo',
          description: 'Assistente para tarefas criativas',
          provider: 'cohere',
          model: 'command',
          settings: {
            temperature: 0.9,
            max_tokens: 1500
          },
          created: new Date('2024-01-12'),
          lastUsed: new Date('2024-01-21')
        }
      ];
      
      setAvailableAgents(agents);
      setSelectedAgents(agents.map(agent => agent.id));
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
      setError('Erro ao carregar agentes disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const agentsToExport = availableAgents.filter(agent => 
        selectedAgents.includes(agent.id)
      );

      if (agentsToExport.length === 0) {
        setError('Selecione pelo menos um agente para exportar');
        return;
      }

      const exportPayload = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        format: exportFormat,
        includeSettings,
        includeHistory,
        agents: agentsToExport.map(agent => ({
          ...agent,
          settings: includeSettings ? agent.settings : undefined,
          history: includeHistory ? agent.history || [] : undefined
        }))
      };

      let exportContent;
      let fileName;
      let mimeType;

      switch (exportFormat) {
        case 'json':
          exportContent = JSON.stringify(exportPayload, null, 2);
          fileName = `agents_export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        
        case 'yaml':
          // Simulação de conversão para YAML
          exportContent = convertToYAML(exportPayload);
          fileName = `agents_export_${new Date().toISOString().split('T')[0]}.yaml`;
          mimeType = 'text/yaml';
          break;
        
        case 'csv':
          exportContent = convertToCSV(agentsToExport);
          fileName = `agents_export_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        
        default:
          throw new Error('Formato de exportação não suportado');
      }

      setExportData({
        content: exportContent,
        fileName,
        mimeType
      });

      setSuccess(`${agentsToExport.length} agente(s) preparado(s) para exportação`);
    } catch (err) {
      console.error('Erro na exportação:', err);
      setError('Erro ao preparar exportação');
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = () => {
    if (!exportData) return;

    const blob = new Blob([exportData.content], { type: exportData.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!importData.trim()) {
        setError('Cole os dados de importação');
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (parseErr) {
        setError('Dados de importação inválidos. Verifique o formato JSON.');
        return;
      }

      if (!parsedData.agents || !Array.isArray(parsedData.agents)) {
        setError('Formato de dados inválido. Propriedade "agents" não encontrada.');
        return;
      }

      // Validar estrutura dos agentes
      const validAgents = parsedData.agents.filter(agent => {
        return agent.id && agent.name && agent.provider && agent.model;
      });

      if (validAgents.length === 0) {
        setError('Nenhum agente válido encontrado nos dados de importação');
        return;
      }

      // Simular importação
      for (const agent of validAgents) {
        // Aqui seria feita a integração real com o aiManager
        console.log('Importando agente:', agent);
      }

      setSuccess(`${validAgents.length} agente(s) importado(s) com sucesso`);
      
      if (onAgentImported) {
        onAgentImported(validAgents);
      }

      // Recarregar agentes disponíveis
      await loadAvailableAgents();
      
      // Limpar dados de importação
      setImportData('');
      
    } catch (err) {
      console.error('Erro na importação:', err);
      setError('Erro ao importar agentes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.onerror = () => {
      setError('Erro ao ler arquivo');
    };
    reader.readAsText(file);
  };

  const convertToYAML = (data) => {
    // Simulação simples de conversão para YAML
    const yamlLines = [];
    yamlLines.push(`version: "${data.version}"`);
    yamlLines.push(`exportDate: "${data.exportDate}"`);
    yamlLines.push(`format: "${data.format}"`);
    yamlLines.push(`includeSettings: ${data.includeSettings}`);
    yamlLines.push(`includeHistory: ${data.includeHistory}`);
    yamlLines.push('agents:');
    
    data.agents.forEach(agent => {
      yamlLines.push(`  - id: "${agent.id}"`);
      yamlLines.push(`    name: "${agent.name}"`);
      yamlLines.push(`    description: "${agent.description}"`);
      yamlLines.push(`    provider: "${agent.provider}"`);
      yamlLines.push(`    model: "${agent.model}"`);
      if (agent.settings) {
        yamlLines.push('    settings:');
        Object.entries(agent.settings).forEach(([key, value]) => {
          yamlLines.push(`      ${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
        });
      }
    });
    
    return yamlLines.join('\n');
  };

  const convertToCSV = (agents) => {
    const headers = ['ID', 'Nome', 'Descrição', 'Provedor', 'Modelo', 'Criado', 'Último Uso'];
    const rows = [headers.join(',')];
    
    agents.forEach(agent => {
      const row = [
        agent.id,
        `"${agent.name}"`,
        `"${agent.description}"`,
        agent.provider,
        agent.model,
        agent.created.toISOString().split('T')[0],
        agent.lastUsed.toISOString().split('T')[0]
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };

  const toggleAgentSelection = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const selectAllAgents = () => {
    setSelectedAgents(availableAgents.map(agent => agent.id));
  };

  const deselectAllAgents = () => {
    setSelectedAgents([]);
  };

  if (!isOpen) return null;

  return (
    <div className="agent-import-export-overlay">
      <div className="agent-import-export-modal">
        <div className="modal-header">
          <h2>Import/Export de Agentes</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            📤 Exportar
          </button>
          <button
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            📥 Importar
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'export' && (
            <div className="export-section">
              <div className="export-options">
                <div className="option-group">
                  <label>Formato de Exportação:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="format-select"
                  >
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div className="option-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeSettings}
                      onChange={(e) => setIncludeSettings(e.target.checked)}
                    />
                    Incluir configurações
                  </label>
                </div>

                <div className="option-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeHistory}
                      onChange={(e) => setIncludeHistory(e.target.checked)}
                    />
                    Incluir histórico de conversas
                  </label>
                </div>
              </div>

              <div className="agents-selection">
                <div className="selection-header">
                  <h3>Selecionar Agentes ({selectedAgents.length}/{availableAgents.length})</h3>
                  <div className="selection-actions">
                    <button onClick={selectAllAgents} className="select-btn">
                      Selecionar Todos
                    </button>
                    <button onClick={deselectAllAgents} className="select-btn">
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="agents-list">
                  {availableAgents.map(agent => (
                    <div
                      key={agent.id}
                      className={`agent-item ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}
                      onClick={() => toggleAgentSelection(agent.id)}
                    >
                      <div className="agent-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => toggleAgentSelection(agent.id)}
                        />
                      </div>
                      <div className="agent-info">
                        <div className="agent-name">{agent.name}</div>
                        <div className="agent-description">{agent.description}</div>
                        <div className="agent-details">
                          <span className="agent-provider">{agent.provider}</span>
                          <span className="agent-model">{agent.model}</span>
                          <span className="agent-date">
                            Criado: {agent.created.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {exportData && (
                <div className="export-preview">
                  <h3>Preview da Exportação</h3>
                  <div className="preview-info">
                    <span>Arquivo: {exportData.fileName}</span>
                    <span>Tamanho: {(exportData.content.length / 1024).toFixed(1)} KB</span>
                  </div>
                  <textarea
                    value={exportData.content}
                    readOnly
                    className="preview-content"
                    rows={10}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="import-section">
              <div className="import-options">
                <div className="import-methods">
                  <button
                    className="import-method-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Selecionar Arquivo
                  </button>
                  <span className="method-separator">ou</span>
                  <span className="paste-label">Cole os dados abaixo:</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="import-data">
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Cole aqui os dados JSON ou YAML dos agentes..."
                  className="import-textarea"
                  rows={15}
                />
              </div>

              <div className="import-info">
                <h4>Formato Esperado (JSON):</h4>
                <pre className="format-example">
{`{
  "version": "1.0",
  "agents": [
    {
      "id": "agent-1",
      "name": "Nome do Agente",
      "description": "Descrição",
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "settings": {
        "temperature": 0.7,
        "max_tokens": 1000
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="modal-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="modal-success">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          
          {activeTab === 'export' && (
            <>
              <button
                className="export-btn"
                onClick={handleExport}
                disabled={loading || selectedAgents.length === 0}
              >
                {loading ? 'Preparando...' : 'Preparar Exportação'}
              </button>
              {exportData && (
                <button
                  className="download-btn"
                  onClick={downloadExport}
                >
                  📥 Download
                </button>
              )}
            </>
          )}
          
          {activeTab === 'import' && (
            <button
              className="import-btn"
              onClick={handleImport}
              disabled={loading || !importData.trim()}
            >
              {loading ? 'Importando...' : 'Importar Agentes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentImportExport;