'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

const supabase = createClient()

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

export default function Profile() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [pendapatan, setPendapatan] = useState('')
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      setEmail(user.email || '')
      setProvider(user.app_metadata?.provider || 'email')

      // Coba UPDATE dulu, kalau baris belum ada baru INSERT
      const { data } = await supabase
        .from('profiles')
        .select('nama, pendapatan_tetap')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setNama(data.nama || '')
        setPendapatan(data.pendapatan_tetap != null ? String(data.pendapatan_tetap) : '')
      }
      // Kalau null (baris belum ada), form tetap kosong — akan dibuat saat save
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSimpan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setPesan({ error: '', sukses: '' })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi berakhir, silakan login ulang.')

      const nominalPendapatan = Number(pendapatan.replace(/[^0-9]/g, '') || '0')

      // Cek apakah baris sudah ada
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      let error

      if (existing) {
        // UPDATE — tidak butuh INSERT permission
        const res = await supabase
          .from('profiles')
          .update({ nama, pendapatan_tetap: nominalPendapatan })
          .eq('id', user.id)
        error = res.error
      } else {
        // INSERT — baris pertama kali
        const res = await supabase
          .from('profiles')
          .insert({ id: user.id, nama, pendapatan_tetap: nominalPendapatan })
        error = res.error
      }

      if (error) {
        // Tampilkan pesan error Supabase yang sesungguhnya
        throw new Error(error.message || error.code || JSON.stringify(error))
      }

      setPesan({ error: '', sukses: 'Profil berhasil disimpan!' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setPesan({ error: msg, sukses: '' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Memuat profil...</p>
      </div>
    )
  }

  const providerLabel: Record<string, string> = {
    email: 'Email & Password',
    google: 'Google',
    github: 'GitHub',
  }

  return (
    <div className="p-6 pb-28">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Kelola informasi akunmu di sini</p>
      </header>

      {pesan.error && (
        <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 break-all">
          {pesan.error}
        </div>
      )}
      {pesan.sukses && (
        <div className="mb-5 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100">
          {pesan.sukses}
        </div>
      )}

      {/* === SEKSI: INFO AKUN (READ-ONLY) === */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Info Akun</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Email */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">{email}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-3 shrink-0 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] text-slate-400 font-medium">Tidak dapat diubah</span>
            </div>
          </div>

          {/* Metode Login */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-0.5">Metode Login</p>
              <p className="text-sm font-medium text-slate-800">{providerLabel[provider] || provider}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-3 shrink-0 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] text-slate-400 font-medium">Tidak dapat diubah</span>
            </div>
          </div>
        </div>
      </div>

      {/* === SEKSI: DATA YANG BISA DIEDIT === */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Data Pribadi</p>
        <form onSubmit={handleSimpan} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Nama */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-50">
            <label className="block text-xs text-slate-400 mb-1.5">
              Nama Pengguna
              <span className="ml-1.5 text-teal-500 font-medium">• Dapat diedit</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan namamu"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm font-medium text-slate-800"
              required
            />
          </div>

          {/* Pendapatan */}
          <div className="px-4 pt-3 pb-4">
            <label className="block text-xs text-slate-400 mb-1.5">
              Pendapatan Tetap Bulanan
              <span className="ml-1.5 text-teal-500 font-medium">• Dapat diedit</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={pendapatan}
                onChange={e => setPendapatan(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-semibold text-teal-700 transition-all text-sm"
                required
              />
            </div>
            {pendapatan && Number(pendapatan) > 0 && (
              <p className="text-xs text-slate-400 mt-1.5 pl-1">
                ≈ {formatRupiah(Number(pendapatan))} / bulan
              </p>
            )}
          </div>

          <div className="px-4 pb-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-3.5 shadow-sm transition-colors flex justify-center items-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* === LOGOUT === */}
      <button
        onClick={handleLogout}
        className="w-full bg-white hover:bg-red-50 text-red-500 font-medium rounded-2xl px-4 py-4 border border-slate-100 shadow-sm hover:border-red-100 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar Akun
      </button>
    </div>
  )
}
