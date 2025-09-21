import { AIService, AIServiceFactory } from './aiService.js';

class AnthropicService extends AIService {
  constructor(apiKey = null, config = {}) {
    super(apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY, config);
    this.baseURL = 'https://api.anthropic.com/v1';
    this.modelName = config.model || 'claude-3-sonnet-20240229';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.version = '2023-06-01';
  }

  getModelInfo() {
    return {
      provider: 'Anthropic Claude',
      model: this.modelName,
      supportsImages: true,
      maxTokens: 200000
    };
  }

  async sendMessage(messages, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Anthropic API não está configurada. Verifique sua chave de API.');
    }

    try {
      const { systemPrompt = '', images = [] } = options;
      
      // Formatar mensagens para o formato Anthropic
      const formattedMessages = [];
      
      messages.forEach(msg => {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        
        // Se é a última mensagem e tem imagens
        if (msg === messages[messages.length - 1] && images.length > 0) {
          const content = [
            { type: 'text', text: msg.text }
          ];
          
          // Adicionar imagens
          images.forEach(image => {
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.mimeType,
                data: image.data
              }
            });
          });
          
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
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: formattedMessages
      };

      // Adicionar system prompt se fornecido
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.version
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error('Resposta inválida da API Anthropic');
      }

      // Anthropic retorna um array de conteúdo, pegar o texto
      return data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
    } catch (error) {
      return this.handleError(error, 'sendMessage');
    }
  }

  // Método específico para listar modelos disponíveis
  getAvailableModels() {
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', tier: 'premium' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', tier: 'standard' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', tier: 'fast' },
      { id: 'claude-2.1', name: 'Claude 2.1', tier: 'legacy' },
      { id: 'claude-2.0', name: 'Claude 2.0', tier: 'legacy' }
    ];
  }

  // Método para verificar limites de rate
  async checkRateLimit() {
    if (!this.isConfigured) {
      throw new Error('Anthropic API não está configurada.');
    }

    try {
      // Fazer uma requisição simples para verificar headers de rate limit
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.version
        },
        body: JSON.stringify({
          model: this.modelName,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      return {
        remaining: response.headers.get('anthropic-ratelimit-requests-remaining'),
        limit: response.headers.get('anthropic-ratelimit-requests-limit'),
        resetTime: response.headers.get('anthropic-ratelimit-requests-reset')
      };
    } catch (error) {
      console.warn('Não foi possível verificar rate limit:', error);
      return null;
    }
  }

  // Método para streaming (futuro)
  async sendMessageStream(messages, options = {}) {
    // Implementação futura para streaming
    throw new Error('Streaming não implementado ainda para Anthropic');
  }
}

// Registrar o serviço no factory
AIServiceFactory.register('anthropic', AnthropicService);

// Criar instância singleton
export const anthropicService = new AnthropicService();
export default anthropicService;
export { AnthropicService };