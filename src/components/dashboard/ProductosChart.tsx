import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { DashboardProductosStats } from '../../types/dashboard.types';
import styles from './Chart.module.css';

interface ProductosChartProps {
  data: DashboardProductosStats;
}

// Paleta de colores para las barras
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const ProductosChart: React.FC<ProductosChartProps> = ({ data }) => {
  const chartData = [...data.productosPorCategoria].sort((a, b) => b.cantidad - a.cantidad);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Productos en Inventario por Categoría</h3>
      <ResponsiveContainer width="100%" height={400}> {/* Aumentamos la altura para dar más espacio */}
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 120, // Margen inferior amplio para las etiquetas rotadas
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="categoria" 
            angle={-60}       // Rotar etiquetas para mejor legibilidad
            textAnchor="end"   // Alinear al final de la etiqueta
            height={100}       // Aumentar el espacio para el eje X
            interval={0}       // Forzar a que se muestren todas las etiquetas
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => [value, 'Productos']} />
          <Legend />
          <Bar dataKey="cantidad" name="Nº de Productos">
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
