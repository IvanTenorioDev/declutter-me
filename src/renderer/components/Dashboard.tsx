import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ThemeContext } from '../context/ThemeContext';
import { FileStats } from '../../types/interfaces';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);
  const [scanProgress, setProgress] = useState(0);
  const [fileStats, setFileStats] = useState<FileStats>({
    total: 0,
    byType: {}
  });

  // Simula a obtenção de estatísticas para demonstração
  useEffect(() => {
    console.log('Dashboard montado');
    // Esta função seria substituída pela chamada real para a API do Electron
    const fetchStats = () => {
      // Dados de exemplo
      const mockStats = {
        total: 1250,
        byType: {
          'pdf': 342,
          'jpg': 256,
          'docx': 189,
          'xlsx': 145,
          'outros': 318
        }
      };
      
      setFileStats(mockStats);
    };

    fetchStats();
  }, []);

  // Configura o callback para atualização de progresso
  useEffect(() => {
    let unsubscribeFunc: (() => void) | undefined;
    
    if (typeof window !== 'undefined' && window.electron) {
      const handleProgressUpdate = (progress: number) => {
        setProgress(progress);
      };
      
      // Registrar callback para atualização do progresso
      try {
        const result = window.electron.getScanProgress(handleProgressUpdate);
        if (typeof result === 'function') {
          unsubscribeFunc = result;
        }
      } catch (e) {
        console.error('Erro ao registrar callback de progresso:', e);
      }
    }
    
    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc();
      }
    };
  }, []);

  // Função para iniciar scan
  const handleStartScan = () => {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        window.electron.startScan();
      } catch (e) {
        console.error('Erro ao iniciar scan:', e);
      }
    }
  };

  // Prepara dados para o gráfico
  const chartData = {
    labels: Object.keys(fileStats.byType).map(type => `${type} (${fileStats.byType[type]})`),
    datasets: [
      {
        label: t('dashboard.filesByType'),
        data: Object.values(fileStats.byType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {t('dashboard.title')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('dashboard.statistics')}
          </h3>
          <div className="mb-4">
            <p>{t('dashboard.totalFiles', { count: fileStats.total })}</p>
          </div>
          
          <div className="w-full h-64">
            <Pie 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: isDarkMode ? 'white' : 'black'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {t('dashboard.scanStatus')}
          </h3>
          
          {scanProgress > 0 ? (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {scanProgress}% {t('dashboard.complete')}
              </p>
            </div>
          ) : (
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('dashboard.noActiveScan')}
            </p>
          )}
          
          <button 
            onClick={handleStartScan}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            {t('dashboard.startScan')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 