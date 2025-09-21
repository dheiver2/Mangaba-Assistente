import { AIService, AIServiceFactory } from './aiService.js';

class OpenAIService extends AIService {
  constructor(apiKey = null, config = {}) {
    super(apiKey || import.meta.env.VITE_OPENAI_API_KEY, config);
    this.baseURL = 'https://api.openai.com/v1';
    this.modelName = config.model || 'gpt-3.5-turbo';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  getModelInfo() {
    return {
      provider: 'OpenAI',
      model: this.modelName,
      supportsImages: this.modelName.includes('gpt-4'),
      maxTokens: this.modelName.includes('gpt-4') ? 128000 : 4096
    };
  }

  async sendMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('OpenAI API não está configurada. Verifique sua chave de API.');
    }

    try {
      const { systemPrompt = '', images = [] } = options;
      
      // Formatar mensagens para o formato OpenAI
      const formattedMessages = [];
      
      // Adicionar prompt do sistema se fornecido
      if (systemPrompt) {
        formattedMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      // Converter mensagens do histórico
      messages.forEach(msg => {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        
        // Se é a última mensagem e tem imagens
        if (msg === messages[messages.length - 1] && images.length > 0) {
          const content = [
            { type: 'text', text: msg.text }
          ];
          
          // Adicionar imagens (apenas para modelos que suportam)
          if (this.modelName.includes('gpt-4')) {
            images.forEach(image => {
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${image.mimeType};base64,${image.data}`
                }
              });
            });
          }
          
          formattedMessages.push({ role, content });
        } else {
          formattedMessages.push({
            role,
            content: msg.text
          });
        }
      });

      const requestBody = {
        model: this.modelName,
        messages: formattedMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false
      };

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Resposta inválida da API OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      return this.handleError(error, 'sendMessage');
    }
  }

  // Método específico para listar modelos disponíveis
  async getAvailableModels() {
    if (!this.isConfigured) {
      throw new Error('OpenAI API não está configurada.');
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar modelos: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data
        .filter(model => model.id.includes('gpt'))
        .map(model => ({
          id: model.id,
          name: model.id,
          created: model.created
        }));
    } catch (error) {
      console.error('Erro ao buscar modelos OpenAI:', error);
      return [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      ];
    }
  }

  // Método para verificar uso da API
  async getUsage() {
    if (!this.isConfigured) {
      throw new Error('OpenAI API não está configurada.');
    }

    try {
      const response = await fetch(`${this.baseURL}/usage`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Não foi possível obter informações de uso:', error);
    }
    
    return null;
  }
}

// Registrar o serviço no factory
AIServiceFactory.register('openai', OpenAIService);

// Criar instância singleton
export const openaiService = new OpenAIService();
export default openaiService;
export { OpenAIService };