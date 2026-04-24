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
  const [pesan, setPesan] = useState('')

  // Ambil data profil saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setNama(data.nama || '')
          setPendapatan(data.pendapatan_tetap?.toString() || '0')
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setPesan('')

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').update({
        nama: nama,
        pendapatan_tetap: parseFloat(pendapatan.replace(/[^0-9]/g, '') || '0')
      }).eq('id', user.id)

      if (!error) setPesan('Profil berhasil diperbarui!')
    }
    setIsSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) return <div className="p-6 text-center text-slate-500 mt-20">Memuat profil...</div>

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Atur informasi dan pendapatan tetap bulananmu</p>
      </header>

      {pesan && <div className="mb-6 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">{pesan}</div>}

      <form onSubmit={handleSimpan} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Panggilan</label>
          <input 
            type="text" 
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pendapatan Tetap Bulanan (Rp)</label>
          <input 
            type="text" 
            value={pendapatan}
            onChange={(e) => setPendapatan(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Contoh: 2500000"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-teal-500 font-semibold text-teal-700"
          />
        </div>

        <button type="submit" disabled={isSaving} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3 mt-2">
          {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </form>

      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-3 border border-red-100 transition-colors">
        Keluar Akun (Sign Out)
      </button>
    </div>
  )
}