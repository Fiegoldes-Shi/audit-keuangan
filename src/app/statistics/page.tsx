'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  LineChart, Line
} from 'recharts'

const supabase = createClient()

type Transaction = {
  id: string
  jumlah: number
  deskripsi: string
  kategori: string
  tanggal: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'Kewajiban Tetap': '#0f766e',
  'Kebutuhan Hidup': '#14b8a6',
  'Self-Reward': '#f59e0b',
  'Tabungan Pribadi': '#3b82f6',
  'Tabungan Bersama': '#8b5cf6',
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

const formatRupiahShort = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`
  return `${val}`
}

export default function Statistics() {
  const printRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendapatanTetap, setPendapatanTetap] = useState(0)
  const [nama, setNama] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nama, pendapatan_tetap')
        .eq('id', user.id)
        .single()
      if (profile) {
        setNama(profile.nama || '')
        setPendapatanTetap(profile.pendapatan_tetap || 0)
      }

      const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('tanggal', firstDay)
        .lte('tanggal', lastDay)
        .order('tanggal', { ascending: true })

      setTransactions(data || [])
      setIsLoading(false)
    }
    fetch()
  }, [selectedMonth, selectedYear])

  const handlePrint = () => window.print()

  // --- Kalkulasi ---
  const totalPengeluaran = transactions.reduce((s, t) => s + Number(t.jumlah), 0)
  const saldoTersisa = pendapatanTetap - totalPengeluaran
  const persenTerpakai = pendapatanTetap > 0 ? Math.min((totalPengeluaran / pendapatanTetap) * 100, 100) : 0

  const statusText = saldoTersisa < 0 ? 'Overbudget' : saldoTersisa < pendapatanTetap * 0.2 ? 'Peringatan' : 'Aman'
  const statusColor = saldoTersisa < 0 ? 'text-red-600 bg-red-50 border-red-200' : saldoTersisa < pendapatanTetap * 0.2 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-teal-600 bg-teal-50 border-teal-200'

  // Pie data
  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] || 0) + Number(t.jumlah)
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value)

  // Bar data per minggu
  const getWeekOfMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
    return Math.min(Math.ceil((d.getDate() + firstDay) / 7), 5)
  }
  const weeklyTotals: Record<string, number> = { 'Minggu 1': 0, 'Minggu 2': 0, 'Minggu 3': 0, 'Minggu 4': 0 }
  transactions.forEach(t => {
    const wk = getWeekOfMonth(t.tanggal)
    const key = `Minggu ${wk > 4 ? 4 : wk}`
    weeklyTotals[key] += Number(t.jumlah)
  })
  const barData = Object.entries(weeklyTotals).map(([name, value]) => ({ name, value }))

  // Line data per hari (akumulasi)
  const dailyMap: Record<string, number> = {}
  transactions.forEach(t => {
    const day = t.tanggal
    dailyMap[day] = (dailyMap[day] || 0) + Number(t.jumlah)
  })
  let cumulative = 0
  const lineData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => {
      cumulative += value
      return { date: date.split('-')[2], value: cumulative }
    })

  const years = [now.getFullYear() - 1, now.getFullYear()]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Memuat statistik...</p>
      </div>
    )
  }

  return (
    <>
      {/* Tombol Cetak — tidak ikut tercetak */}
      <div className="no-print px-6 pt-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Statistik</h1>
          <p className="text-xs text-slate-500">Laporan keuangan lengkap</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak PDF
        </button>
      </div>

      {/* Filter bulan — tidak ikut tercetak */}
      <div className="no-print px-6 mt-4 flex gap-2">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500"
        >
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ============ KONTEN YANG DICETAK ============ */}
      <div ref={printRef} className="p-6 pb-28 print-area">

        {/* Header khusus print */}
        <div className="hidden print:block mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan Pribadi</h1>
          <p className="text-sm text-slate-500 mt-1">{nama} &mdash; {MONTHS[selectedMonth]} {selectedYear}</p>
          <p className="text-xs text-slate-400 mt-0.5">Dicetak pada {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Ringkasan Keuangan */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Ringkasan — {MONTHS[selectedMonth]} {selectedYear}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Pendapatan</p>
              <p className="font-bold text-slate-800 text-base">{formatRupiah(pendapatanTetap)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Total Pengeluaran</p>
              <p className="font-bold text-red-500 text-base">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-1">Saldo Tersisa</p>
              <p className={`font-bold text-base ${saldoTersisa < 0 ? 'text-red-500' : 'text-teal-600'}`}>{formatRupiah(saldoTersisa)}</p>
            </div>
            <div className={`rounded-2xl border shadow-sm p-4 ${statusColor}`}>
              <p className="text-xs opacity-70 mb-1">Status Audit</p>
              <p className="font-bold text-base">{statusText}</p>
            </div>
          </div>

          {/* Progress bar */}
          {pendapatanTetap > 0 && (
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Terpakai: {persenTerpakai.toFixed(1)}%</span>
                <span>Sisa: {(100 - persenTerpakai).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${persenTerpakai >= 100 ? 'bg-red-500' : persenTerpakai >= 80 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ width: `${persenTerpakai}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pie Chart — Alokasi Kategori */}
        {pieData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Alokasi per Kategori</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                      {pieData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => formatRupiah(Number(v))} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span>{item.name}</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(item.value)}</span>
                    <span className="text-slate-400">({((item.value / totalPengeluaran) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart — Tren Mingguan */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Tren Pengeluaran Mingguan</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 0, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatRupiahShort} />
                  <Tooltip formatter={(v: unknown) => formatRupiah(Number(v))} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart — Akumulasi Harian */}
        {lineData.length > 1 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Akumulasi Pengeluaran Harian</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={8} label={{ value: 'Tgl', position: 'insideRight', offset: 0, fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatRupiahShort} />
                    <Tooltip formatter={(v: unknown) => formatRupiah(Number(v))} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Detail Transaksi */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Detail Semua Transaksi</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
              Tidak ada transaksi di periode ini.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Deskripsi</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden print:table-cell">Kategori</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-800">
                        <span>{t.deskripsi}</span>
                        <span className="block text-[10px] text-slate-400 print:hidden">{t.kategori}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden print:table-cell">{t.kategori}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800 text-right whitespace-nowrap">{formatRupiah(Number(t.jumlah))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-50 border-t-2 border-teal-100">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold text-teal-700">Total</td>
                    <td className="px-4 py-3 text-xs font-bold text-teal-700 hidden print:table-cell"></td>
                    <td className="px-4 py-3 text-xs font-bold text-teal-700 text-right">{formatRupiah(totalPengeluaran)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CSS khusus print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 24px !important; }
          .no-print { display: none !important; }
          nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
