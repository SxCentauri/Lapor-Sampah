import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Leaf, ArrowRight, Loader2, ArrowLeft, Mail, Lock, User } from 'lucide-react'

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
        // --- REGISTER ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        toast.success('Pendaftaran berhasil! Silakan login.')
        setIsRegister(false)
      } else {
        // --- LOGIN ---
        const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Cek Role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        
        if (profile?.role === 'admin') {
            toast.success('Selamat Datang, Admin!')
            navigate('/admin')
        } else {
            toast.success('Login berhasil!')
            navigate('/dashboard')
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 to-emerald-800 p-4 font-sans">
      
      {/* Kartu Utama dengan Animasi Masuk */}
      <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl overflow-hidden animate-enter transition-all duration-500">
        
        {/* Tombol Kembali (Di dalam Kartu) */}
        <div className="px-8 pt-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-600 transition-colors group">
                <div className="p-1 rounded-full bg-gray-100 group-hover:bg-green-100 transition">
                    <ArrowLeft size={16} /> 
                </div>
                Kembali
            </Link>
        </div>

        {/* Header */}
        <div className="px-8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 text-green-600 shadow-sm border border-green-50 transform hover:scale-110 transition duration-300">
            <Leaf size={32} className="drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            {isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {isRegister ? 'Mulai kontribusi untuk kota yang bersih.' : 'Masuk untuk melanjutkan laporan Anda.'}
          </p>
        </div>

        {/* Form Area */}
        <div className="px-8 pb-10">
          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Input Nama (Hanya saat Register) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Nama Lengkap</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition" size={20} />
                    <input
                      type="text"
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                      placeholder="Nama Anda"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Email</label>
              <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Password</label>
              <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-green-500 transition" size={20} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3.5 text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
            </div>

            {/* Tombol Aksi */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 hover:shadow-green-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {isRegister ? 'Daftar Sekarang' : 'Masuk Akun'} 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1.5 font-bold text-green-600 hover:underline hover:text-green-700 transition-colors outline-none focus:ring-2 focus:ring-green-200 rounded px-1"
              >
                {isRegister ? 'Login disini' : 'Daftar disini'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}