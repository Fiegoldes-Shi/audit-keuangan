'use client'

import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Kewajiban Tetap', value: 400000, fill: '#0f766e' },
  { name: 'Kebutuhan Hidup', value: 600000, fill: '#14b8a6' },
  { name: 'Self-Reward', value: 150000, fill: '#f59e0b' },
  { name: 'Tabungan Pribadi', value: 100000, fill: '#3b82f6' },
  { name: 'Tabungan Bersama', value: 50000, fill: '#8b5cf6' },
];

export function Charts() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          />
          <Tooltip 
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}