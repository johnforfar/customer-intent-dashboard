// Repo: @johnforfar/aws-intent-dashboard File: /packages/frontend/src/App.tsx

// Repo: @johnforfar/aws-intent-dashboard File: /packages/frontend/src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

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

  // Fetch intents from the API
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

  // Group intents by classification
  const groupedIntents = intents.reduce((acc, intent) => {
    const classification = intent.classification;
    if (!acc[classification]) {
      acc[classification] = 0;
    }
    acc[classification]++;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for the chart
  const chartData = {
    labels: Object.keys(groupedIntents),
    datasets: [
      {
        data: Object.values(groupedIntents),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Intent Dashboard v1.0</h1>
      
      {/* Display total intents count */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">Total Intents: {totalIntents}</h2>
      </div>

      <div className="mb-4">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 ${view === 'chart' ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setView('chart')}
          disabled={view === 'chart'}
        >
          Chart View
        </button>
        <button
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 ${view === 'list' ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setView('list')}
          disabled={view === 'list'}
        >
          List View
        </button>
        <select
          className="bg-gray-200 py-2 px-4 rounded"
          value={classificationMethod}
          onChange={(e) => setClassificationMethod(e.target.value as 'keyword' | 'comprehend' | 'local-model')}
        >
          <option value="keyword">Keyword-based</option>
          <option value="comprehend">Amazon Comprehend</option>
          <option value="local-model">Local Model</option>
        </select>
      </div>

      {/* Render chart view by default */}
      {view === 'chart' && (
        <div className="w-full max-w-2xl">
          <Pie data={chartData} />
        </div>
      )}

      {/* Render list view with numbered items */}
      {view === 'list' && (
        <ol className="list-decimal pl-8">
          {intents.map((intent, index) => (
            <li key={index} className="mb-2 ml-2">
              <span className="font-bold">{intent.intent.S}</span> - {intent.classification}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default App;