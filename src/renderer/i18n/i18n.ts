import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traduções com tratamento de erro
let ptBR = {};
let enUS = {};

try {
  console.log('Carregando traduções...');
  ptBR = require('./translations/pt-BR.json');
  enUS = require('./translations/en-US.json');
  console.log('Traduções carregadas com sucesso');
} catch (error) {
  console.error('Erro ao carregar traduções:', error);
  // Adicionar traduções mínimas para não quebrar a interface
  ptBR = {
    app: { title: 'DeclutterMe' },
    dashboard: { title: 'Painel' },
    common: { loading: 'Carregando...' }
  };
  enUS = {
    app: { title: 'DeclutterMe' },
    dashboard: { title: 'Dashboard' },
    common: { loading: 'Loading...' }
  };
}

// Recursos de tradução disponíveis
const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  }
};

// Detectar idioma do navegador de forma síncrona (para inicialização)
const detectUserLanguageSync = (): string => {
  try {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) return storedLanguage;
    
    // Se não há idioma armazenado, usar a preferência do navegador
    if (navigator.language) {
      return navigator.language;
    }
  } catch (error) {
    console.error('Erro ao detectar idioma:', error);
  }
  
  return 'pt-BR'; // Idioma padrão
};

console.log('Inicializando i18n...');

// Inicialização do i18n
try {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: detectUserLanguageSync(),
      fallbackLng: 'pt-BR',
      interpolation: {
        escapeValue: false // não necessário para React
      },
      react: {
        useSuspense: false // alterado para false para evitar problemas de renderização
      }
    });
  console.log('i18n inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar i18n:', error);
}

// Carregar configurações após inicialização
const loadSettingsLater = async () => {
  try {
    if (window.electron) {
      const settings = await window.electron.getSettings();
      if (settings && settings.language && settings.language !== i18n.language) {
        await i18n.changeLanguage(settings.language);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar configurações de idioma:', error);
  }
};

// Tentar carregar as configurações se estiver no ambiente do Electron
try {
  if (typeof window !== 'undefined' && window.electron) {
    loadSettingsLater();
  }
} catch (error) {
  console.error('Erro ao verificar ambiente Electron:', error);
}

// Função para alterar o idioma
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    
    // Tentar salvar a configuração no Electron, se disponível
    if (window.electron) {
      const settings = await window.electron.getSettings();
      settings.language = language;
      await window.electron.saveSettings(settings);
    }
  } catch (error) {
    console.error('Erro ao salvar configuração de idioma:', error);
  }
};

// Exportar lista de idiomas suportados
export const supportedLanguages = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'en-US', name: 'English (US)' }
];

export default i18n; 