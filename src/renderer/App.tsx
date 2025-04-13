import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App montado, iniciando carregamento...');
    // Simulação de carregamento inicial
    const initApp = async () => {
      try {
        // Carregar configurações se necessário
        if (window.electron) {
          console.log('Tentando carregar configurações...');
          await window.electron.getSettings();
          console.log('Configurações carregadas');
        } else {
          console.log('API Electron não disponível');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao inicializar a aplicação:', err);
        setError(t('errors.unknownError'));
        setIsLoading(false);
      }
    };

    initApp();
  }, [t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl">{t('common.loading')}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <h2 className="text-2xl mb-2">{t('errors.unknownError')}</h2>
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              {t('common.reload')}
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  console.log('Renderizando App com estado:', { isLoading, error, currentView });

  return (
    <ThemeProvider>
      {({ isDarkMode }) => (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar 
              currentView={currentView}
              onChangeView={setCurrentView}
              isDarkMode={isDarkMode}
            />
            <main className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

export default App; 