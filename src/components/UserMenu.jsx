import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import './UserMenu.css';

const UserMenu = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-menu-btn"
      >
        <div className="user-avatar">
          <User className="user-icon" />
        </div>
        <div className="user-info">
          <p className="user-name">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <ChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          {/* Informações do usuário */}
          <div className="user-info-section">
            <div className="user-details">
              <div className="user-avatar-large">
                <User className="user-icon-large" />
              </div>
              <div className="user-text">
                <p className="user-name-large">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
                <p className="user-email-small">{user.email}</p>
                <p className="user-status">● Ativo</p>
              </div>
            </div>
          </div>

          {/* Opções do menu */}
          <div className="menu-options">
            <button className="menu-item">
              <Settings className="menu-icon" />
              Configurações
            </button>
            
            {user.role === 'admin' && (
              <button className="menu-item">
                <Shield className="menu-icon" />
                Painel Admin
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="menu-item logout"
            >
              <LogOut className="menu-icon" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;