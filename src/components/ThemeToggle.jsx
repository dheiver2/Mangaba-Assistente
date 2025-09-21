import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '', size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${size} ${className}`}
      title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <div className="toggle-track">
        <div className={`toggle-thumb ${isDarkMode ? 'dark' : 'light'}`}>
          {isDarkMode ? (
            <Moon className="toggle-icon" />
          ) : (
            <Sun className="toggle-icon" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;