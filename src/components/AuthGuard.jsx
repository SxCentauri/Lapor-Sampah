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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      const userRole = profile?.role || 'user'

      if (requireAdmin && userRole !== 'admin') {
        navigate('/dashboard')
        return
      }

      if (preventAdmin && userRole === 'admin') {
        window.location.href = '/admin'
        return
      }

      setIsAuthorized(true)
      setLoading(false)

    } catch (error) {
      navigate('/login')
      setLoading(false)
    }
  }

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