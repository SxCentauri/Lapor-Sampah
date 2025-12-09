import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Leaf, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        toast.success('Pendaftaran berhasil! Silakan login.')
        setIsRegister(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Login berhasil!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-emerald-700 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 hover:shadow-green-900/20">
        
        {/* Header Hero */}
        <div className="bg-green-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
            <Leaf size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegister ? 'Gabung Sekarang' : 'Selamat Datang'}
          </h2>
          <p className="text-sm text-gray-500">
            {isRegister ? 'Bantu kota kita menjadi lebih bersih.' : 'Masuk untuk mulai melapor.'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8 pt-0">
          <form onSubmit={handleAuth} className="space-y-5">
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 hover:shadow-green-300 disabled:opacity-70 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isRegister ? 'Daftar' : 'Masuk'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1 font-bold text-green-600 hover:underline hover:text-green-700 transition-colors"
              >
                {isRegister ? 'Login' : 'Daftar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}