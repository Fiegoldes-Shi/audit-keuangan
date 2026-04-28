'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'

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

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const toDateStr = (d: Date) => d.toISOString().split('T')[0]

export default function Dashboard() {
  const now = new Date()
  const [namaUser, setNamaUser] = useState('')
  const [pendapatanTetap, setPendapatanTetap] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(now))
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama, pendapatan_tetap')
          .eq('id', user.id)
          .single()
        if (profile) {
          setNamaUser(profile.nama || 'Mahasiswa')
          setPendapatanTetap(profile.pendapatan_tetap || 0)
        }

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('tanggal', firstDay)
          .lte('tanggal', lastDay)
          .order('tanggal', { ascending: false })

        setTransactions(data || [])
      }
      setIsLoading(false)
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Memuat kantong digitalmu...</p>
      </div>
    )
  }

  // Kalkulasi bulan ini
  const totalPengeluaran = transactions.reduce((s, t) => s + Number(t.jumlah), 0)
  const saldoTersisa = pendapatanTetap - totalPengeluaran

  let statusText = 'Aman'
  let statusColor = 'text-teal-600 bg-teal-50 border-teal-100'
  if (saldoTersisa < 0) { statusText = 'Overbudget'; statusColor = 'text-red-600 bg-red-50 border-red-100' }
  else if (saldoTersisa < pendapatanTetap * 0.2) { statusText = 'Peringatan'; statusColor = 'text-amber-600 bg-amber-50 border-amber-100' }

  // Tanggal yang punya transaksi bulan ini
  const datesWithTrx = new Set(transactions.map(t => t.tanggal))

  // Transaksi di tanggal yang dipilih
  const trxAtSelected = transactions.filter(t => t.tanggal === selectedDate)
  const totalAtSelected = trxAtSelected.reduce((s, t) => s + Number(t.jumlah), 0)

  // --- Kalender ---
  const firstDayOfCal = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const calCells: (number | null)[] = [
    ...Array(firstDayOfCal).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div className="p-6 pb-28">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Halo, {namaUser}!</h1>
        <p className="text-sm text-slate-500">Pantau kantong digitalmu hari ini.</p>
      </header>

      {/* Kartu Saldo */}
      <div className="bg-teal-600 text-white p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />
        <div className="relative z-10">
          <p className="text-teal-50 text-sm font-medium mb-1">Saldo Tersisa Bulan Ini</p>
          <h2 className="text-3xl font-bold mb-4">{formatRupiah(saldoTersisa)}</h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-teal-100 text-xs mb-0.5">Total Pengeluaran</p>
              <p className="text-white font-medium">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold bg-white ${statusColor}`}>
              {statusText}
            </div>
          </div>
        </div>
      </div>

      {/* Kalender */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
        {/* Header kalender */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-700">{MONTHS[calMonth]} {calYear}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Label hari */}
        <div className="grid grid-cols-7 px-2 pt-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid tanggal */}
        <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
          {calCells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasTrx = datesWithTrx.has(dateStr)
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === toDateStr(now)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-sm font-medium transition-all
                  ${isSelected ? 'bg-teal-600 text-white shadow-sm' : isToday ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {day}
                {hasTrx && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-400'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Riwayat Transaksi di tanggal terpilih */}
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="text-sm font-semibold text-slate-700">
            {selectedDate === toDateStr(now) ? 'Hari Ini' : new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {trxAtSelected.length > 0 && (
            <span className="text-xs font-semibold text-teal-600">{formatRupiah(totalAtSelected)}</span>
          )}
        </div>

        {trxAtSelected.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
            Tidak ada pengeluaran di tanggal ini
          </div>
        ) : (
          <div className="space-y-2">
            {trxAtSelected.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.kategori] || '#94a3b8' }} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.deskripsi}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.kategori}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 shrink-0 ml-2">{formatRupiah(Number(t.jumlah))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
