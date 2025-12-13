import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Home, Camera, User, LogOut, Leaf, Loader2 } from 'lucide-react'
import { supabase } from './supabaseClient'

// Import Halaman
import Login from './pages/Login'
import Lapor from './pages/Lapor'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import Admin from './pages/Admin'

// Import Guard (Satpam)
import AuthGuard from './components/AuthGuard'

// Wrapper Animasi
const PageWrapper = ({ children }) => {
  return <div className="animate-enter">{children}</div>
}

// --- NAVIGASI INTERNAL (Hanya tampil untuk Warga) ---
const InternalNavigation = () => {
  const location = useLocation()
  
  // Sembunyikan Navigasi di: Landing, Login, DAN Admin
  const hideNavPaths = ['/', '/login', '/admin'] 
  if (hideNavPaths.includes(location.pathname)) return null

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* DESKTOP NAV (Warga) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md shadow-sm z-50 items-center justify-between px-6 lg:px-12 border-b border-gray-100 transition-all">
        <Link to="/dashboard" className="flex items-center gap-2 text-green-600 font-bold text-xl group">
          <Leaf className="fill-green-600 group-hover:scale-110 transition" />
          <span>LaporKota <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2 border border-gray-200">Warga</span></span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/dashboard" className={`text-sm font-bold transition hover:text-green-600 ${isActive('/dashboard') ? 'text-green-600' : 'text-gray-400'}`}>Beranda</Link>
          <Link to="/lapor" className={`text-sm font-bold transition hover:text-green-600 ${isActive('/lapor') ? 'text-green-600' : 'text-gray-400'}`}>Lapor Sampah</Link>
          <Link to="/profile" className={`text-sm font-bold transition hover:text-green-600 ${isActive('/profile') ? 'text-green-600' : 'text-gray-400'}`}>Profil Saya</Link>
          
          <button onClick={handleLogout} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition border border-red-100" title="Keluar">
             <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* MOBILE NAV (Warga) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
        <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition ${isActive('/dashboard') ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
          <Home size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Beranda</span>
        </Link>
        
        <Link to="/lapor">
          <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-3.5 rounded-2xl text-white -mt-8 shadow-lg shadow-green-200 border-4 border-gray-50 transform hover:scale-110 transition active:scale-95">
            <Camera size={24} />
          </div>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center gap-1 transition ${isActive('/profile') ? 'text-green-600 scale-105' : 'text-gray-400'}`}>
          <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Profil</span>
        </Link>
      </div>
    </>
  )
}

// --- DASHBOARD WARGA (Logic tetap sama) ---
const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, myReports: 0 })
  const [userName, setUserName] = useState('Warga')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (profile) setUserName(profile.full_name)

        const { count: totalCount } = await supabase.from('reports').select('*', { count: 'exact', head: true })
        const { count: resolvedCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Resolved')
        const { count: myCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

        setStats({ total: totalCount || 0, resolved: resolvedCount || 0, myReports: myCount || 0 })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 md:pt-28 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">Halo, {userName.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 font-medium">Lapor satu sampah, selamatkan satu sudut kota.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-green-500 rounded-[32px] p-8 text-white shadow-xl shadow-green-200/50 relative overflow-hidden flex flex-col justify-center group">
            <div className="relative z-10">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/10">✨ Pahlawan Lingkungan</span>
              <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">Lapor Sampah Liar</h2>
              <p className="text-emerald-50 mb-8 max-w-md font-medium opacity-90">Setiap laporan Anda membantu petugas kebersihan bekerja lebih cepat dan tepat.</p>
              <Link to="/lapor" className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-50 transition shadow-sm hover:shadow-lg hover:-translate-y-1">
                <Camera size={18} /> Buat Laporan Baru
              </Link>
            </div>
            <Leaf className="absolute -right-10 -bottom-10 text-white opacity-10 w-64 h-64 rotate-12 group-hover:rotate-45 transition duration-700" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl"></div>
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
             <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:border-blue-200 transition group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition">
                  <Camera size={24} />
                </div>
                {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mb-1"></div> : <h3 className="text-3xl font-black text-gray-800">{stats.total}</h3>}
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Laporan Masuk</p>
             </div>

             <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:border-green-200 transition group">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition">
                  <Leaf size={24} />
                </div>
                {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mb-1"></div> : <h3 className="text-3xl font-black text-gray-800">{stats.resolved}</h3>}
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sampah Bersih</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- APP UTAMA ---
function App() {
  return (
    <>
      <Toaster position="top-right" richColors theme="light" />
      <Router>
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans selection:bg-green-100 selection:text-green-700">
            {/* Navigasi Internal (Hanya Muncul untuk Warga) */}
            <InternalNavigation />
            
            <Routes>
                {/* 1. PUBLIC ROUTES */}
                <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                
                {/* 2. USER ROUTES (HANYA WARGA) */}
                {/* preventAdmin={true} -> Admin DILARANG MASUK SINI */}
                <Route path="/dashboard" element={
                    <AuthGuard preventAdmin={true}>
                        <PageWrapper><Dashboard /></PageWrapper>
                    </AuthGuard>
                } />
                
                <Route path="/lapor" element={
                    <AuthGuard preventAdmin={true}>
                        <PageWrapper><Lapor /></PageWrapper>
                    </AuthGuard>
                } />
                
                <Route path="/profile" element={
                    <AuthGuard preventAdmin={true}>
                        <PageWrapper><Profile /></PageWrapper>
                    </AuthGuard>
                } />

                {/* 3. ADMIN ROUTES (HANYA ADMIN) */}
                {/* requireAdmin={true} -> Warga DILARANG MASUK SINI */}
                <Route path="/admin" element={
                    <AuthGuard requireAdmin={true}>
                        <PageWrapper><Admin /></PageWrapper>
                    </AuthGuard>
                } />
            </Routes>
        </div>
      </Router>
    </>
  )
}

export default App