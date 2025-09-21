import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import ExportModal from './ExportModal';
import FavoritesModal from './FavoritesModal';
import AISelector from './AISelector';
import GPTSelector from './GPTSelector';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  isCollapsed,
  onToggleCollapse,
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  onExportConversation,
  favoriteMessages,
  onOpenAdvancedSettings,
  currentAIProvider,
  onProviderChange,
  onConfigureAPI,
  currentGPT,
  onSelectGPT
}) => {
  const { toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [conversationToExport, setConversationToExport] = useState(null);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    // Busca simples por título ou conteúdo das mensagens
    const titleMatch = conv.title.toLowerCase().includes(searchTerm.toLowerCase());
    const messageMatch = conv.messages && conv.messages.some(msg => 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return titleMatch || messageMatch;
  });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const groupConversationsByDate = (conversations) => {
    const groups = {};
    conversations.forEach(conv => {
      const dateKey = formatDate(conv.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(conv);
    });
    return groups;
  };

  const conversationGroups = groupConversationsByDate(filteredConversations);

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight">{part}</mark> : 
        part
    );
  };

  const handleExportClick = (conversation, e) => {
    e.stopPropagation();
    setConversationToExport(conversation);
    setShowExportModal(true);
  };

  const handleExport = (conversation, options) => {
    if (onExportConversation) {
      onExportConversation(conversation, options);
    }
    setShowExportModal(false);
    setConversationToExport(null);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle}></div>
      )}
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header da Sidebar */}
        <div className="sidebar-header">
          {/* Botão Principal - Nova Conversa */}
          <button className="new-chat-btn" onClick={onNewConversation} title="Iniciar nova conversa" aria-label="Iniciar nova conversa">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          
          {/* Barra de Ações Simplificada */}
          <div className="action-bar">
            <button 
              className="action-btn favorites-btn" 
              onClick={() => setShowFavoritesModal(true)}
              title="Ver conversas favoritas"
              aria-label="Favoritos"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            
            <button 
              className="action-btn settings-btn" 
              onClick={onOpenAdvancedSettings}
              title="Abrir configurações"
              aria-label="Configurações"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 4m-7 7l-2.5 2.5M7.5 4.5L5 7m7 7l2.5 2.5"/>
              </svg>
            </button>
            
            <div className="divider"></div>
            
            <button 
              className="action-btn collapse-btn" 
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isCollapsed ? 
                  <path d="M9 18l6-6-6-6"/> : 
                  <path d="M15 18l-6-6 6-6"/>
                }
              </svg>
            </button>
            
            <button className="action-btn close-btn" onClick={onToggle} title="Fechar sidebar" aria-label="Fechar sidebar">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="sidebar-search">
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar conversas e mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Campo de busca para conversas e mensagens"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
                aria-label="Limpar campo de busca"
              >
                ×
              </button>
            )}
          </div>
          

        </div>

        {/* Lista de Conversas */}
        <div className="conversations-list">
          {Object.keys(conversationGroups).length === 0 ? (
            <div className="no-conversations">
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            Object.entries(conversationGroups).map(([dateGroup, convs]) => (
              <div key={dateGroup} className="conversation-group">
                <div className="group-header">{dateGroup}</div>
                {convs.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      currentConversationId === conversation.id ? 'active' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="conversation-content">
                      <div className="conversation-title">
                        {highlightSearchTerm(conversation.title, searchTerm)}
                      </div>
                      <div className="conversation-preview">
                        {highlightSearchTerm(conversation.lastMessage || 'Conversa vazia', searchTerm)}
                      </div>
                    </div>
                    <div className="conversation-actions">
                      <button
                        className="export-conversation-btn"
                        onClick={(e) => handleExportClick(conversation, e)}
                        title="Exportar conversa"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button
                        className="delete-conversation-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        title="Excluir conversa"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer da Sidebar */}
        <div className="sidebar-footer">
          <ThemeToggle size="small" className="sidebar-theme-toggle" />
        </div>
      </div>
      
      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setConversationToExport(null);
        }}
        conversation={conversationToExport}
        onExport={handleExport}
      />
      
      <FavoritesModal
         isOpen={showFavoritesModal}
         onClose={() => setShowFavoritesModal(false)}
         favoriteMessages={favoriteMessages}
         conversations={conversations}
       />
    </>
  );
};

export default Sidebar;