import React from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDarkMode }) => {
  const { t } = useTranslation();
  
  const menuItems = [
    { id: 'dashboard', label: t('dashboard.title'), icon: '📊' },
    { id: 'settings', label: t('settings.title'), icon: '⚙️' },
  ];
  
  return (
    <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="p-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('app.title')}
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          {t('app.description')}
        </p>
      </div>
      
      <nav className="mt-6">
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className="mb-2">
              <button
                onClick={() => onChangeView(item.id)}
                className={`flex items-center w-full p-4 text-left transition-colors ${
                  currentView === item.id
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 w-full p-6">
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          DeclutterMe v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar; 