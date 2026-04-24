'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseBrowser'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pesanError, setPesanError] = useState('')
  const [pesanSukses, setPesanSukses] = useState('')

  // Fungsi untuk Mendaftar (Sign Up)
  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPesanError('')
    setPesanSukses('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setPesanError('Gagal mendaftar. Pastikan format email benar dan sandi minimal 6 karakter.')
    } else {
      setPesanSukses('Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi, lalu coba masuk.')
    }
    setIsLoading(false)
  }

  // Fungsi untuk Masuk (Sign In)
  const handleMasuk = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPesanError('')
    setPesanSukses('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setPesanError('Email atau kata sandi tidak cocok. Silakan coba lagi.')
      setIsLoading(false)
    } else {
      // Jika sukses, langsung arahkan ke Dashboard
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="p-6 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Akses Akun</h1>
          <p className="text-sm text-slate-500">Kelola kantong digitalmu sekarang</p>
        </header>
        
        {/* Notifikasi Pesan */}
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
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
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

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}