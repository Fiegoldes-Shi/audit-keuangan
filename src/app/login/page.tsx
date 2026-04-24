'use client'

import Link from 'next/link'

export default function Login() {
  return (
    <div className="p-6 flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Masuk</h1>
          <p className="text-sm text-slate-500">Mulai kelola kantong digitalmu</p>
        </header>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="mahasiswa@kampus.ac.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-3.5 mt-2 shadow-sm transition-colors"
          >
            Masuk ke Dashboard
          </button>
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