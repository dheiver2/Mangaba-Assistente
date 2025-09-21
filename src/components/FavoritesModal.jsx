import React from 'react';
import './FavoritesModal.css';

const FavoritesModal = ({ isOpen, onClose, favoriteMessages, conversations }) => {
  if (!isOpen) return null;

  const getFavoriteMessagesData = () => {
    const favoriteData = [];
    
    conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (favoriteMessages.includes(message.id)) {
          favoriteData.push({
            ...message,
            conversationTitle: conversation.title || 'Nova Conversa',
            conversationId: conversation.id
          });
        }
      });
    });
    
    return favoriteData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const favoriteData = getFavoriteMessagesData();

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="favorites-modal-overlay" onClick={onClose}>
      <div className="favorites-modal" onClick={(e) => e.stopPropagation()}>
        <div className="favorites-modal-header">
          <h2>Mensagens Favoritas</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="favorites-modal-content">
          {favoriteData.length === 0 ? (
            <div className="no-favorites">
              <p>Nenhuma mensagem favorita encontrada.</p>
              <p>Use o botão ⭐ nas mensagens para adicioná-las aos favoritos.</p>
            </div>
          ) : (
            <div className="favorites-list">
              {favoriteData.map((message) => (
                <div key={message.id} className="favorite-item">
                  <div className="favorite-header">
                    <span className="conversation-title">{message.conversationTitle}</span>
                    <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div className="favorite-content">
                    <div className="message-role">
                      {message.role === 'user' ? '👤 Você' : '🤖 Assistente'}
                    </div>
                    {message.images && message.images.length > 0 && (
                      <div className="message-images-preview">
                        {message.images.map((image) => (
                          <div key={image.id} className="image-preview">
                            <img src={image.dataUrl} alt={image.name} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="message-text">{message.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;