'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  // Sembunyikan navbar di halaman login atau halaman lain jika perlu
  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 py-3 px-6 flex justify-between items-center z-50">
      <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-teal-600' : 'text-slate-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[10px] font-medium">Beranda</span>
      </Link>

      {/* Spacer untuk memberi ruang pada Floating Action Button di Dashboard */}
      <div className="w-10"></div>

      <Link href="/history" className={`flex flex-col items-center ${pathname === '/history' ? 'text-teal-600' : 'text-slate-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="text-[10px] font-medium">Riwayat</span>
      </Link>
    </nav>
  )
}