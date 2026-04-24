import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Audit Keuangan Mahasiswa',
  description: 'Pelacak keuangan minimalis dengan metode Kantong Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm relative pb-20">
          {children}
          <Navbar />
        </main>
      </body>
    </html>
  )
}