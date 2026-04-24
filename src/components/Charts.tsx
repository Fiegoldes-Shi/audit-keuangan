'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Kewajiban Tetap', value: 400000 },
  { name: 'Kebutuhan Hidup', value: 600000 },
  { name: 'Self-Reward', value: 150000 },
  { name: 'Tabungan Pribadi', value: 100000 },
  { name: 'Tabungan Bersama', value: 50000 },
];

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6'];

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
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}