'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'
import { Charts, Transaction } from '@/components/Charts'

export default function Dashboard() {
  const supabase = createClient()
  const [namaUser, setNamaUser] = useState('')
  const [pendapatanTetap, setPendapatanTetap] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. Ambil data profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama, pendapatan_tetap')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setNamaUser(profile.nama || 'Mahasiswa')
          setPendapatanTetap(profile.pendapatan_tetap || 0)
        }

        // 2. Ambil transaksi bulan ini
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

        const { data: trxData, error: trxError } = await supabase
          .from('transactions')
          .select('id, kategori, jumlah, tanggal')
          .eq('user_id', user.id)
          .gte('tanggal', firstDayOfMonth)
          .lte('tanggal', lastDayOfMonth)
        
        if (!trxError && trxData) {
          setTransactions(trxData as Transaction[])
        }
      }
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Memuat kantong digitalmu...</p>
      </div>
    )
  }

  // Kalkulasi
  const totalPengeluaran = transactions.reduce((acc, curr) => acc + Number(curr.jumlah), 0)
  const saldoTersisa = pendapatanTetap - totalPengeluaran
  const batasAman = pendapatanTetap * 0.2 // 20%

  // Status Audit
  let statusText = 'Aman'
  let statusColor = 'text-teal-600 bg-teal-50 border-teal-100'
  
  if (saldoTersisa < 0) {
    statusText = 'Overbudget'
    statusColor = 'text-red-600 bg-red-50 border-red-100'
  } else if (saldoTersisa < batasAman) {
    statusText = 'Peringatan'
    statusColor = 'text-amber-600 bg-amber-50 border-amber-100'
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Halo, {namaUser}!</h1>
        <p className="text-sm text-slate-500">Pantau kantong digitalmu hari ini.</p>
      </header>

      {/* Ringkasan Saldo */}
      <div className="bg-teal-600 text-white p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="relative z-10">
          <p className="text-teal-50 text-sm font-medium mb-1">Saldo Tersisa</p>
          <h2 className="text-3xl font-bold mb-4">{formatRupiah(saldoTersisa)}</h2>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-teal-100 text-xs mb-0.5">Total Pengeluaran</p>
              <p className="text-white font-medium">{formatRupiah(totalPengeluaran)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusColor} bg-white`}>
              {statusText}
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Component */}
      <div className="mt-8">
        <Charts transactions={transactions} />
      </div>
    </div>
  )
}