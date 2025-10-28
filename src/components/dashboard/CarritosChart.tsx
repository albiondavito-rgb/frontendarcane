import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardCarritosStats } from '../../types/dashboard.types';
import styles from './Chart.module.css';

interface CarritosChartProps {
  data: DashboardCarritosStats;
}

const processData = (data: DashboardCarritosStats) => [
  { name: 'Pagados', value: data.pagados },
  { name: 'Abandonados', value: data.abandonados },
  { name: 'Activos', value: data.activos },
];

const COLORS = ['#00C49F', '#FF8042', '#FFBB28']; // Verde, Naranja, Amarillo

export const CarritosChart: React.FC<CarritosChartProps> = ({ data }) => {
  const chartData = processData(data);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Estado de Carritos de Compra</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0} // Relleno completo
            outerRadius={100} // Aumentamos el radio para que ocupe más espacio
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            labelLine={true} // Mostramos la línea que conecta la etiqueta con el gráfico
            label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`} // Etiqueta externa más clara
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Carritos']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

