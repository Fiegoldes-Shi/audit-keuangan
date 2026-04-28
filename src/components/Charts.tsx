'use client'

import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'

// Tipe Data Transaksi
export type Transaction = {
  id: string
  kategori: string
  jumlah: number
  tanggal: string
}

// Warna kategori
const CATEGORY_COLORS: Record<string, string> = {
  'Kewajiban Tetap': '#0f766e',
  'Kebutuhan Hidup': '#14b8a6',
  'Self-Reward': '#f59e0b',
  'Tabungan Pribadi': '#3b82f6',
  'Tabungan Bersama': '#8b5cf6',
}

interface ChartsProps {
  transactions: Transaction[]
}

export function Charts({ transactions }: ChartsProps) {
  // 1. Data untuk Pie Chart (Berdasarkan Kategori)
  const categoryTotals = transactions.reduce((acc, curr) => {
    acc[curr.kategori] = (acc[curr.kategori] || 0) + Number(curr.jumlah)
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.keys(categoryTotals).map((key) => ({
    name: key,
    value: categoryTotals[key],
    fill: CATEGORY_COLORS[key] || '#94a3b8' // Default slate-400
  })).sort((a, b) => b.value - a.value) // Urutkan dari terbesar

  // 2. Data untuk Bar Chart (Pengeluaran per Minggu bulan ini)
  const getWeekOfMonth = (dateString: string) => {
    const date = new Date(dateString)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return Math.ceil((date.getDate() + firstDay) / 7)
  }

  // Hitung total per minggu (Minggu 1-5)
  const weeklyTotals: Record<string, number> = {
    'Minggu 1': 0,
    'Minggu 2': 0,
    'Minggu 3': 0,
    'Minggu 4': 0,
    'Minggu 5': 0,
  }

  transactions.forEach(t => {
    const week = getWeekOfMonth(t.tanggal)
    const weekKey = `Minggu ${week > 5 ? 5 : week}`
    weeklyTotals[weekKey] += Number(t.jumlah)
  })

  // Hapus "Minggu 5" jika kosong agar rapi
  if (weeklyTotals['Minggu 5'] === 0) {
    delete weeklyTotals['Minggu 5']
  }

  const barData = Object.keys(weeklyTotals).map(key => ({
    name: key,
    value: weeklyTotals[key]
  }))

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm">Belum ada transaksi bulan ini</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pie Chart */}
      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-4 px-1">Alokasi Kategori</h3>
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: unknown) => formatRupiah(Number(value))}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Keterangan Warna (Legend Manual agar lebih clean) */}
        <div className="flex flex-wrap gap-3 mt-4 px-1">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center text-[10px] text-slate-600">
              <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: item.fill }}></span>
              {item.name}
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-medium text-slate-600 mb-4 px-1">Tren Mingguan</h3>
        <div className="h-64 w-full bg-white p-4 pt-6 rounded-xl border border-slate-100 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `Rp${(val/1000)}k`}
              />
              <Tooltip 
                formatter={(value: unknown) => formatRupiah(Number(value))}
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}