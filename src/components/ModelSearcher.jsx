import React, { useState, useEffect, useCallback } from 'react';
import './ModelSearcher.css';
import { aiManager } from '../services/aiService';

const ModelSearcher = ({ isOpen, onClose, onModelSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    task: 'all',
    sort: 'downloads',
    library: 'all'
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const searchModels = useCallback(async (query, currentFilters, currentPage = 1, append = false) => {
    if (!query.trim() && currentFilters.task === 'all') return;

    setLoading(true);
    setError(null);

    try {
      const huggingfaceService = aiManager.getService('huggingface');
      
      if (huggingfaceService && typeof huggingfaceService.searchModels === 'function') {
        const searchParams = {
          search: query.trim(),
          task: currentFilters.task !== 'all' ? currentFilters.task : undefined,
          sort: currentFilters.sort,
          library: currentFilters.library !== 'all' ? currentFilters.library : undefined,
          limit: 20,
          offset: (currentPage - 1) * 20
        };

        const results = await huggingfaceService.searchModels(searchParams);
        
        if (append) {
          setModels(prev => [...prev, ...results.models]);
        } else {
          setModels(results.models);
        }
        
        setHasMore(results.hasMore);
      } else {
        // Fallback com dados simulados
        const mockResults = generateMockResults(query, currentFilters, currentPage);
        
        if (append) {
          setModels(prev => [...prev, ...mockResults.models]);
        } else {
          setModels(mockResults.models);
        }
        
        setHasMore(mockResults.hasMore);
      }
    } catch (err) {
      console.error('Erro ao buscar modelos:', err);
      setError('Erro ao buscar modelos. Tente novamente.');
      
      // Fallback em caso de erro
      if (!append) {
        const mockResults = generateMockResults(searchTerm, filters, 1);
        setModels(mockResults.models);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMockResults = (query, currentFilters, currentPage) => {
    const mockModels = [
      {
        id: 'microsoft/DialoGPT-medium',
        name: 'DialoGPT Medium',
        author: 'microsoft',
        description: 'A conversational AI model trained on Reddit conversations',
        task: 'conversational',
        downloads: 125000,
        likes: 450,
        library: 'transformers',
        tags: ['conversational', 'dialogue', 'chatbot'],
        createdAt: '2023-01-15'
      },
      {
        id: 'facebook/blenderbot-400M-distill',
        name: 'BlenderBot 400M',
        author: 'facebook',
        description: 'A chatbot model that can engage in conversations',
        task: 'conversational',
        downloads: 89000,
        likes: 320,
        library: 'transformers',
        tags: ['conversational', 'chatbot', 'dialogue'],
        createdAt: '2023-02-10'
      },
      {
        id: 'microsoft/CodeBERT-base',
        name: 'CodeBERT Base',
        author: 'microsoft',
        description: 'A pre-trained model for programming language understanding',
        task: 'text-classification',
        downloads: 67000,
        likes: 280,
        library: 'transformers',
        tags: ['code', 'programming', 'bert'],
        createdAt: '2023-03-05'
      },
      {
        id: 'sentence-transformers/all-MiniLM-L6-v2',
        name: 'All MiniLM L6 v2',
        author: 'sentence-transformers',
        description: 'Sentence embedding model for semantic similarity',
        task: 'sentence-similarity',
        downloads: 234000,
        likes: 890,
        library: 'sentence-transformers',
        tags: ['sentence-transformers', 'embeddings', 'similarity'],
        createdAt: '2023-01-20'
      },
      {
        id: 'distilbert-base-uncased',
        name: 'DistilBERT Base Uncased',
        author: 'huggingface',
        description: 'A distilled version of BERT for faster inference',
        task: 'fill-mask',
        downloads: 456000,
        likes: 1200,
        library: 'transformers',
        tags: ['bert', 'distilled', 'nlp'],
        createdAt: '2022-12-10'
      }
    ];

    // Filtrar por query
    let filtered = mockModels;
    if (query.trim()) {
      filtered = mockModels.filter(model =>
        model.name.toLowerCase().includes(query.toLowerCase()) ||
        model.description.toLowerCase().includes(query.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filtrar por task
    if (currentFilters.task !== 'all') {
      filtered = filtered.filter(model => model.task === currentFilters.task);
    }

    // Filtrar por library
    if (currentFilters.library !== 'all') {
      filtered = filtered.filter(model => model.library === currentFilters.library);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (currentFilters.sort) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'likes':
          return b.likes - a.likes;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    // Paginação
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedModels = filtered.slice(startIndex, endIndex);

    return {
      models: paginatedModels,
      hasMore: endIndex < filtered.length
    };
  };

  const debouncedSearch = useCallback(
    debounce((query, currentFilters) => {
      setPage(1);
      searchModels(query, currentFilters, 1, false);
    }, 500),
    [searchModels]
  );

  useEffect(() => {
    if (isOpen) {
      // Buscar modelos populares ao abrir
      searchModels('', { ...filters, task: 'all' }, 1, false);
    }
  }, [isOpen, searchModels]);

  useEffect(() => {
    debouncedSearch(searchTerm, filters);
  }, [searchTerm, filters, debouncedSearch]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchModels(searchTerm, filters, nextPage, true);
  };

  const handleModelSelect = (model) => {
    if (onModelSelect) {
      onModelSelect(model);
    }
    onClose();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTaskIcon = (task) => {
    const icons = {
      'conversational': '💬',
      'text-classification': '📝',
      'sentence-similarity': '🔗',
      'fill-mask': '🎭',
      'text-generation': '✍️',
      'question-answering': '❓',
      'summarization': '📄',
      'translation': '🌐'
    };
    return icons[task] || '🤖';
  };

  if (!isOpen) return null;

  return (
    <div className="model-searcher-overlay">
      <div className="model-searcher-modal">
        <div className="model-searcher-header">
          <div className="header-info">
            <h3>🔍 Buscar Modelos</h3>
            <p>Explore modelos do Hugging Face Hub</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="model-searcher-content">
          <div className="search-controls">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Buscar modelos por nome, descrição ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filters-container">
              <div className="filter-group">
                <label>Tarefa:</label>
                <select
                  value={filters.task}
                  onChange={(e) => handleFilterChange('task', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas</option>
                  <option value="conversational">Conversacional</option>
                  <option value="text-classification">Classificação</option>
                  <option value="sentence-similarity">Similaridade</option>
                  <option value="fill-mask">Fill Mask</option>
                  <option value="text-generation">Geração de Texto</option>
                  <option value="question-answering">Q&A</option>
                  <option value="summarization">Resumo</option>
                  <option value="translation">Tradução</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Ordenar por:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="filter-select"
                >
                  <option value="downloads">Downloads</option>
                  <option value="likes">Likes</option>
                  <option value="recent">Mais Recentes</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Biblioteca:</label>
                <select
                  value={filters.library}
                  onChange={(e) => handleFilterChange('library', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas</option>
                  <option value="transformers">Transformers</option>
                  <option value="sentence-transformers">Sentence Transformers</option>
                  <option value="diffusers">Diffusers</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="models-container">
            {loading && models.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Buscando modelos...</p>
              </div>
            ) : models.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Nenhum modelo encontrado</p>
                <p className="empty-subtitle">Tente ajustar os filtros ou termo de busca</p>
              </div>
            ) : (
              <>
                <div className="models-grid">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="model-card"
                      onClick={() => handleModelSelect(model)}
                    >
                      <div className="model-header">
                        <div className="model-title">
                          <span className="task-icon">{getTaskIcon(model.task)}</span>
                          <div className="title-info">
                            <h4 className="model-name">{model.name}</h4>
                            <span className="model-author">@{model.author}</span>
                          </div>
                        </div>
                        <div className="model-stats">
                          <span className="downloads" title="Downloads">
                            📥 {formatNumber(model.downloads)}
                          </span>
                          <span className="likes" title="Likes">
                            ❤️ {formatNumber(model.likes)}
                          </span>
                        </div>
                      </div>

                      <p className="model-description">{model.description}</p>

                      <div className="model-tags">
                        {model.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                        {model.tags.length > 3 && (
                          <span className="tag-more">+{model.tags.length - 3}</span>
                        )}
                      </div>

                      <div className="model-footer">
                        <span className="model-task">{model.task}</span>
                        <span className="model-library">{model.library}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="button-spinner"></div>
                          Carregando...
                        </>
                      ) : (
                        'Carregar Mais'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="model-searcher-footer">
          <div className="results-info">
            {models.length > 0 && (
              <span>{models.length} modelo(s) encontrado(s)</span>
            )}
          </div>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSearcher;