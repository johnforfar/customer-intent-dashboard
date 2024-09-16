// Repo: @johnforfar/customer-intent-dashboard File: /packages/frontend/src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Navbar, Card } from 'flowbite-react';
import './index.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Intent {
  id: { S: string };
  intent: { S: string };
  classification: string;
}

const App: React.FC = () => {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [view, setView] = useState<'list' | 'chart'>('chart');
  const [classificationMethod, setClassificationMethod] = useState<'keyword' | 'comprehend' | 'local-model'>('keyword');
  const [totalIntents, setTotalIntents] = useState<number>(0);

  const fetchIntents = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/intents`, {
        params: { method: classificationMethod }
      });
      if (Array.isArray(response.data)) {
        setIntents(response.data);
        setTotalIntents(response.data.length);
      } else {
        console.error('Expected an array of intents, got:', response.data);
      }
    } catch (error) {
      console.error('Error fetching intents:', error);
    }
  }, [classificationMethod]);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  const groupedIntents = intents.reduce((acc, intent) => {
    const classification = intent.classification;
    if (!acc[classification]) {
      acc[classification] = 0;
    }
    acc[classification]++;
    return acc;
  }, {} as Record<string, number>);

  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#41B883', '#E46651', '#00D8FF', '#DD1B16', '#7D4CDB', '#F49D37'
  ];

  const chartData = {
    labels: Object.keys(groupedIntents),
    datasets: [
      {
        data: Object.values(groupedIntents),
        backgroundColor: chartColors.slice(0, Object.keys(groupedIntents).length),
      },
    ],
  };

  const LegendTable = () => {
    const items = Object.keys(groupedIntents);
    const halfLength = Math.ceil(items.length / 2);
    const firstRow = items.slice(0, halfLength);
    const secondRow = items.slice(halfLength);

    return (
      <div className="w-full mb-6">
        <table className="w-full text-sm">
          <tbody>
            {[firstRow, secondRow].map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((item, index) => (
                  <td key={index} className="p-1">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 mr-2 rounded-full"
                        style={{ backgroundColor: chartColors[rowIndex * halfLength + index] }}
                      ></div>
                      <span>{item}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white flex flex-col">
      <Navbar fluid={true} rounded={true} className="shadow-md">
        <Navbar.Brand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Customer Intent Dashboard v1.0
          </span>
        </Navbar.Brand>
      </Navbar>

      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Total Intents: {totalIntents}</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${view === 'chart' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setView('chart')}
            disabled={view === 'chart'}
          >
            Chart View
          </button>
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${view === 'list' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setView('list')}
            disabled={view === 'list'}
          >
            List View
          </button>
          <select
            className="bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded"
            value={classificationMethod}
            onChange={(e) => setClassificationMethod(e.target.value as 'keyword' | 'comprehend' | 'local-model')}
          >
            <option value="keyword">Keyword-based</option>
            <option value="comprehend">Amazon Comprehend</option>
            <option value="local-model">Local Model</option>
          </select>
        </div>

        <Card className="p-4 bg-white dark:bg-gray-800 flex-grow flex flex-col">
          {view === 'chart' && (
            <>
              <LegendTable />
              <div className="w-full flex-grow flex items-center justify-center">
                <div className="w-full" style={{ height: '800px', maxHeight: '80vh' }}>
                  <Pie 
                    data={chartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </>
          )}

          {view === 'list' && (
            <ol className="list-decimal pl-8 space-y-2 overflow-auto">
              {intents.map((intent, index) => (
                <li key={index} className="ml-2">
                  <span className="font-bold">{intent.intent.S}</span> - {intent.classification}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
};

export default App;