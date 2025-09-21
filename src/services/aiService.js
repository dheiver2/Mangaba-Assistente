// Serviço abstrato base para todas as APIs de IA
export class AIService {
  constructor(apiKey, config = {}) {
    this.apiKey = apiKey;
    this.config = config;
    this.isConfigured = !!apiKey;
  }

  // Método abstrato que deve ser implementado por cada serviço
  async sendMessage(messages, options = {}) {
    throw new Error('sendMessage method must be implemented by subclass');
  }

  // Método para verificar se o serviço está configurado
  isReady() {
    return this.isConfigured;
  }

  // Método para obter informações do modelo
  getModelInfo() {
    throw new Error('getModelInfo method must be implemented by subclass');
  }

  // Método para validar configuração
  validateConfig() {
    return this.isConfigured;
  }

  // Método para formatar mensagens no padrão comum
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.timestamp
    }));
  }

  // Método para tratar erros de forma padronizada
  handleError(error, context = '') {
    console.error(`[${this.constructor.name}] Error in ${context}:`, error);
    
    if (error.message?.includes('API key')) {
      throw new Error('Chave da API inválida ou não configurada');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('Limite de uso da API atingido');
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Erro de conexão com a API');
    }
    
    throw new Error(`Erro na API: ${error.message || 'Erro desconhecido'}`);
  }
}

// Factory para criar instâncias dos serviços de IA
export class AIServiceFactory {
  static services = new Map();
  
  static register(name, serviceClass) {
    this.services.set(name, serviceClass);
  }
  
  static create(name, apiKey, config = {}) {
    const ServiceClass = this.services.get(name);
    if (!ServiceClass) {
      throw new Error(`Serviço de IA '${name}' não encontrado`);
    }
    return new ServiceClass(apiKey, config);
  }
  
  static getAvailableServices() {
    return Array.from(this.services.keys());
  }
}

// Configurações padrão para diferentes provedores
export const AI_PROVIDERS = {
  GEMINI: {
    name: 'Google Gemini',
    key: 'gemini',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    supportsImages: true,
    maxTokens: 1000000
  },
  OPENAI: {
    name: 'OpenAI',
    key: 'openai',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    supportsImages: true,
    maxTokens: 128000
  },
  ANTHROPIC: {
    name: 'Anthropic Claude',
    key: 'anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    supportsImages: true,
    maxTokens: 200000
  },
  COHERE: {
    name: 'Cohere',
    key: 'cohere',
    models: ['command', 'command-light'],
    supportsImages: false,
    maxTokens: 4096
  },
  HUGGINGFACE: {
    name: 'Hugging Face',
    key: 'huggingface',
    models: ['mistral-7b', 'llama-2-7b', 'code-llama'],
    supportsImages: false,
    maxTokens: 4096
  }
};

// Gerenciador central de APIs de IA
export class AIManager {
  constructor() {
    this.activeServices = new Map();
    this.defaultService = null;
  }

  // Adicionar um serviço
  addService(providerId, apiKey, config = {}) {
    try {
      const service = AIServiceFactory.create(providerId, apiKey, config);
      this.activeServices.set(providerId, service);
      
      // Define como padrão se for o primeiro
      if (!this.defaultService) {
        this.defaultService = providerId;
      }
      
      return service;
    } catch (error) {
      console.error(`Erro ao adicionar serviço ${providerId}:`, error);
      throw error;
    }
  }

  // Remover um serviço
  removeService(providerId) {
    this.activeServices.delete(providerId);
    if (this.defaultService === providerId) {
      this.defaultService = this.activeServices.keys().next().value || null;
    }
  }

  // Obter serviço ativo
  getService(providerId = null) {
    const id = providerId || this.defaultService;
    return this.activeServices.get(id);
  }

  // Listar serviços ativos
  getActiveServices() {
    return Array.from(this.activeServices.keys());
  }

  // Enviar mensagem usando serviço específico ou padrão
  async sendMessage(messages, options = {}) {
    const service = this.getService(options.providerId);
    if (!service) {
      throw new Error('Nenhum serviço de IA configurado');
    }
    
    return await service.sendMessage(messages, options);
  }

  // Verificar se há serviços configurados
  hasActiveServices() {
    return this.activeServices.size > 0;
  }

  // Definir serviço padrão
  setDefaultService(providerId) {
    if (this.activeServices.has(providerId)) {
      this.defaultService = providerId;
    }
  }
}

// Instância global do gerenciador
export const aiManager = new AIManager();