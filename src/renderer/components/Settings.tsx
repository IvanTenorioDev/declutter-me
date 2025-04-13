import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import { supportedLanguages, changeLanguage } from '../i18n/i18n';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const [settings, setSettings] = useState({
    language: i18n.language || 'pt-BR',
    theme: isDarkMode ? 'dark' : 'light',
    autoOrganize: false,
    scanOnStartup: false,
    defaultDirectory: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Load settings from Electron
    const loadSettings = async () => {
      try {
        if (window.electron) {
          const electronSettings = await window.electron.getSettings();
          setSettings(prev => ({
            ...prev,
            ...electronSettings
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSettings(prev => ({ ...prev, language: newLanguage }));
    await changeLanguage(newLanguage);
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setSettings(prev => ({ ...prev, theme: newTheme }));
    
    if (newTheme === 'dark' && !isDarkMode) {
      toggleDarkMode();
    } else if (newTheme === 'light' && isDarkMode) {
      toggleDarkMode();
    }
  };
  
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleDirectorySelect = async () => {
    try {
      if (window.electron) {
        const dir = await window.electron.selectDirectory();
        if (dir) {
          setSettings(prev => ({ ...prev, defaultDirectory: dir }));
        }
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };
  
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      if (window.electron) {
        await window.electron.saveSettings(settings);
        setSaveMessage(t('settings.savedSuccessfully'));
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(t('settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetSettings = async () => {
    if (window.confirm(t('settings.confirmReset'))) {
      try {
        // Reset to default settings
        const defaultSettings = {
          language: 'pt-BR',
          theme: 'light',
          autoOrganize: false,
          scanOnStartup: false,
          defaultDirectory: ''
        };
        
        setSettings(defaultSettings);
        
        if (window.electron) {
          await window.electron.saveSettings(defaultSettings);
        }
        
        // Update language and theme
        await changeLanguage(defaultSettings.language);
        if (isDarkMode) {
          toggleDarkMode();
        }
        
        setSaveMessage(t('settings.resetSuccessfully'));
      } catch (error) {
        console.error('Error resetting settings:', error);
        setSaveMessage(t('settings.resetError'));
      }
    }
  };
  
  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {t('settings.title')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('settings.language')}
            </label>
            <select
              value={settings.language}
              onChange={handleLanguageChange}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('settings.theme')}
            </label>
            <select
              value={settings.theme}
              onChange={handleThemeChange}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="light">{t('settings.light')}</option>
              <option value="dark">{t('settings.dark')}</option>
              <option value="system">{t('settings.system')}</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('settings.defaultDirectory')}
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={settings.defaultDirectory}
                readOnly
                className={`flex-1 p-2 rounded-l border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('settings.noDirectorySelected')}
              />
              <button
                onClick={handleDirectorySelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
              >
                {t('common.browse')}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                name="scanOnStartup"
                checked={settings.scanOnStartup}
                onChange={handleToggleChange}
                className="mr-2 h-5 w-5"
              />
              <span>{t('settings.scanOnStartup')}</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                name="autoOrganize"
                checked={settings.autoOrganize}
                onChange={handleToggleChange}
                className="mr-2 h-5 w-5"
              />
              <span>{t('settings.autoOrganize')}</span>
            </label>
          </div>
          
          <div className="mt-10">
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={`w-full py-2 px-4 rounded font-medium mb-4 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
            
            <button
              onClick={resetSettings}
              className={`w-full py-2 px-4 rounded font-medium ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {t('settings.resetSettings')}
            </button>
          </div>
        </div>
      </div>
      
      {saveMessage && (
        <div className={`mt-6 p-3 rounded ${
          saveMessage.includes('Error') 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default Settings; 