'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

export default function AddTransaction() {
  const router = useRouter()
  const supabase = createClient()
  
  const [amount, setAmount] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [kategori, setKategori] = useState('Kewajiban Tetap')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Format angka ke format Rupiah saat mengetik
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value) {
      setAmount(new Intl.NumberFormat('id-ID').format(parseInt(value)))
    } else {
      setAmount('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Anda harus login untuk menambah transaksi.")

      const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''))
      if (!numericAmount || numericAmount <= 0) {
        throw new Error("Nominal transaksi harus lebih dari 0.")
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          jumlah: numericAmount,
          deskripsi,
          kategori,
          tanggal
        })

      if (error) throw error

      // Sukses
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan transaksi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 text-slate-500 hover:text-slate-800">
          ← Kembali
        </button>
        <h1 className="text-xl font-semibold text-slate-800">Catat Pengeluaran</h1>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
          <input 
            type="text" 
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full text-3xl font-bold text-teal-600 border-b-2 border-slate-200 focus:border-teal-500 outline-none py-2 bg-transparent transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
          <input 
            type="text" 
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Contoh: Beli Makan Siang"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select 
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none"
            disabled={isLoading}
          >
            <option value="Kewajiban Tetap">Kewajiban Tetap</option>
            <option value="Kebutuhan Hidup">Kebutuhan Hidup</option>
            <option value="Self-Reward">Self-Reward</option>
            <option value="Tabungan Pribadi">Tabungan Pribadi</option>
            <option value="Tabungan Bersama">Tabungan Bersama</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input 
            type="date" 
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            required
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 mt-8 shadow-sm transition-colors disabled:opacity-70 flex justify-center items-center"
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Menyimpan...
            </span>
          ) : (
            'Simpan Transaksi'
          )}
        </button>
      </form>
    </div>
  )
}