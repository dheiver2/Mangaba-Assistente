import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy loading dos componentes principais
const LandingPage = lazy(() => import('./components/LandingPage'));
const App = lazy(() => import('./App'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Componente de loading personalizado
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{
      textAlign: 'center',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '20px'
      }}>
        🤖
      </div>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '10px'
      }}>
        AI Chat Brasil
      </h2>
      <p style={{
        fontSize: '1rem',
        opacity: 0.8
      }}>
        Carregando...
      </p>
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Landing Page como página inicial */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Página de login/registro */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Aplicação principal - protegida por autenticação */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirecionamento para landing page se rota não encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;