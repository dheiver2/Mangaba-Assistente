/**
 * Serviço de Agentes Discretos
 * Permite criar e gerenciar agentes especializados de forma silenciosa
 */

class AgentService {
  constructor() {
    this.agents = new Map();
    this.activeAgent = null;
    this.agentHistory = [];
    this.loadAgents();
    this.loadActiveAgent();
    this.loadAgentHistory();
  }

  // Agentes predefinidos e discretos
  PREDEFINED_AGENTS = {
    'code-master': {
      id: 'code-master',
      name: 'Code Master',
      description: 'Especialista em programação e desenvolvimento',
      prompt: 'Você é um expert em programação, arquitetura de software e melhores práticas. Responda de forma técnica e precisa.',
      icon: '💻',
      keywords: ['código', 'programar', 'debug', 'arquitetura', 'algoritmo'],
      color: '#2563eb'
    },
    'creative-writer': {
      id: 'creative-writer',
      name: 'Creative Writer',
      description: 'Especialista em escrita criativa e storytelling',
      prompt: 'Você é um escritor criativo talentoso. Crie histórias envolventes, textos criativos e conteúdo cativante.',
      icon: '✍️',
      keywords: ['história', 'criativo', 'narrativa', 'poema', 'roteiro'],
      color: '#dc2626'
    },
    'data-analyst': {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Especialista em análise de dados e insights',
      prompt: 'Você é um analista de dados experiente. Forneça insights baseados em dados, análises estatísticas e visualizações.',
      icon: '📊',
      keywords: ['dados', 'análise', 'estatística', 'gráfico', 'insight'],
      color: '#059669'
    },
    'business-strategist': {
      id: 'business-strategist',
      name: 'Business Strategist',
      description: 'Especialista em estratégia empresarial e negócios',
      prompt: 'Você é um estrategista empresarial. Forneça conselhos sobre negócios, estratégias de crescimento e tomada de decisão.',
      icon: '💼',
      keywords: ['negócio', 'estratégia', 'marketing', 'vendas', 'crescimento'],
      color: '#7c3aed'
    },
    'science-explainer': {
      id: 'science-explainer',
      name: 'Science Explainer',
      description: 'Especialista em ciências e explicações técnicas',
      prompt: 'Você é um cientista comunicador. Explique conceitos complexos de forma clara e acessível, sem perder precisão.',
      icon: '🔬',
      keywords: ['ciência', 'física', 'química', 'biologia', 'tecnologia'],
      color: '#0891b2'
    }
  };

  // Comandos secretos para ativação
  SECRET_COMMANDS = {
    '/agent': this.handleAgentCommand.bind(this),
    '/switch': this.handleSwitchCommand.bind(this),
    '/list': this.handleListCommand.bind(this),
    '/create': this.handleCreateCommand.bind(this),
    '/reset': this.handleResetCommand.bind(this)
  };

  loadAgents() {
    const saved = localStorage.getItem('discreteAgents');
    if (saved) {
      const agentsData = JSON.parse(saved);
      this.agents = new Map(Object.entries(agentsData));
    } else {
      // Carregar agentes predefinidos
      Object.entries(this.PREDEFINED_AGENTS).forEach(([id, agent]) => {
        this.agents.set(id, agent);
      });
    }
  }

  saveAgents() {
    const agentsData = Object.fromEntries(this.agents);
    localStorage.setItem('discreteAgents', JSON.stringify(agentsData));
  }

  loadActiveAgent() {
    const saved = localStorage.getItem('activeAgent');
    if (saved) {
      try {
        const agentData = JSON.parse(saved);
        // Verificar se o agente ainda existe
        if (this.agents.has(agentData.id)) {
          this.activeAgent = this.agents.get(agentData.id);
        } else {
          // Agente não existe mais, limpar localStorage
          localStorage.removeItem('activeAgent');
        }
      } catch (error) {
        console.warn('Erro ao carregar agente ativo:', error);
        localStorage.removeItem('activeAgent');
      }
    }
  }

  loadAgentHistory() {
    const saved = localStorage.getItem('agentHistory');
    if (saved) {
      try {
        this.agentHistory = JSON.parse(saved);
      } catch (error) {
        console.warn('Erro ao carregar histórico de agentes:', error);
        this.agentHistory = [];
      }
    }
  }

  // Detecta comandos secretos no input do usuário
  detectSecretCommand(text) {
    const trimmed = text.trim();
    
    for (const [command, handler] of Object.entries(this.SECRET_COMMANDS)) {
      if (trimmed.startsWith(command)) {
        const args = trimmed.substring(command.length).trim();
        return handler(args);
      }
    }

    // Detectar ativação por palavras-chave
    return this.detectKeywordActivation(text);
  }

  detectKeywordActivation(text) {
    const lowerText = text.toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;

    for (const [id, agent] of this.agents) {
      const matches = agent.keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = agent;
      }
    }

    if (bestMatch && maxMatches >= 2) {
      return {
        type: 'silent-activation',
        agent: bestMatch,
        message: `🤖 ${bestMatch.name} ativado silenciosamente`
      };
    }

    return null;
  }

  handleAgentCommand(args) {
    if (!args) {
      return {
        type: 'show-help',
        message: `📋 Agentes disponíveis:\n${Array.from(this.agents.values()).map(a => `${a.icon} ${a.name} - /switch ${a.id}`).join('\n')}`
      };
    }

    const agent = this.agents.get(args);
    if (agent) {
      this.setActiveAgent(agent);
      return {
        type: 'agent-activated',
        agent,
        message: `✨ ${agent.name} ativado`
      };
    }

    return {
      type: 'error',
      message: `❌ Agente '${args}' não encontrado`
    };
  }

  handleSwitchCommand(args) {
    return this.handleAgentCommand(args);
  }

  handleListCommand() {
    const agents = Array.from(this.agents.values());
    return {
      type: 'agent-list',
      agents,
      message: `🎯 ${agents.length} agentes disponíveis`
    };
  }

  handleCreateCommand(args) {
    if (!args) {
      return {
        type: 'create-help',
        message: `💡 Uso: /create nome:descrição:prompt:icone:palavras-chave`
      };
    }

    const parts = args.split(':');
    if (parts.length < 4) {
      return {
        type: 'error',
        message: `❌ Formato inválido. Use: nome:descrição:prompt:icone:palavras-chave`
      };
    }

    const [name, description, prompt, icon, keywords] = parts;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    const newAgent = {
      id,
      name,
      description,
      prompt,
      icon,
      keywords: keywords.split(',').map(k => k.trim()),
      color: '#6b7280',
      custom: true
    };

    this.agents.set(id, newAgent);
    this.saveAgents();

    return {
      type: 'agent-created',
      agent: newAgent,
      message: `✅ Agente '${name}' criado com sucesso`
    };
  }

  handleResetCommand() {
    this.activeAgent = null;
    return {
      type: 'reset',
      message: '🔄 Voltando ao agente padrão'
    };
  }

  setActiveAgent(agent) {
    this.activeAgent = agent;
    this.agentHistory.push({
      agent: agent.id,
      timestamp: new Date().toISOString(),
      context: 'manual-activation'
    });
    
    // Limitar histórico aos últimos 50 ativações
    if (this.agentHistory.length > 50) {
      this.agentHistory = this.agentHistory.slice(-50);
    }
    
    // Persistir agente ativo e histórico
    localStorage.setItem('activeAgent', JSON.stringify(agent));
    localStorage.setItem('agentHistory', JSON.stringify(this.agentHistory));
  }

  getActiveAgent() {
    return this.activeAgent;
  }

  getAgentPrompt() {
    return this.activeAgent ? this.activeAgent.prompt : null;
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  // Obter apenas nomes dos agentes
  getAgentNames() {
    return this.getAllAgents().map(agent => agent.name);
  }

  getCustomAgents() {
    return this.getAllAgents().filter(agent => agent.custom);
  }

  getAgentHistory() {
    return this.agentHistory;
  }

  // Método para integração com o serviço principal
  shouldProcessWithAgent(input) {
    const result = this.detectSecretCommand(input);
    if (result && result.type !== 'silent-activation') {
      return { shouldProcess: false, response: result };
    }
    
    return { 
      shouldProcess: true, 
      agentPrompt: this.getAgentPrompt(),
      silentAgent: result?.type === 'silent-activation' ? result.agent : null
    };
  }

  // Sugestões contextuais baseadas no input
  suggestAgent(input) {
    const lowerInput = input.toLowerCase();
    const suggestions = [];

    for (const agent of this.agents.values()) {
      const relevance = agent.keywords.reduce((score, keyword) => {
        if (lowerInput.includes(keyword.toLowerCase())) {
          return score + 1;
        }
        return score;
      }, 0);

      if (relevance > 0) {
        suggestions.push({
          agent,
          relevance,
          message: `💡 Talvez ${agent.name} possa ajudar melhor`
        });
      }
    }

    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 2);
  }

  // Criar agente personalizado
  createCustomAgent(name, prompt, color = '#6366f1') {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAgent = {
      id,
      name,
      prompt,
      color,
      custom: true,
      isPredefined: false,
      description: `Agente personalizado: ${name}`,
      icon: '🤖',
      keywords: [],
      createdAt: new Date().toISOString()
    };

    this.agents.set(id, newAgent);
    this.saveAgents();
    return newAgent;
  }

  // Ativar agente específico
  activateAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.setActiveAgent(agent);
      return agent;
    }
    return null;
  }

  // Desativar agente atual
  deactivateAgent() {
    this.activeAgent = null;
    localStorage.removeItem('activeAgent');
    return true;
  }

  // Excluir agente personalizado
  deleteCustomAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent && agent.custom && !agent.isPredefined) {
      this.agents.delete(agentId);
      this.saveAgents();
      
      // Se o agente ativo foi excluído, desativar
      if (this.activeAgent?.id === agentId) {
        this.deactivateAgent();
      }
      
      return true;
    }
    return false;
  }

  // Exportar dados do agente (para backup)
  exportAgentData() {
    return {
      agents: Object.fromEntries(this.agents),
      history: this.agentHistory,
      activeAgent: this.activeAgent?.id || null
    };
  }

  // Importar dados do agente
  importAgentData(data) {
    if (data.agents) {
      this.agents = new Map(Object.entries(data.agents));
      this.saveAgents();
    }
    
    if (data.history) {
      this.agentHistory = data.history;
      localStorage.setItem('agentHistory', JSON.stringify(this.agentHistory));
    }
    
    if (data.activeAgent && this.agents.has(data.activeAgent)) {
      this.activeAgent = this.agents.get(data.activeAgent);
    }
  }
}

// Instância singleton
const agentService = new AgentService();
export default agentService;