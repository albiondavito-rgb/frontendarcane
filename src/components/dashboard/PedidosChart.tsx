import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { DashboardPedidosStats } from '../../types/dashboard.types';
import styles from './Chart.module.css';

interface PedidosChartProps {
  data: DashboardPedidosStats;
}

const processData = (data: DashboardPedidosStats) => [
  { name: 'Pendientes', value: data.pendientes, color: '#ffc658' },
  { name: 'Confirmados', value: data.confirmados, color: '#82ca9d' },
  { name: 'Enviados', value: data.enviados, color: '#8884d8' },
  { name: 'Entregados', value: data.entregados, color: '#00C49F' },
  { name: 'Rechazados', value: data.rechazados, color: '#ff8042' },
];

export const PedidosChart: React.FC<PedidosChartProps> = ({ data }) => {
  const chartData = processData(data);

  const renderCustomLegend = () => (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {chartData.map((entry, index) => (
        <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '5px' }} />
          {entry.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Resumen de Pedidos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend content={renderCustomLegend} />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
