'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseBrowser'

export default function Dashboard() {
  const supabase = createClient()
  const [namaUser, setNamaUser] = useState('Mahasiswa') // Default sementara
  const [saldo, setSaldo] = useState(0)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Ambil data profil berdasarkan ID user yang login
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama, pendapatan_tetap')
          .eq('id', user.id)
          .single()
        
        if (profile && profile.nama) {
          setNamaUser(profile.nama)
          setSaldo(profile.pendapatan_tetap || 0)
        }
      }
    }
    fetchUserData()
  }, [])

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Halo, {namaUser}!</h1>
        <p className="text-sm text-slate-500">Semangat memantau pengeluaranmu.</p>
      </header>
      {/* Sisa UI Dashboard tetap sama */}
    </div>
  )
}