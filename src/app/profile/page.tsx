'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

export default function Profile() {
  const router = useRouter()
  const supabase = createClient()
  
  const [nama, setNama] = useState('')
  const [pendapatan, setPendapatan] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  // Ambil data dari database saat halaman dibuka
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setNama(data.nama || '')
          setPendapatan(data.pendapatan_tetap?.toString() || '0')
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  // Fungsi untuk menyimpan perubahan ke database
  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setPesan({ error: '', sukses: '' })

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Gunakan upsert untuk memastikan data tersimpan baik jika sudah ada maupun belum
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nama: nama,
        pendapatan_tetap: parseFloat(pendapatan.replace(/[^0-9]/g, '') || '0')
      })

      if (error) {
        setPesan({ error: 'Gagal menyimpan profil. Periksa koneksi Anda.', sukses: '' })
      } else {
        setPesan({ error: '', sukses: 'Profil berhasil diperbarui!' })
      }
    }
    setIsSaving(false)
  }

  // Fungsi Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) return <div className="p-6 text-center text-slate-500 mt-20">Memuat data profil...</div>

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Atur informasi dan pendapatan tetap bulananmu</p>
      </header>

      {pesan.error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{pesan.error}</div>}
      {pesan.sukses && <div className="mb-6 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">{pesan.sukses}</div>}

      <form onSubmit={handleSimpan} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pengguna</label>
          <input 
            type="text" 
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan namamu"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pendapatan Tetap Bulanan (Rp)</label>
          <input 
            type="text" 
            value={pendapatan}
            onChange={(e) => setPendapatan(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Contoh: 2500000"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500 font-semibold text-teal-700 transition-all"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving} 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 mt-4 shadow-sm transition-colors disabled:opacity-70"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>

      <button 
        onClick={handleLogout} 
        className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-3.5 border border-red-100 transition-colors"
      >
        Keluar Akun (Logout)
      </button>
    </div>
  )
}