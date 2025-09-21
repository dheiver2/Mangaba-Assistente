import { AIService, AIServiceFactory } from './aiService.js';

class HuggingFaceService extends AIService {
  constructor(apiKey = null, config = {}) {
    super(apiKey || import.meta.env.VITE_HUGGINGFACE_API_KEY, config);
    this.baseURL = 'https://api-inference.huggingface.co/models';
    this.modelName = config.model || 'microsoft/DialoGPT-medium';
    this.maxTokens = config.maxTokens || 1024;
    this.temperature = config.temperature || 0.7;
    this.waitForModel = config.waitForModel !== false;
  }

  getModelInfo() {
    return {
      provider: 'Hugging Face',
      model: this.modelName,
      supportsImages: this.modelName.includes('vision') || this.modelName.includes('clip'),
      maxTokens: 4096
    };
  }

  async sendMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Hugging Face API não está configurada. Verifique sua chave de API.');
    }

    try {
      const { systemPrompt = '' } = options;
      
      // Construir prompt baseado no tipo de modelo
      let prompt = '';
      
      if (systemPrompt) {
        prompt += `${systemPrompt}\n\n`;
      }
      
      // Para modelos de conversação, usar formato de diálogo
      if (this.modelName.includes('DialoGPT') || this.modelName.includes('BlenderBot')) {
        messages.forEach(msg => {
          if (msg.sender === 'user') {
            prompt += `User: ${msg.text}\n`;
          } else {
            prompt += `Bot: ${msg.text}\n`;
          }
        });
        prompt += 'Bot:';
      } else {
        // Para outros modelos, usar formato simples
        const lastMessage = messages[messages.length - 1];
        prompt += lastMessage.text;
      }

      const requestBody = {
        inputs: prompt,
        parameters: {
          max_new_tokens: this.maxTokens,
          temperature: this.temperature,
          do_sample: true,
          return_full_text: false
        },
        options: {
          wait_for_model: this.waitForModel,
          use_cache: false
        }
      };

      const response = await fetch(`${this.baseURL}/${this.modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Tratar erro de modelo carregando
        if (response.status === 503 && errorData.error?.includes('loading')) {
          throw new Error('Modelo está carregando. Tente novamente em alguns segundos.');
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Hugging Face pode retornar diferentes formatos
      if (Array.isArray(data) && data.length > 0) {
        if (data[0].generated_text !== undefined) {
          return data[0].generated_text.trim();
        }
        if (data[0].text !== undefined) {
          return data[0].text.trim();
        }
      }
      
      if (data.generated_text) {
        return data.generated_text.trim();
      }
      
      throw new Error('Resposta inválida da API Hugging Face');
    } catch (error) {
      return this.handleError(error, 'sendMessage');
    }
  }

  // Método para usar modelos de chat específicos
  async sendChatMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Hugging Face API não está configurada.');
    }

    try {
      const { systemPrompt = '' } = options;
      
      // Formatar para modelos de chat como Llama, Mistral, etc.
      let formattedPrompt = '';
      
      if (systemPrompt) {
        formattedPrompt += `<|system|>\n${systemPrompt}\n`;
      }
      
      messages.forEach(msg => {
        if (msg.sender === 'user') {
          formattedPrompt += `<|user|>\n${msg.text}\n`;
        } else {
          formattedPrompt += `<|assistant|>\n${msg.text}\n`;
        }
      });
      
      formattedPrompt += '<|assistant|>\n';

      const requestBody = {
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: this.maxTokens,
          temperature: this.temperature,
          do_sample: true,
          stop: ['<|user|>', '<|system|>'],
          return_full_text: false
        },
        options: {
          wait_for_model: this.waitForModel
        }
      };

      const response = await fetch(`${this.baseURL}/${this.modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
      }
      
      throw new Error('Resposta inválida da API Hugging Face Chat');
    } catch (error) {
      return this.handleError(error, 'sendChatMessage');
    }
  }

  // Método para listar modelos populares
  getAvailableModels() {
    return [
      { id: 'microsoft/DialoGPT-medium', name: 'DialoGPT Medium', type: 'conversational' },
      { id: 'microsoft/DialoGPT-large', name: 'DialoGPT Large', type: 'conversational' },
      { id: 'facebook/blenderbot-400M-distill', name: 'BlenderBot 400M', type: 'conversational' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.1', name: 'Mistral 7B Instruct', type: 'instruction' },
      { id: 'meta-llama/Llama-2-7b-chat-hf', name: 'Llama 2 7B Chat', type: 'chat' },
      { id: 'codellama/CodeLlama-7b-Instruct-hf', name: 'Code Llama 7B', type: 'code' },
      { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta', type: 'assistant' }
    ];
  }

  // Método para verificar status do modelo
  async checkModelStatus() {
    if (!this.isConfigured) {
      throw new Error('Hugging Face API não está configurada.');
    }

    try {
      const response = await fetch(`${this.baseURL}/${this.modelName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return { status: 'ready', message: 'Modelo pronto para uso' };
      } else if (response.status === 503) {
        return { status: 'loading', message: 'Modelo carregando...' };
      } else {
        return { status: 'error', message: 'Erro ao verificar modelo' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Método para buscar modelos por categoria
  async searchModels(query, category = 'text-generation') {
    try {
      const response = await fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=${category}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const models = await response.json();
        return models.slice(0, 10).map(model => ({
          id: model.id,
          name: model.id,
          downloads: model.downloads,
          likes: model.likes
        }));
      }
    } catch (error) {
      console.warn('Erro ao buscar modelos:', error);
    }
    
    return [];
  }
}

// Registrar o serviço no factory
AIServiceFactory.register('huggingface', HuggingFaceService);

// Criar instância singleton
export const huggingfaceService = new HuggingFaceService();
export default huggingfaceService;
export { HuggingFaceService };