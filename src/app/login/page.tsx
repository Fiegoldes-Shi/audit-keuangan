'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pesanError, setPesanError] = useState('')
  const [pesanSukses, setPesanSukses] = useState('')

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setPesanError(''); setPesanSukses('');

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) setPesanError('Gagal mendaftar. Pastikan email valid dan sandi minimal 6 karakter.')
    else setPesanSukses('Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi.')
    setIsLoading(false)
  }

  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setPesanError(''); setPesanSukses('');

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setPesanError('Email atau kata sandi tidak cocok. Silakan coba lagi.')
      setIsLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // Fungsi Baru: Lupa Kata Sandi
  const handleLupaSandi = async () => {
    if (!email) {
      setPesanError('Silakan ketik email kamu di kolom atas terlebih dahulu, lalu klik "Lupa Kata Sandi?".')
      return
    }
    
    setIsLoading(true); setPesanError(''); setPesanSukses('');

    // Mengirim email reset dengan URL tujuan (redirect) ke halaman update-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) setPesanError('Gagal mengirim tautan reset. Pastikan email sudah terdaftar.')
    else setPesanSukses('Tautan untuk mereset kata sandi telah dikirim ke email kamu.')
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Akses Akun</h1>
          <p className="text-sm text-slate-500">Kelola kantong digitalmu sekarang</p>
        </header>
        
        {pesanError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{pesanError}</div>}
        {pesanSukses && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">{pesanSukses}</div>}

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mahasiswa@kampus.ac.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Kata Sandi</label>
              {/* Tombol Lupa Sandi yang elegan */}
              <button 
                type="button" 
                onClick={handleLupaSandi}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              onClick={handleMasuk}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
            
            <button 
              onClick={handleDaftar}
              disabled={isLoading}
              type="button"
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg px-4 py-3.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Daftar Akun Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}