import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children, requireAdmin = false, preventAdmin = false }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 1. Cek Sesi Login
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        navigate('/login') // Belum login? Tendang ke Login
        return
      }

      // 2. Ambil Role User
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      const userRole = profile?.role || 'user'

      // --- LOGIKA KEAMANAN KETAT ---

      // SKENARIO A: Halaman Khusus Admin (misal: /admin)
      // Jika User Biasa coba masuk -> Tendang ke Dashboard Warga
      if (requireAdmin && userRole !== 'admin') {
        navigate('/dashboard')
        return
      }

      // SKENARIO B: Halaman Khusus Warga (misal: /dashboard, /lapor)
      // Jika Admin coba masuk -> Tendang ke Dashboard Admin
      if (preventAdmin && userRole === 'admin') {
        navigate('/admin')
        return
      }

      // Jika lolos semua pengecekan
      setIsAuthorized(true)

    } catch (error) {
      console.error("Auth Error:", error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  // Tampilan Loading
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
          <p className="text-sm text-gray-500 font-semibold animate-pulse">Memverifikasi hak akses...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}