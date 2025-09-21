import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onImageSelect, onRemoveImage, selectedImages = [] }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isImage) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return false;
      }
      
      if (!isValidSize) {
        alert('O arquivo deve ter no máximo 10MB.');
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result
        };
        onImageSelect(imageData);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="image-upload-container">
      {/* Upload Area */}
      <div
        className={`image-upload-area ${
          isDragOver ? 'drag-over' : ''
        } ${selectedImages.length > 0 ? 'has-images' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {selectedImages.length > 0 && (
            <p className="upload-text">
              <strong>Adicionar mais imagens</strong>
              <br />
              <span>{selectedImages.length} imagem(ns) selecionada(s)</span>
            </p>
          )}
        </div>
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="selected-images">
          <div className="images-header">
            <span>Imagens selecionadas ({selectedImages.length})</span>
          </div>
          <div className="images-grid">
            {selectedImages.map((image) => (
              <div key={image.id} className="image-preview">
                <div className="image-container">
                  <img src={image.dataUrl} alt={image.name} />
                  <button
                    className="remove-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                    title="Remover imagem"
                  >
                    ×
                  </button>
                </div>
                <div className="image-info">
                  <div className="image-name" title={image.name}>
                    {image.name}
                  </div>
                  <div className="image-size">
                    {formatFileSize(image.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;