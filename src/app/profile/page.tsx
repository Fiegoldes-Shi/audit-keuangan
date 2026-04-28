'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseBrowser'

const supabase = createClient()

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      }
    </svg>
  )
}

export default function Profile() {
  const router = useRouter()

  const [nama, setNama] = useState('')
  const [pendapatan, setPendapatan] = useState('')
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pesan, setPesan] = useState({ error: '', sukses: '' })

  // State ubah password
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [passwordKonfirmasi, setPasswordKonfirmasi] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [pesanPassword, setPesanPassword] = useState({ error: '', sukses: '' })
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      setEmail(user.email || '')
      setProvider(user.app_metadata?.provider || 'email')

      const { data } = await supabase
        .from('profiles')
        .select('nama, pendapatan_tetap')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setNama(data.nama || '')
        setPendapatan(data.pendapatan_tetap != null ? String(data.pendapatan_tetap) : '')
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSimpan = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setPesan({ error: '', sukses: '' })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi berakhir, silakan login ulang.')

      const nominalPendapatan = Number(pendapatan.replace(/[^0-9]/g, '') || '0')

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const { error } = existing
        ? await supabase.from('profiles').update({ nama, pendapatan_tetap: nominalPendapatan }).eq('id', user.id)
        : await supabase.from('profiles').insert({ id: user.id, nama, pendapatan_tetap: nominalPendapatan })

      if (error) throw new Error(error.message || error.code || JSON.stringify(error))

      setPesan({ error: '', sukses: 'Profil berhasil disimpan!' })
    } catch (err: unknown) {
      setPesan({ error: err instanceof Error ? err.message : String(err), sukses: '' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUbahPassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPesanPassword({ error: '', sukses: '' })

    if (passwordBaru !== passwordKonfirmasi) {
      setPesanPassword({ error: 'Konfirmasi kata sandi tidak cocok.', sukses: '' })
      return
    }
    if (passwordBaru.length < 6) {
      setPesanPassword({ error: 'Kata sandi baru minimal 6 karakter.', sukses: '' })
      return
    }

    setIsSavingPassword(true)

    try {
      // Verifikasi password lama dengan re-sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordLama,
      })
      if (signInError) throw new Error('Kata sandi lama salah. Silakan periksa kembali.')

      // Update ke password baru
      const { error: updateError } = await supabase.auth.updateUser({ password: passwordBaru })
      if (updateError) throw new Error(updateError.message)

      setPesanPassword({ error: '', sukses: 'Kata sandi berhasil diubah!' })
      setPasswordLama('')
      setPasswordBaru('')
      setPasswordKonfirmasi('')
      // Tutup form setelah 2 detik
      setTimeout(() => {
        setShowPasswordForm(false)
        setPesanPassword({ error: '', sukses: '' })
      }, 2000)
    } catch (err: unknown) {
      setPesanPassword({ error: err instanceof Error ? err.message : String(err), sukses: '' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-500">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Memuat profil...</p>
      </div>
    )
  }

  const isEmailProvider = provider === 'email'

  return (
    <div className="p-6 pb-28">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Profil Saya</h1>
        <p className="text-sm text-slate-500">Kelola informasi akunmu di sini</p>
      </header>

      {pesan.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 break-all">{pesan.error}</div>
      )}
      {pesan.sukses && (
        <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl border border-teal-100">{pesan.sukses}</div>
      )}

      {/* ── INFO AKUN (READ-ONLY) ── */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Info Akun</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">

          {/* Email */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-xs text-slate-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">{email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] text-slate-400 font-medium">Tidak dapat diubah</span>
            </div>
          </div>

          {/* Password */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs text-slate-400 mb-0.5">Kata Sandi</p>
                <p className="text-sm font-medium text-slate-800 tracking-widest">••••••••</p>
              </div>
              {isEmailProvider ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(v => !v)
                    setPesanPassword({ error: '', sukses: '' })
                    setPasswordLama(''); setPasswordBaru(''); setPasswordKonfirmasi('')
                  }}
                  className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${showPasswordForm ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {showPasswordForm ? 'Batal' : 'Ubah Password'}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[10px] text-slate-400 font-medium">Dikelola {provider}</span>
                </div>
              )}
            </div>

            {/* Form ubah password — muncul inline */}
            {showPasswordForm && isEmailProvider && (
              <form onSubmit={handleUbahPassword} className="mt-4 space-y-3">
                {pesanPassword.error && (
                  <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{pesanPassword.error}</div>
                )}
                {pesanPassword.sukses && (
                  <div className="p-2.5 bg-teal-50 text-teal-700 text-xs rounded-lg border border-teal-100">{pesanPassword.sukses}</div>
                )}

                {/* Password Lama */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Kata Sandi Lama</label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={passwordLama}
                      onChange={e => setPasswordLama(e.target.value)}
                      placeholder="Masukkan kata sandi lama"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-sm transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon open={showOld} />
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={passwordBaru}
                      onChange={e => setPasswordBaru(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-sm transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon open={showNew} />
                    </button>
                  </div>
                  {/* Indikator kekuatan password */}
                  {passwordBaru && (
                    <div className="mt-1.5 flex gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordBaru.length >= 10 ? 'bg-teal-500' :
                          passwordBaru.length >= 8 && i <= 2 ? 'bg-amber-400' :
                          passwordBaru.length >= 6 && i <= 1 ? 'bg-red-400' : 'bg-slate-100'
                        }`} />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1">
                        {passwordBaru.length >= 10 ? 'Kuat' : passwordBaru.length >= 8 ? 'Sedang' : passwordBaru.length >= 6 ? 'Lemah' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwordKonfirmasi}
                      onChange={e => setPasswordKonfirmasi(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 text-sm transition-all ${
                        passwordKonfirmasi && passwordBaru !== passwordKonfirmasi
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                          : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                      }`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {passwordKonfirmasi && passwordBaru !== passwordKonfirmasi && (
                    <p className="text-[11px] text-red-500 mt-1 pl-1">Kata sandi tidak cocok</p>
                  )}
                  {passwordKonfirmasi && passwordBaru === passwordKonfirmasi && passwordBaru.length >= 6 && (
                    <p className="text-[11px] text-teal-600 mt-1 pl-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Kata sandi cocok
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword || (!!passwordKonfirmasi && passwordBaru !== passwordKonfirmasi)}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 shadow-sm transition-colors flex justify-center items-center gap-2 text-sm mt-1"
                >
                  {isSavingPassword ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : 'Simpan Kata Sandi Baru'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── DATA PRIBADI (EDITABLE) ── */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Data Pribadi</p>
        <form onSubmit={handleSimpan} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-slate-50">
            <label className="block text-xs text-slate-400 mb-1.5">
              Nama Pengguna
              <span className="ml-1.5 text-teal-500 font-medium">• Dapat diedit</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan namamu"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm font-medium text-slate-800"
              required
            />
          </div>

          <div className="px-4 pt-3 pb-4">
            <label className="block text-xs text-slate-400 mb-1.5">
              Pendapatan Tetap Bulanan
              <span className="ml-1.5 text-teal-500 font-medium">• Dapat diedit</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={pendapatan}
                onChange={e => setPendapatan(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-semibold text-teal-700 transition-all text-sm"
                required
              />
            </div>
            {pendapatan && Number(pendapatan) > 0 && (
              <p className="text-xs text-slate-400 mt-1.5 pl-1">≈ {formatRupiah(Number(pendapatan))} / bulan</p>
            )}
          </div>

          <div className="px-4 pb-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-3.5 shadow-sm transition-colors flex justify-center items-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── LOGOUT ── */}
      <button
        onClick={handleLogout}
        className="w-full bg-white hover:bg-red-50 text-red-500 font-medium rounded-2xl px-4 py-4 border border-slate-100 shadow-sm hover:border-red-100 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar Akun
      </button>
    </div>
  )
}
