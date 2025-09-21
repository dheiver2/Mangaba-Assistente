import React, { useState, useEffect } from 'react';
import agentService from '../services/agentService';
import './AgentModal.css';

const AgentModal = ({ isOpen, onClose, activeAgent, onAgentChange }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', prompt: '', color: '#6366f1' });

  useEffect(() => {
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  const loadAgents = () => {
    const availableAgents = agentService.getAllAgents();
    setAgents(availableAgents);
    setSelectedAgent(activeAgent);
  };

  const handleActivateAgent = (agent) => {
    agentService.activateAgent(agent.id);
    onAgentChange(agent);
    onClose();
  };

  const handleDeactivateAgent = () => {
    agentService.deactivateAgent();
    onAgentChange(null);
    onClose();
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    if (newAgent.name && newAgent.prompt) {
      const agent = agentService.createCustomAgent(newAgent.name, newAgent.prompt, newAgent.color);
      loadAgents();
      setNewAgent({ name: '', prompt: '', color: '#6366f1' });
      setShowCreateForm(false);
    }
  };

  const handleDeleteAgent = (agentId) => {
    agentService.deleteCustomAgent(agentId);
    loadAgents();
    if (activeAgent?.id === agentId) {
      handleDeactivateAgent();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="agent-modal-overlay" onClick={onClose}>
      <div className="agent-modal" onClick={(e) => e.stopPropagation()}>
        <div className="agent-modal-header">
          <h3>Gestão de Agentes</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="agent-modal-content">
          {activeAgent && (
            <div className="current-agent">
              <h4>Agente Ativo</h4>
              <div className="agent-card active">
                <div className="agent-color" style={{ backgroundColor: activeAgent.color }}></div>
                <div className="agent-info">
                  <strong>{activeAgent.name}</strong>
                  <p>{activeAgent.prompt.substring(0, 80)}...</p>
                </div>
                <button className="deactivate-btn" onClick={handleDeactivateAgent}>
                  Desativar
                </button>
              </div>
            </div>
          )}

          <div className="agents-list">
            <h4>Agentes Disponíveis</h4>
            {agents.map(agent => (
              <div key={agent.id} className={`agent-card ${agent.id === selectedAgent?.id ? 'selected' : ''}`}>
                <div className="agent-color" style={{ backgroundColor: agent.color }}></div>
                <div className="agent-info">
                  <strong>{agent.name}</strong>
                  <p>{agent.prompt.substring(0, 60)}...</p>
                </div>
                <div className="agent-actions">
                  <button 
                    className="activate-btn"
                    onClick={() => handleActivateAgent(agent)}
                  >
                    Ativar
                  </button>
                  {!agent.isPredefined && (
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="create-agent-section">
            {!showCreateForm ? (
              <button 
                className="create-btn"
                onClick={() => setShowCreateForm(true)}
              >
                + Criar Novo Agente
              </button>
            ) : (
              <form onSubmit={handleCreateAgent} className="create-agent-form">
                <input
                  type="text"
                  placeholder="Nome do agente"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Prompt do agente"
                  value={newAgent.prompt}
                  onChange={(e) => setNewAgent({ ...newAgent, prompt: e.target.value })}
                  required
                  rows={3}
                />
                <input
                  type="color"
                  value={newAgent.color}
                  onChange={(e) => setNewAgent({ ...newAgent, color: e.target.value })}
                />
                <div className="form-actions">
                  <button type="submit">Criar</button>
                  <button type="button" onClick={() => setShowCreateForm(false)}>Cancelar</button>
                </div>
              </form>
            )}
          </div>

          <div className="help-section">
            <h4>Comandos Secretos</h4>
            <div className="commands-list">
              <code>/agente nome</code> - Ativar agente específico<br />
              <code>/agentes</code> - Listar todos os agentes<br />
              <code>/desativar</code> - Desativar agente atual
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentModal;