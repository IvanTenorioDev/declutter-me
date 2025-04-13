import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface ThemeProviderProps {
  children: (context: ThemeContextProps) => ReactNode;
}

export const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Try to get the setting from localStorage first
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme !== null) {
      return storedTheme === 'true';
    }
    
    // Otherwise, use system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (window.electron) {
          const settings = await window.electron.getSettings();
          if (settings && settings.theme) {
            if (settings.theme === 'dark') {
              setIsDarkMode(true);
            } else if (settings.theme === 'light') {
              setIsDarkMode(false);
            }
            // If theme is 'system', we already set it based on system preference
          }
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    };

    loadSettings();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    // Save to electron settings if available
    try {
      if (window.electron) {
        const settings = await window.electron.getSettings();
        settings.theme = newMode ? 'dark' : 'light';
        await window.electron.saveSettings(settings);
      }
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children(value)}
    </ThemeContext.Provider>
  );
}; 