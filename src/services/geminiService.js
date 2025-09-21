import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIService, AIServiceFactory } from './aiService.js';

class GeminiService extends AIService {
  constructor(apiKey = null, config = {}) {
    super(apiKey || import.meta.env.VITE_GEMINI_API_KEY, config);
    this.genAI = null;
    this.model = null;
    this.modelName = config.model || 'gemini-1.5-flash';
    this.initializeService();
  }

  initializeService() {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('Chave da API do Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // Usando o modelo Gemini Flash (gemini-1.5-flash)
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    } catch (error) {
      console.error('Erro ao inicializar o serviço Gemini:', error);
    }
  }

  getModelInfo() {
    return {
      provider: 'Google Gemini',
      model: this.modelName,
      supportsImages: true,
      maxTokens: 1000000
    };
  }

  async sendMessage(messages, options = {}) {
    if (!this.model) {
      throw new Error('Serviço Gemini não inicializado. Verifique sua chave da API.');
    }

    try {
      const { systemPrompt = '', images = [] } = options;
      
      // Construir histórico da conversa
      const history = [];
      
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        history.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }

      // Última mensagem do usuário
      const lastMessage = messages[messages.length - 1];
      let prompt = lastMessage.text;
      
      if (systemPrompt) {
        prompt = `${systemPrompt}\n\n${prompt}`;
      }

      // Preparar conteúdo com imagens se houver
      const parts = [{ text: prompt }];
      
      if (images && images.length > 0) {
        for (const image of images) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          });
        }
      }

      // Iniciar chat com histórico
      const chat = this.model.startChat({ history });
      
      // Enviar mensagem
      const result = await chat.sendMessage(parts);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      return this.handleError(error, 'sendMessage');
    }
  }

  isConfigured() {
    return this.model !== null && this.apiKey && this.apiKey !== 'your_gemini_api_key_here';
  }
}

// Exportar uma instância singleton
export const geminiService = new GeminiService();

// Registrar o serviço no factory
AIServiceFactory.register('gemini', GeminiService);

export default geminiService;
export { GeminiService };

// Função de compatibilidade para manter a API existente
export const sendMessage = (message, systemPrompt = '') => {
  return geminiService.sendMessage([{ role: 'user', content: message }], { systemPrompt });
};