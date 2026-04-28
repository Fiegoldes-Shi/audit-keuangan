'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'

// Tipe data disamakan dengan database
type Transaction = {
  id: string
  jumlah: number
  deskripsi: string
  kategori: string
  tanggal: string
}

export default function History() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Anda belum login.")

        // Mengambil semua transaksi dari terbaru ke terlama
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('tanggal', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error

        setTransactions(data || [])
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memuat riwayat transaksi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  // Tentukan warna bullet berdasarkan kategori
  const getCategoryColor = (kategori: string) => {
    switch(kategori) {
      case 'Kewajiban Tetap': return 'bg-teal-700'
      case 'Kebutuhan Hidup': return 'bg-teal-500'
      case 'Self-Reward': return 'bg-amber-500'
      case 'Tabungan Pribadi': return 'bg-blue-500'
      case 'Tabungan Bersama': return 'bg-violet-500'
      default: return 'bg-slate-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Memuat riwayat transaksimu...</p>
      </div>
    )
  }

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Riwayat Transaksi</h1>
        <p className="text-sm text-slate-500">Semua catatan pengeluaranmu ada di sini.</p>
      </header>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {transactions.length === 0 && !errorMsg ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
          <p>Belum ada transaksi yang dicatat.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((trx) => (
            <div key={trx.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-10 rounded-full mr-4 ${getCategoryColor(trx.kategori)}`}></div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{trx.deskripsi}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <span className="mr-2">{formatDate(trx.tanggal)}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                    <span>{trx.kategori}</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-medium text-slate-800">
                {formatRupiah(trx.jumlah)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
