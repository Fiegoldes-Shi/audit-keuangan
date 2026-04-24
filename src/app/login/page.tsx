'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  
  // State untuk menentukan apakah sedang di mode Login atau Daftar
  const [isLoginMode, setIsLoginMode] = useState(true) 
  
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPesan({ error: '', sukses: '' })

    if (isLoginMode) {
      // LOGIKA MASUK (LOGIN)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setPesan({ error: 'Email atau kata sandi salah.', sukses: '' })
        setIsLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      // LOGIKA DAFTAR (SIGNUP)
      const { data, error } = await supabase.auth.signUp({ email, password })
      
      if (error) {
        setPesan({ error: 'Gagal mendaftar. Pastikan email belum terpakai dan sandi min. 6 karakter.', sukses: '' })
      } else if (data.user) {
        // Simpan nama ke tabel profiles
        await supabase.from('profiles').upsert({ 
          id: data.user.id, 
          nama: nama || 'Mahasiswa',
          pendapatan_tetap: 0 
        })
        setPesan({ error: '', sukses: 'Pendaftaran berhasil! Cek email untuk verifikasi.' })
      }
      setIsLoading(false)
    }
  }

  const handleLupaSandi = async () => {
    if (!email) {
      setPesan({ error: 'Ketik emailmu di kolom atas dulu, lalu klik Lupa Kata Sandi.', sukses: '' })
      return
    }
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) setPesan({ error: 'Gagal mengirim tautan. Pastikan email terdaftar.', sukses: '' })
    else setPesan({ error: '', sukses: 'Tautan reset sandi telah dikirim ke email kamu.' })
    setIsLoading(false)
  }

  return (
    <div className="p-6 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {isLoginMode ? 'Akses Akun' : 'Buat Akun Baru'}
          </h1>
          <p className="text-sm text-slate-500">
            {isLoginMode ? 'Masuk untuk mengelola kantong digitalmu.' : 'Mulai perjalanan finansialmu.'}
          </p>
        </header>
        
        {pesan.error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{pesan.error}</div>}
        {pesan.sukses && <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">{pesan.sukses}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kolom Nama hanya muncul saat mode Daftar */}
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Panggilan</label>
              <input 
                type="text" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Budi"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
                required={!isLoginMode}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mahasiswa@kampus.ac.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Posisi Lupa Sandi di bawah kolom sandi */}
          {isLoginMode && (
            <div className="flex justify-end mt-1 mb-2">
              <button type="button" onClick={handleLupaSandi} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                Lupa Kata Sandi?
              </button>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 shadow-sm transition-colors">
              {isLoading ? 'Memproses...' : (isLoginMode ? 'Masuk' : 'Daftar Sekarang')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setPesan({error:'', sukses:''}) }} 
            className="text-teal-600 font-semibold hover:underline"
          >
            {isLoginMode ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </div>
      </div>
    </div>
  )
}