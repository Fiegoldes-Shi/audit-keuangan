'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

const supabase = createClient()

export default function Profile() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [pendapatan, setPendapatan] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      setEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('nama, pendapatan_tetap')
        .eq('id', user.id)
        .single()

      if (data) {
        setNama(data.nama || '')
        setPendapatan(data.pendapatan_tetap != null ? String(data.pendapatan_tetap) : '')
      } else if (error?.code === 'PGRST116') {
        // Baris profil belum ada, biarkan form kosong
      }
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

      const { error } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, nama, pendapatan_tetap: nominalPendapatan },
          { onConflict: 'id' }
        )

      if (error) throw error

      setPesan({ error: '', sukses: 'Profil berhasil disimpan!' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil.'
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

  return (
    <div className="p-6 pb-28">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Atur informasi dan pendapatan tetap bulananmu</p>
      </header>

      {pesan.error && (
        <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{pesan.error}</div>
      )}
      {pesan.sukses && (
        <div className="mb-5 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100">{pesan.sukses}</div>
      )}

      <form onSubmit={handleSimpan} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-4">
        {email && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">{email}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pengguna</label>
          <input
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Masukkan namamu"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pendapatan Tetap Bulanan (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={pendapatan}
            onChange={e => setPendapatan(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Contoh: 2500000"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-semibold text-teal-700 transition-all text-sm"
            required
          />
          {pendapatan && (
            <p className="text-xs text-slate-400 mt-1 pl-1">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(pendapatan))}
            </p>
          )}
        </div>

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
          ) : 'Simpan Profil'}
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl px-4 py-3.5 border border-red-100 transition-colors text-sm"
      >
        Keluar Akun
      </button>
    </div>
  )
}
