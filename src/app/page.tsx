import { Charts } from '@/components/Charts'
import Link from 'next/link'

export default function Dashboard() {
  // Dalam implementasi nyata, ambil data ini dari Supabase menggunakan server component
  const saldoTersisa = 1200000;
  const statusAudit = "Aman"; // Logic: jika saldo > 30% di minggu ke-3 = Aman

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-slate-800">Halo, Mahasiswa!</h1>
        <p className="text-sm text-slate-500">Ringkasan bulan ini</p>
      </header>

      {/* Card Saldo Utama */}
      <div className="bg-teal-600 text-white rounded-2xl p-6 mb-8 shadow-md">
        <p className="text-teal-100 text-sm mb-1">Total Saldo Tersisa</p>
        <h2 className="text-3xl font-bold mb-4">Rp 1.200.000</h2>
        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
          Status Audit: {statusAudit}
        </div>
      </div>

      {/* Seksi Grafik */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Distribusi Pengeluaran</h3>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <Charts />
        </div>
      </section>

      {/* Floating Action Button (FAB) untuk tambah transaksi */}
      <Link href="/add" className="fixed bottom-24 right-1/2 translate-x-32 bg-teal-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-teal-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  )
}