import './styles/tailwind.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n/i18n'; // Restaurar i18n

// Função de inicialização segura
function initApp() {
  console.log('Iniciando aplicação React...');

  // Verificar se o elemento root existe
  const container = document.getElementById('root');
  console.log('Elemento root:', container);

  if (!container) {
    console.error('Elemento root não encontrado!');
    return;
  }

  try {
    // Criar root do React
    console.log('Criando root do React...');
    const root = createRoot(container);

    // Renderizar aplicativo principal
    console.log('Renderizando App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('Aplicação React inicializada com sucesso');
  } catch (error) {
    console.error('Erro na renderização:', error);
    
    // Tentar renderização alternativa caso haja erro
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; font-family: Arial; color: red;">
          <h1>Erro na Inicialização do React</h1>
          <p>${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `;
    }
  }
}

// Iniciar o app quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp); 