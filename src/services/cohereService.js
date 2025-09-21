import { AIService, AIServiceFactory } from './aiService.js';

class CohereService extends AIService {
  constructor(apiKey = null, config = {}) {
    super(apiKey || import.meta.env.VITE_COHERE_API_KEY, config);
    this.baseURL = 'https://api.cohere.ai/v1';
    this.modelName = config.model || 'command';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  getModelInfo() {
    return {
      provider: 'Cohere',
      model: this.modelName,
      supportsImages: false,
      maxTokens: 4096
    };
  }

  async sendMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cohere API não está configurada. Verifique sua chave de API.');
    }

    try {
      const { systemPrompt = '' } = options;
      
      // Cohere usa um formato diferente - construir prompt único
      let prompt = '';
      
      if (systemPrompt) {
        prompt += `${systemPrompt}\n\n`;
      }
      
      // Adicionar histórico da conversa
      messages.forEach((msg, index) => {
        if (msg.sender === 'user') {
          prompt += `Human: ${msg.text}\n`;
        } else {
          prompt += `Assistant: ${msg.text}\n`;
        }
      });
      
      // Adicionar prompt para resposta
      prompt += 'Assistant:';

      const requestBody = {
        model: this.modelName,
        prompt: prompt,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stop_sequences: ['Human:', '\n\nHuman:'],
        return_likelihoods: 'NONE'
      };

      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Cohere-Version': '2022-12-06'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.generations || data.generations.length === 0) {
        throw new Error('Resposta inválida da API Cohere');
      }

      return data.generations[0].text.trim();
    } catch (error) {
      return this.handleError(error, 'sendMessage');
    }
  }

  // Método para chat (formato mais moderno do Cohere)
  async sendChatMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cohere API não está configurada. Verifique sua chave de API.');
    }

    try {
      const { systemPrompt = '' } = options;
      
      // Formatar mensagens para o formato de chat do Cohere
      const chatHistory = [];
      
      messages.slice(0, -1).forEach(msg => {
        chatHistory.push({
          role: msg.sender === 'user' ? 'USER' : 'CHATBOT',
          message: msg.text
        });
      });
      
      const lastMessage = messages[messages.length - 1];

      const requestBody = {
        model: this.modelName,
        message: lastMessage.text,
        chat_history: chatHistory,
        temperature: this.temperature,
        max_tokens: this.maxTokens
      };

      if (systemPrompt) {
        requestBody.preamble = systemPrompt;
      }

      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Cohere-Version': '2022-12-06'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.text) {
        throw new Error('Resposta inválida da API Cohere Chat');
      }

      return data.text;
    } catch (error) {
      return this.handleError(error, 'sendChatMessage');
    }
  }

  // Método específico para listar modelos disponíveis
  getAvailableModels() {
    return [
      { id: 'command', name: 'Command', description: 'Modelo principal para conversação' },
      { id: 'command-light', name: 'Command Light', description: 'Versão mais rápida e leve' },
      { id: 'command-nightly', name: 'Command Nightly', description: 'Versão experimental' }
    ];
  }



  // Sobrescrever sendMessage para usar chat quando disponível
  async sendMessage(messages, options = {}) {
    // Tentar usar o endpoint de chat primeiro, fallback para generate
    try {
      return await this.sendChatMessage(messages, options);
    } catch (error) {
      console.warn('Chat endpoint falhou, usando generate:', error.message);
      return await super.sendMessage(messages, options);
    }
  }
}

// Registrar o serviço no factory
AIServiceFactory.register('cohere', CohereService);

// Criar instância singleton
export const cohereService = new CohereService();
export default cohereService;
export { CohereService };