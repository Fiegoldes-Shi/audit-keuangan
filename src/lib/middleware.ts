import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Setup respons bawaan dari Next.js
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Inisialisasi Supabase khusus untuk lingkungan Server/Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Cek apakah ada user yang sedang login saat ini
  const { data: { user } } = await supabase.auth.getUser()

  // Aturan 1: Jika BELUM LOGIN dan mencoba mengakses halaman SELAIN /login
  // Maka: Tendang (Redirect) ke halaman /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Aturan 2: Jika SUDAH LOGIN tapi mencoba mengakses halaman /login (misal klik tombol Back)
  // Maka: Tendang (Redirect) kembali ke Beranda (/)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Jika semua aman, persilakan masuk
  return supabaseResponse
}

// Konfigurasi: Tentukan file/path mana saja yang TIDAK perlu dijaga oleh satpam
// (Kita kecualikan file gambar, CSS, dan file sistem Next.js agar loading tetap cepat)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}