'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  // Sembunyikan navbar di halaman auth
  if (pathname === '/login' || pathname === '/update-password') return null

  const navItem = (path: string, label: string, iconD: string) => (
    <Link href={path} className={`flex flex-col items-center w-1/4 ${pathname === path ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500 transition-colors'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconD} />
      </svg>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 py-3 px-2 flex justify-between items-center z-50">
      {/* Beranda */}
      {navItem('/', 'Beranda', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6')}
      
      {/* Riwayat */}
      {navItem('/history', 'Riwayat', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2')}
      
      {/* Tombol Tambah Transaksi (Floating di tengah) */}
      <Link href="/add" className="flex flex-col items-center w-1/4 group relative -top-6">
        <div className={`p-3 rounded-full shadow-lg transition-all border-4 border-slate-50 ${pathname === '/add' ? 'bg-teal-700 text-white' : 'bg-teal-600 text-white group-hover:bg-teal-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </Link>

      {/* Profil */}
      {navItem('/profile', 'Profil', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')}
    </nav>
  )
}