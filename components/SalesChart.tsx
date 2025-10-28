import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface SalesChartProps {
  data: ChartData[];
  title: string;
  barColor?: string;
}

const SalesChart = ({ data, title, barColor = 'var(--accent-cyan)' }: SalesChartProps) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-area">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-group" title={`${item.label}: ${item.value}`}>
            <div className="chart-bar-value">{item.value}</div>
            <div className="chart-bar">
              <div 
                className="chart-bar-inner"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: barColor,
                }}
              ></div>
            </div>
            <div className="chart-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;