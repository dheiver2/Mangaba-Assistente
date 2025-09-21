// Serviço para exportação de conversas

// Função para formatar timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Exportar como TXT
export const exportToTXT = (conversation, options) => {
  const { includeTimestamps, includeSystemMessages } = options;
  let content = `Conversa: ${conversation.title || 'Sem título'}\n`;
  content += `Exportado em: ${formatTimestamp(new Date())}\n`;
  content += `Total de mensagens: ${conversation.messages?.length || 0}\n`;
  content += '='.repeat(50) + '\n\n';

  if (conversation.messages) {
    conversation.messages.forEach((message, index) => {
      if (!includeSystemMessages && message.sender === 'system') return;
      
      const sender = message.sender === 'user' ? 'Usuário' : 'Assistente';
      content += `[${sender}]`;
      
      if (includeTimestamps && message.timestamp) {
        content += ` - ${formatTimestamp(message.timestamp)}`;
      }
      
      content += '\n' + message.text + '\n\n';
    });
  }

  downloadFile(content, `${conversation.title || 'conversa'}.txt`, 'text/plain');
};

// Exportar como Markdown
export const exportToMarkdown = (conversation, options) => {
  const { includeTimestamps, includeSystemMessages } = options;
  let content = `# ${conversation.title || 'Conversa sem título'}\n\n`;
  content += `**Exportado em:** ${formatTimestamp(new Date())}  \n`;
  content += `**Total de mensagens:** ${conversation.messages?.length || 0}\n\n`;
  content += '---\n\n';

  if (conversation.messages) {
    conversation.messages.forEach((message, index) => {
      if (!includeSystemMessages && message.sender === 'system') return;
      
      const sender = message.sender === 'user' ? '👤 **Usuário**' : '🤖 **Assistente**';
      content += `## ${sender}`;
      
      if (includeTimestamps && message.timestamp) {
        content += ` - *${formatTimestamp(message.timestamp)}*`;
      }
      
      content += '\n\n' + message.text + '\n\n---\n\n';
    });
  }

  downloadFile(content, `${conversation.title || 'conversa'}.md`, 'text/markdown');
};

// Exportar como JSON
export const exportToJSON = (conversation, options) => {
  const { includeTimestamps, includeSystemMessages } = options;
  
  const exportData = {
    title: conversation.title || 'Conversa sem título',
    exportedAt: new Date().toISOString(),
    totalMessages: conversation.messages?.length || 0,
    messages: conversation.messages?.filter(message => 
      includeSystemMessages || message.sender !== 'system'
    ).map(message => ({
      sender: message.sender,
      text: message.text,
      ...(includeTimestamps && message.timestamp && { timestamp: message.timestamp }),
      ...(message.id && { id: message.id })
    })) || []
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, `${conversation.title || 'conversa'}.json`, 'application/json');
};

// Exportar como PDF (usando HTML para conversão)
export const exportToPDF = async (conversation, options) => {
  const { includeTimestamps, includeSystemMessages } = options;
  
  // Criar HTML para conversão em PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${conversation.title || 'Conversa'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        .message {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ddd;
        }
        .message.user {
          background-color: #f8f9fa;
          border-left-color: #007bff;
        }
        .message.assistant {
          background-color: #f1f3f4;
          border-left-color: #28a745;
        }
        .message-header {
          font-weight: bold;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sender {
          color: #495057;
        }
        .timestamp {
          font-size: 12px;
          color: #6c757d;
        }
        .message-content {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${conversation.title || 'Conversa sem título'}</div>
        <div class="meta">
          Exportado em: ${formatTimestamp(new Date())}<br>
          Total de mensagens: ${conversation.messages?.length || 0}
        </div>
      </div>
  `;

  if (conversation.messages) {
    conversation.messages.forEach((message) => {
      if (!includeSystemMessages && message.sender === 'system') return;
      
      const senderLabel = message.sender === 'user' ? '👤 Usuário' : '🤖 Assistente';
      const messageClass = message.sender === 'user' ? 'user' : 'assistant';
      
      htmlContent += `
        <div class="message ${messageClass}">
          <div class="message-header">
            <span class="sender">${senderLabel}</span>
            ${includeTimestamps && message.timestamp ? 
              `<span class="timestamp">${formatTimestamp(message.timestamp)}</span>` : ''}
          </div>
          <div class="message-content">${message.text.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    });
  }

  htmlContent += `
    </body>
    </html>
  `;

  // Criar um blob e abrir em nova janela para impressão/salvamento como PDF
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  if (newWindow) {
    newWindow.onload = () => {
      setTimeout(() => {
        newWindow.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  } else {
    // Fallback: download como HTML se popup foi bloqueado
    downloadFile(htmlContent, `${conversation.title || 'conversa'}.html`, 'text/html');
  }
};

// Função auxiliar para download de arquivos
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função principal de exportação
export const exportConversation = (conversation, options) => {
  const { format } = options;
  
  switch (format) {
    case 'txt':
      exportToTXT(conversation, options);
      break;
    case 'md':
      exportToMarkdown(conversation, options);
      break;
    case 'pdf':
      exportToPDF(conversation, options);
      break;
    case 'json':
      exportToJSON(conversation, options);
      break;
    default:
      console.error('Formato de exportação não suportado:', format);
  }
};

export default {
  exportConversation,
  exportToTXT,
  exportToMarkdown,
  exportToPDF,
  exportToJSON
};