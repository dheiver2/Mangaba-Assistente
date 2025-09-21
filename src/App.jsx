import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import GPTManager from './components/GPTManager';
import Sidebar from './components/Sidebar';
import ImageUpload from './components/ImageUpload';
import AdvancedSettings from './components/AdvancedSettings';
import AISelector from './components/AISelector';
import APIKeyManager from './components/APIKeyManager';
import FormattedMessage from './components/FormattedMessage';
import AgentModal from './components/AgentModal';
import ModelSelector from './components/ModelSelector';
import ModelStatusIndicator from './components/ModelStatusIndicator';
import UsageDashboard from './components/UsageDashboard';
import ModelSearcher from './components/ModelSearcher';
import BrazilianFlags from './components/BrazilianFlags';
import UserMenu from './components/UserMenu';

import ProviderSpecificSettings from './components/ProviderSpecificSettings';
import AgentImportExport from './components/AgentImportExport';
import { aiManager, AI_PROVIDERS } from './services/aiService';
import { sendMessage } from './services/geminiService';
import { exportConversation } from './services/exportService';
import agentService from './services/agentService';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Importar todos os serviços para registrá-los
import './services/geminiService';
import './services/openaiService';
import './services/anthropicService';
import './services/cohereService';
import './services/huggingfaceService';

function App() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentGPT, setCurrentGPT] = useState({
    id: 'default',
    name: 'Mangaba Assistente',
    systemPrompt: 'Você é um assistente útil e amigável.'
  });
  const [currentAIProvider, setCurrentAIProvider] = useState('gemini');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showGPTManager, setShowGPTManager] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAPIKeyManager, setShowAPIKeyManager] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPrompt: '',
    autoSave: true,
    showTokenCount: false
  });
  const [typingStatus, setTypingStatus] = useState('');
  const [tokenCount, setTokenCount] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentSuggestions, setAgentSuggestions] = useState([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showUsageDashboard, setShowUsageDashboard] = useState(false);
  const [showModelSearcher, setShowModelSearcher] = useState(false);

  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [showAgentImportExport, setShowAgentImportExport] = useState(false);



  useEffect(() => {
    const savedGPTs = localStorage.getItem('customGPTs');
    if (savedGPTs) {
      const gpts = JSON.parse(savedGPTs);
      if (gpts.length > 0) {
        setCurrentGPT(gpts[0]);
      }
    }

    // Carregar preferência de provedor de IA
    const savedProvider = localStorage.getItem('preferredAIProvider');
    if (savedProvider) {
      setCurrentAIProvider(savedProvider);
    }

    // Inicializar serviço Gemini por padrão se tiver chave de API
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        aiManager.addService('gemini', geminiKey);
      } catch (error) {
        console.warn('Erro ao inicializar Gemini:', error);
      }
    }

    // Carregar conversas salvas
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const convs = JSON.parse(savedConversations);
      setConversations(convs);
      if (convs.length > 0) {
        setCurrentConversationId(convs[0].id);
        setMessages(convs[0].messages || []);
      }
    }

    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Carregar mensagens favoritas
    const savedFavorites = localStorage.getItem('favoriteMessages');
    if (savedFavorites) {
      setFavoriteMessages(JSON.parse(savedFavorites));
    }

    // Carregar configurações avançadas
    const savedAdvancedSettings = localStorage.getItem('advancedSettings');
    if (savedAdvancedSettings) {
      setAdvancedSettings(JSON.parse(savedAdvancedSettings));
    }
  }, []);

  const saveCurrentConversation = (updatedMessages) => {
    if (!currentConversationId) return;
    
    const updatedConversations = conversations.map(conv => 
      conv.id === currentConversationId 
        ? { ...conv, messages: updatedMessages, updatedAt: new Date().toISOString() }
        : conv
    );
    
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    // Verificar comandos secretos de agente
    const agentCommand = agentService.detectSecretCommand(input);
    
    if (agentCommand) {
      try {
        // agentCommand já é o resultado direto do comando
        if (agentCommand.type === 'agent-activated') {
          setActiveAgent(agentCommand.agent);
          
          // Adicionar mensagem discreta indicando mudança de agente
          const agentMessage = {
            id: Date.now(),
            text: `🤖 ${agentCommand.agent.name} ativado discretamente`,
            sender: 'system',
            timestamp: new Date().toISOString(),
            isAgentActivation: true
          };
          
          const newMessages = [...messages, agentMessage];
          setMessages(newMessages);
          saveCurrentConversation(newMessages);
          
          setInput('');
          return;
        }
        
        if (agentCommand.type === 'agent-list') {
          const listMessage = {
            id: Date.now(),
            text: agentCommand.message,
            sender: 'system',
            timestamp: new Date().toISOString(),
            isAgentList: true
          };
          
          const newMessages = [...messages, listMessage];
          setMessages(newMessages);
          saveCurrentConversation(newMessages);
          
          setInput('');
          return;
        }

        if (agentCommand.type === 'show-help' || agentCommand.type === 'error') {
          const helpMessage = {
            id: Date.now(),
            text: agentCommand.message,
            sender: 'system',
            timestamp: new Date().toISOString(),
            isAgentHelp: true
          };
          
          const newMessages = [...messages, helpMessage];
          setMessages(newMessages);
          saveCurrentConversation(newMessages);
          
          setInput('');
          return;
        }
      } catch (error) {
        console.error('Erro ao processar comando de agente:', error);
      }
    }

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      images: selectedImages.length > 0 ? selectedImages : undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImages([]);
    setIsLoading(true);
    setTypingStatus(`${AI_PROVIDERS[currentAIProvider?.toUpperCase()]?.name || 'IA'} está digitando...`);

    try {
      let response;
      let systemPrompt = currentGPT.systemPrompt;
      
      // Adicionar contexto do agente ativo
      if (activeAgent) {
        systemPrompt = `${systemPrompt}\n\nVocê está atuando como: ${activeAgent.name}\n${activeAgent.prompt}`;
      }
      
      // Usar o novo sistema de múltiplas APIs
      if (aiManager.hasActiveServices()) {
        const options = {
          systemPrompt: systemPrompt,
          images: selectedImages,
          providerId: currentAIProvider,
          ...advancedSettings
        };
        
        response = await aiManager.sendMessage(newMessages, options);
      } else {
        // Fallback para o serviço Gemini original
        response = await sendMessage(input, systemPrompt);
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        provider: currentAIProvider,
        agentId: activeAgent?.id
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Salvar conversa atualizada
      saveCurrentConversation(finalMessages);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Desculpe, ocorreu um erro ao processar sua mensagem com ${currentAIProvider}: ${error.message}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveCurrentConversation(finalMessages);
    } finally {
      setIsLoading(false);
      setTypingStatus('');
    }
  };

  // Função para contar caracteres/tokens aproximados
  const updateTokenCount = (text) => {
    // Estimativa simples: ~4 caracteres por token
    const estimatedTokens = Math.ceil(text.length / 4);
    setTokenCount(estimatedTokens);
  };

  // Atualizar contagem quando o input muda
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    updateTokenCount(newValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageIndex, currentText) => {
    setEditingMessage(messageIndex);
    setEditText(currentText);
  };

  const handleSaveEdit = (messageIndex) => {
    const updatedMessages = messages.map((msg, index) => 
      index === messageIndex ? { ...msg, text: editText } : msg
    );
    setMessages(updatedMessages);
    saveCurrentConversation(updatedMessages);
    setEditingMessage(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageIndex) => {
    const updatedMessages = messages.filter((_, index) => index !== messageIndex);
    setMessages(updatedMessages);
    saveCurrentConversation(updatedMessages);
  };

  const handleRegenerateResponse = async (messageIndex) => {
    if (isLoading) return;
    
    // Encontrar a mensagem do usuário anterior à resposta que queremos regenerar
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].sender !== 'user') {
      console.error('Não foi possível encontrar a mensagem do usuário correspondente');
      return;
    }
    
    // Remover a resposta atual e todas as mensagens subsequentes
    const messagesUpToUser = messages.slice(0, messageIndex);
    setMessages(messagesUpToUser);
    setIsLoading(true);
    
    try {
      let response;
      const userMessage = messages[userMessageIndex];
      
      // Usar o novo sistema de múltiplas APIs
      if (aiManager.hasActiveServices()) {
        const options = {
          systemPrompt: currentGPT.systemPrompt,
          images: userMessage.images,
          providerId: currentAIProvider,
          ...advancedSettings
        };
        
        response = await aiManager.sendMessage(messagesUpToUser, options);
      } else {
        // Fallback para o serviço Gemini original
        response = await sendMessage(userMessage.text, currentGPT.systemPrompt);
      }
      
      const newAssistantMessage = {
        id: Date.now(),
        text: response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        provider: currentAIProvider
      };
      
      const finalMessages = [...messagesUpToUser, newAssistantMessage];
      setMessages(finalMessages);
      saveCurrentConversation(finalMessages);
    } catch (error) {
      console.error('Erro ao regenerar resposta:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Desculpe, ocorreu um erro ao regenerar a resposta com ${currentAIProvider}: ${error.message}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalMessages = [...messagesUpToUser, errorMessage];
      setMessages(finalMessages);
      saveCurrentConversation(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para gerenciar conversas
  const handleNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Nova Conversa',
      messages: [],
      timestamp: new Date().toISOString(),
      lastMessage: ''
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages || []);
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
        setMessages(updatedConversations[0].messages || []);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  };



  const handleSelectGPT = (gpt) => {
    setCurrentGPT(gpt);
    setMessages([]);
    setCurrentConversationId(null);
    
    // Usar o provedor preferido do GPT se especificado
    if (gpt.preferredProvider && gpt.preferredProvider !== currentAIProvider) {
      handleProviderChange(gpt.preferredProvider);
    }
  };

  const handleProviderChange = (providerId) => {
    setCurrentAIProvider(providerId);
    aiManager.setDefaultService(providerId);
    
    // Salvar preferência no localStorage
    localStorage.setItem('preferredAIProvider', providerId);
  };

  const handleConfigureAPI = (providerId, success) => {
    if (success) {
      console.log(`API ${providerId} configurada com sucesso`);
      // Opcional: mostrar notificação de sucesso
    }
  };

  const handleExportConversation = (conversation, options) => {
    try {
      exportConversation(conversation, options);
    } catch (error) {
      console.error('Erro ao exportar conversa:', error);
      alert('Erro ao exportar conversa. Tente novamente.');
    }
  };

  const handleImageSelect = (imageData) => {
    setSelectedImages(prev => [...prev, imageData]);
  };

  const handleRemoveImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleToggleFavorite = (messageId) => {
    setFavoriteMessages(prev => {
      const isFavorite = prev.includes(messageId);
      const newFavorites = isFavorite 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId];
      
      localStorage.setItem('favoriteMessages', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handlePromptSuggestion = (promptText) => {
    setInput(promptText);
    // Automaticamente enviar a mensagem
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleSaveAdvancedSettings = (newSettings) => {
    setAdvancedSettings(newSettings);
    localStorage.setItem('advancedSettings', JSON.stringify(newSettings));
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair? Todas as conversas não salvas serão perdidas.');
    
    if (confirmLogout) {
      // Limpar dados sensíveis (opcional - manter conversas salvas)
      // localStorage.clear(); // Descomente se quiser limpar tudo
      

      
      // Resetar estado da aplicação
      setMessages([]);
      setCurrentConversationId(null);
      setInput('');
      setSelectedImages([]);
      setIsLoading(false);
      
      // Mostrar mensagem de despedida
      alert('Sessão encerrada com sucesso!');
      
      // Em uma aplicação real, você redirecionaria para uma página de login
      // window.location.href = '/login';
    }
  };

  // Atualizar título da conversa baseado na primeira mensagem
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const conversation = conversations.find(conv => conv.id === currentConversationId);
      if (conversation && conversation.title === 'Nova Conversa') {
        const firstUserMessage = messages.find(msg => msg.sender === 'user');
        if (firstUserMessage) {
          const newTitle = firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '');
          const updatedConversations = conversations.map(conv => 
            conv.id === currentConversationId 
              ? { ...conv, title: newTitle, lastMessage: firstUserMessage.text }
              : conv
          );
          setConversations(updatedConversations);
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        }
      }
    }
  }, [messages, currentConversationId, conversations]);

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (showGPTManager) {
    return (
      <GPTManager 
        onClose={() => setShowGPTManager(false)}
        onSelectGPT={setCurrentGPT}
        currentGPT={currentGPT}
      />
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'} ${isFullscreen ? 'fullscreen' : ''}`}>
      <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenGPTManager={() => setShowGPTManager(true)}
          onExportConversation={handleExportConversation}
          favoriteMessages={favoriteMessages}
          onOpenAdvancedSettings={() => setShowAdvancedSettings(true)}
          currentAIProvider={currentAIProvider}
          onProviderChange={handleProviderChange}
          onConfigureAPI={handleConfigureAPI}
        />
      
      <div className={`main-content ${isSidebarOpen ? (isSidebarCollapsed ? 'with-sidebar-collapsed' : 'with-sidebar') : ''}`}>
        <div className="header">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
            <button 
              className="back-to-landing-btn"
              onClick={() => navigate('/')}
              title="Voltar à Landing Page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </button>
            <div className="current-model-info">
              <span className="model-name">{currentGPT?.name || 'Mangaba Assistente'}</span>
              <ModelStatusIndicator 
                provider={currentAIProvider}
                model={currentGPT?.name || 'Mangaba Assistente'}
              />
            </div>
          </div>
          <div className="header-center">
            {currentConversationId && (
              <div className="conversation-title">
                {conversations.find(conv => conv.id === currentConversationId)?.title || 'Nova Conversa'}
              </div>
            )}
          </div>
          <div className="header-right">
            {currentConversationId && (
              <>
                <button 
                  className="fullscreen-btn"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Sair da tela cheia" : "Modo tela cheia"}
                >
                  {isFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  )}
                </button>
                <button 
                  className="share-btn"
                  onClick={() => {
                    const conversation = conversations.find(conv => conv.id === currentConversationId);
                    if (conversation) {
                      navigator.clipboard.writeText(`Conversa: ${conversation.title}\n\n${conversation.messages.map(msg => `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}`).join('\n\n')}`);
                      alert('Conversa copiada para a área de transferência!');
                    }
                  }}
                  title="Compartilhar conversa"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
                <button 
                  className={`agent-btn ${activeAgent ? 'active' : ''}`}
                  onClick={() => setIsAgentModalOpen(true)}
                  title={activeAgent ? `Agente: ${activeAgent.name}` : 'Gerenciar agentes'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                    <path d="M2 17L12 22L22 17"/>
                    <path d="M2 12L12 17L22 12"/>
                  </svg>
                  {activeAgent && <span className="agent-indicator"></span>}
                </button>
              </>
            )}
            <UserMenu />
          </div>
        </div>

        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <h1>Como posso ajudar?</h1>
              <div className="config-info">
                <p>💡 Comece uma nova conversa ou selecione uma conversa existente na barra lateral</p>
              </div>
              <div className="suggested-prompts">
                <div className="prompt-grid">
                  <button 
                    className="prompt-suggestion"
                    onClick={() => handlePromptSuggestion('Crie uma história criativa')}
                  >
                    Crie uma história criativa
                  </button>
                  <button 
                    className="prompt-suggestion"
                    onClick={() => handlePromptSuggestion('Me ajude a planejar')}
                  >
                    Me ajude a planejar
                  </button>
                  <button 
                    className="prompt-suggestion"
                    onClick={() => handlePromptSuggestion('Me ensine algo novo')}
                  >
                    Me ensine algo novo
                  </button>
                  <button 
                    className="prompt-suggestion"
                    onClick={() => handlePromptSuggestion('Brainstorm comigo')}
                  >
                    Brainstorm comigo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div key={message.id || index} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
                  {message.sender === 'user' && (
                    <div className="message-avatar user-avatar-small">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                  {message.sender === 'assistant' && (
                    <div className="message-avatar assistant-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C14.8 12.6 14.4 13.5 13.5 14.2C13.3 14.4 13.2 14.7 13.2 15V16H10.8V15C10.8 14.4 11.1 13.9 11.5 13.6C12.2 13.1 12.2 12.5 12.2 11.5V10C12.2 9.2 12.6 9.2 12 9.2S9.8 9.2 9.8 10H7.2C7.2 8.6 8.6 7 12 7M10.8 17.5H13.2V19H10.8V17.5Z"/>
                      </svg>
                    </div>
                  )}
                  <div className="message-content">
                    {editingMessage === index ? (
                      <div className="edit-message-form">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="edit-textarea"
                          rows="3"
                        />
                        <div className="edit-actions">
                          <button 
                            className="save-edit-btn"
                            onClick={() => handleSaveEdit(index)}
                          >
                            ✓ Salvar
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={handleCancelEdit}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>                        {message.images && message.images.length > 0 && (
                          <div className="message-images">
                            {message.images.map((image) => (
                              <div key={image.id} className="message-image">
                                <img src={image.dataUrl} alt={image.name} />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="message-text">
                          <FormattedMessage content={message.text} />
                        </div>
                        <div className="message-actions">
                          <button
                            className={`favorite-btn ${favoriteMessages.includes(message.id) ? 'favorited' : ''}`}
                            onClick={() => handleToggleFavorite(message.id)}
                            title={favoriteMessages.includes(message.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          >
                            {favoriteMessages.includes(message.id) ? '⭐' : '☆'}
                          </button>
                          {message.sender === 'assistant' && (
                            <button 
                              className="regenerate-btn"
                              onClick={() => handleRegenerateResponse(index)}
                              title="Regenerar resposta"
                              disabled={isLoading}
                            >
                              🔄
                            </button>
                          )}
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditMessage(index, message.text)}
                            title="Editar mensagem"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteMessage(index)}
                            title="Excluir mensagem"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant loading">
                  <div className="message-avatar assistant-avatar">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C14.8 12.6 14.4 13.5 13.5 14.2C13.3 14.4 13.2 14.7 13.2 15V16H10.8V15C10.8 14.4 11.1 13.9 11.5 13.6C12.2 13.1 12.2 12.5 12.2 11.5V10C12.2 9.2 12.6 9.2 12 9.2S9.8 9.2 9.8 10H7.2C7.2 8.6 8.6 7 12 7M10.8 17.5H13.2V19H10.8V17.5Z"/>
                     </svg>
                   </div>
                  <div className="message-content">
                    <div className="typing-status">{typingStatus}</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="input-container">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onRemoveImage={handleRemoveImage}
            selectedImages={selectedImages}
          />
          {(advancedSettings.showTokenCount || tokenCount > 0) && (
            <div className="token-counter">
              <span className="token-count">{tokenCount} tokens estimados</span>
              <span className="token-limit">/ {advancedSettings.maxTokens} máx</span>
            </div>
          )}
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte alguma coisa"
              className="message-input"
              rows={1}
            />
            <button 
              className="attachment-button"
              onClick={() => document.getElementById('file-input').click()}
              title="Anexar arquivos e imagens"
            >
              📎
            </button>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imageData = {
                        id: Date.now() + Math.random(),
                        file,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        dataUrl: event.target.result
                      };
                      handleImageSelect(imageData);
                    };
                    reader.readAsDataURL(file);
                  });
                }
                e.target.value = '';
              }}
            />
            <button 
              onClick={handleSendMessage}
              className="send-button"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">⟳</span>
              ) : (
                <span className="send-icon">↑</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <AdvancedSettings
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        onSave={handleSaveAdvancedSettings}
      />
      
      <APIKeyManager
        isOpen={showAPIKeyManager}
        onClose={() => setShowAPIKeyManager(false)}
      />
      
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        activeAgent={activeAgent}
        onAgentChange={setActiveAgent}
      />
      
      <ModelSelector
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        currentProvider={currentAIProvider}
        onProviderChange={setCurrentAIProvider}
        currentModel={currentGPT?.name}
        onModelChange={(model) => setCurrentGPT({ name: model })}
      />
      
      <UsageDashboard
        isOpen={showUsageDashboard}
        onClose={() => setShowUsageDashboard(false)}
        currentProvider={currentAIProvider}
      />
      
      <ModelSearcher
        isOpen={showModelSearcher}
        onClose={() => setShowModelSearcher(false)}
        onModelSelect={(model) => {
          setCurrentGPT({ name: model.name });
          setShowModelSearcher(false);
        }}
      />
      

      
      <ProviderSpecificSettings
        isOpen={showProviderSettings}
        onClose={() => setShowProviderSettings(false)}
        currentProvider={currentAIProvider}
      />
      
      <AgentImportExport
        isOpen={showAgentImportExport}
        onClose={() => setShowAgentImportExport(false)}
        activeAgent={activeAgent}
        onAgentChange={setActiveAgent}
      />
      
      <BrazilianFlags />
    </div>
  );
}

export default App;
