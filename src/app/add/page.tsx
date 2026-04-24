'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddTransaction() {
  const router = useRouter()
  const [amount, setAmount] = useState('')

  // Format angka ke format Rupiah saat mengetik
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value) {
      setAmount(new Intl.NumberFormat('id-ID').format(parseInt(value)))
    } else {
      setAmount('')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 text-slate-500 hover:text-slate-800">
          ← Kembali
        </button>
        <h1 className="text-xl font-semibold text-slate-800">Catat Pengeluaran</h1>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
          <input 
            type="text" 
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full text-3xl font-bold text-teal-600 border-b-2 border-slate-200 focus:border-teal-500 outline-none py-2 bg-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
          <input 
            type="text" 
            placeholder="Contoh: Transfer ke Blu untuk Tabungan Bersama"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none">
            <option value="Kewajiban Tetap">Kewajiban Tetap</option>
            <option value="Kebutuhan Hidup">Kebutuhan Hidup (Makan/Bensin)</option>
            <option value="Self-Reward">Self-Reward</option>
            <option value="Tabungan Pribadi">Tabungan Pribadi</option>
            <option value="Tabungan Bersama">Tabungan Bersama</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input 
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 mt-8 shadow-sm transition-colors"
        >
          Simpan Transaksi
        </button>
      </form>
    </div>
  )
}