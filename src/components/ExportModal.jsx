import React, { useState } from 'react';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose, conversation, onExport }) => {
  const [exportFormat, setExportFormat] = useState('txt');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSystemMessages, setIncludeSystemMessages] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const options = {
      format: exportFormat,
      includeTimestamps,
      includeSystemMessages
    };
    onExport(conversation, options);
    onClose();
  };

  const formatOptions = [
    { value: 'txt', label: 'Texto (.txt)', icon: '📄' },
    { value: 'md', label: 'Markdown (.md)', icon: '📝' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: '📋' },
    { value: 'json', label: 'JSON (.json)', icon: '🔧' }
  ];

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <h3>Exportar Conversa</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="export-modal-content">
          <div className="conversation-info">
            <h4>{conversation?.title || 'Conversa sem título'}</h4>
            <p>{conversation?.messages?.length || 0} mensagens</p>
          </div>

          <div className="export-options">
            <div className="option-group">
              <label>Formato de exportação:</label>
              <div className="format-options">
                {formatOptions.map(option => (
                  <div 
                    key={option.value}
                    className={`format-option ${exportFormat === option.value ? 'selected' : ''}`}
                    onClick={() => setExportFormat(option.value)}
                  >
                    <span className="format-icon">{option.icon}</span>
                    <span className="format-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Opções adicionais:</label>
              <div className="checkbox-options">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  />
                  <span>Incluir timestamps</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeSystemMessages}
                    onChange={(e) => setIncludeSystemMessages(e.target.checked)}
                  />
                  <span>Incluir mensagens do sistema</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="export-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="export-btn" onClick={handleExport}>
            <span className="export-icon">⬇️</span>
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;