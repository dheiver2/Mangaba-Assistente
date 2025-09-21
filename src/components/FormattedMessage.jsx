import React, { useState, useEffect } from 'react';
import './FormattedMessage.css';

const FormattedMessage = ({ content, sender, timestamp }) => {
  const [formattedContent, setFormattedContent] = useState('');
  const [isCodeExpanded, setIsCodeExpanded] = useState({});
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState({});

  // Configuração de linguagens para syntax highlighting
  const codeLanguages = {
    javascript: 'JavaScript',
    js: 'JavaScript',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    python: 'Python',
    py: 'Python',
    java: 'Java',
    csharp: 'C#',
    cs: 'C#',
    cpp: 'C++',
    c: 'C',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    bash: 'Bash',
    shell: 'Shell',
    sh: 'Shell',
    markdown: 'Markdown',
    md: 'Markdown',
    dockerfile: 'Dockerfile',
    rust: 'Rust',
    go: 'Go',
    php: 'PHP',
    ruby: 'Ruby',
    rb: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    dart: 'Dart',
    r: 'R',
    matlab: 'MATLAB'
  };

  // Parser de Markdown aprimorado
  const parseMarkdown = (text) => {
    if (!text) return '';

    let processedText = text;

    // Headers (# ## ###)
    processedText = processedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    processedText = processedText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    processedText = processedText.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold (**text**)
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*)
    processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code (`code`)
    processedText = processedText.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

    // Code blocks (```language\ncode\n```)
    processedText = processedText.replace(
      /```(\w+)?\n([\s\S]*?)\n```/g,
      (match, lang, code) => {
        const language = lang || 'plaintext';
        const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return createCodeBlock(code.trim(), language, codeId);
      }
    );

    // Blockquotes (> quote)
    processedText = processedText.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Lists
    processedText = processedText.replace(/^\- (.*$)/gim, '<li>$1</li>');
    processedText = processedText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    processedText = processedText.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    processedText = processedText.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

    // Links [text](url)
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Tables
    processedText = processedText.replace(
      /\|(.+)\|\n\|([-:]+[-| :]*)\|\n((?:\|.+\|\n?)*)/g,
      createTable
    );

    // Horizontal rules
    processedText = processedText.replace(/^---$/gm, '<hr>');

    // Line breaks
    processedText = processedText.replace(/\n/g, '<br>');

    return processedText;
  };

  // Criar bloco de código com syntax highlighting
  const createCodeBlock = (code, language, codeId) => {
    const langName = codeLanguages[language.toLowerCase()] || 'Code';
    const highlightedCode = highlightSyntax(code, language);
    
    return `
      <div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">${langName}</span>
          <div class="code-actions">
            <button class="copy-btn" data-code="${codeId}" title="Copiar código">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="expand-btn" data-code="${codeId}" title="Expandir/Recolher">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <pre class="code-block language-${language}" data-code-id="${codeId}">
          <code>${highlightedCode}</code>
        </pre>
      </div>
    `;
  };

  // Syntax highlighting básico
  const highlightSyntax = (code, language) => {
    const keywords = {
      javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'with', 'as', 'lambda'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while'],
      typescript: ['interface', 'type', 'enum', 'namespace', 'declare', 'readonly', 'private', 'public', 'protected', 'implements', 'extends']
    };

    let highlightedCode = code;
    
    // Escapar HTML
    highlightedCode = highlightedCode.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comentários
    if (language === 'javascript' || language === 'typescript') {
      highlightedCode = highlightedCode.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
      highlightedCode = highlightedCode.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    } else if (language === 'python') {
      highlightedCode = highlightedCode.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
      highlightedCode = highlightedCode.replace(/("""[\s\S]*?""")/g, '<span class="comment">$1</span>');
    }

    // Strings
    highlightedCode = highlightedCode.replace(/("[^"]*")/g, '<span class="string">$1</span>');
    highlightedCode = highlightedCode.replace(/('[^']*')/g, '<span class="string">$1</span>');

    // Palavras-chave
    const languageKeywords = keywords[language] || [];
    languageKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="keyword">${keyword}</span>`);
    });

    // Números
    highlightedCode = highlightedCode.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="number">$1</span>');

    return highlightedCode;
  };

  // Criar tabela formatada
  const createTable = (match, header, separator, body) => {
    const headers = header.split('|').map(h => h.trim()).filter(h => h);
    const rows = body.trim().split('\n').map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    let table = '<div class="table-container"><table class="formatted-table">';
    
    // Header
    table += '<thead><tr>';
    headers.forEach(h => {
      table += `<th>${h}</th>`;
    });
    table += '</tr></thead>';
    
    // Body
    table += '<tbody>';
    rows.forEach(row => {
      table += '<tr>';
      row.forEach(cell => {
        table += `<td>${cell}</td>`;
      });
      table += '</tr>';
    });
    table += '</tbody></table></div>';
    
    return table;
  };

  // Função para copiar código
  const handleCopyCode = (codeId, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeBlocks(prev => ({ ...prev, [codeId]: true }));
      setTimeout(() => {
        setCopiedCodeBlocks(prev => ({ ...prev, [codeId]: false }));
      }, 2000);
    });
  };

  // Função para alternar expansão de código
  const toggleCodeExpansion = (codeId) => {
    setIsCodeExpanded(prev => ({ ...prev, [codeId]: !prev[codeId] }));
  };

  // Processar conteúdo quando mudar
  useEffect(() => {
    if (content) {
      const processed = parseMarkdown(content);
      setFormattedContent(processed);
    }
  }, [content]);

  // Adicionar event listeners para botões interativos
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('.copy-btn')) {
        const btn = e.target.closest('.copy-btn');
        const codeId = btn.getAttribute('data-code');
        const codeElement = document.querySelector(`pre[data-code-id="${codeId}"] code`);
        if (codeElement) {
          const code = codeElement.textContent;
          handleCopyCode(codeId, code);
        }
      }
      
      if (e.target.closest('.expand-btn')) {
        const btn = e.target.closest('.expand-btn');
        const codeId = btn.getAttribute('data-code');
        toggleCodeExpansion(codeId);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="formatted-message">
      <div 
        className="message-content formatted-content"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
      
      {/* Indicadores de cópia */}
      {Object.entries(copiedCodeBlocks).map(([codeId, copied]) => copied && (
        <div key={codeId} className="copy-notification">
          Código copiado!
        </div>
      ))}
    </div>
  );
};

export default FormattedMessage;