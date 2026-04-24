'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/update-password') return null

  const navItem = (path: string, label: string, iconD: string) => (
    <Link href={path} className={`flex flex-col items-center ${pathname === path ? 'text-teal-600' : 'text-slate-400'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconD} />
      </svg>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 py-3 px-6 flex justify-between items-center z-50">
      {navItem('/', 'Beranda', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6')}
      <div className="w-10"></div> {/* Spacer untuk tombol + */}
      {navItem('/profile', 'Profil', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z')}
    </nav>
  )
}