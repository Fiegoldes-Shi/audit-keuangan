'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

export default function UpdatePassword() {
  const router = useRouter()
  const supabase = createClient()
  
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPesan({ error: '', sukses: '' })

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setPesan({ error: 'Gagal mengubah kata sandi. Tautan mungkin kadaluarsa.', sukses: '' })
    } else {
      setPesan({ error: '', sukses: 'Kata sandi berhasil diubah! Mengarahkan ke Beranda...' })
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    setIsLoading(false)
  }

  return (
    <div className="p-6 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Kata Sandi Baru</h1>
          <p className="text-sm text-slate-500">Silakan masukkan kata sandi baru kamu.</p>
        </header>

        {pesan.error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{pesan.error}</div>}
        {pesan.sukses && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">{pesan.sukses}</div>}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sandi Baru</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 shadow-sm transition-colors"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}