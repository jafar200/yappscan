
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface SalesChartProps {
  data: ChartData[];
  type: 'bar' | 'line';
  dataKey: string;
  title: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, type, dataKey, title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-96 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: '#4b5563',
                    color: '#ffffff',
                    borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey={dataKey} fill="#4f46e5" name="المبيعات (ريال)" />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    borderColor: '#4b5563',
                    color: '#ffffff',
                    borderRadius: '0.5rem'
                }}
               />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke="#4f46e5" strokeWidth={2} name="المبيعات (ريال)" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
