import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Home, Camera, User, LogOut, Leaf, CheckCircle, Bell } from 'lucide-react'
import { supabase } from './supabaseClient'

// Import Halaman
import Login from './pages/Login'
import Lapor from './pages/Lapor'
import Profile from './pages/Profile'
import LandingPage from './pages/LandingPage'
import Admin from './pages/Admin'

// --- KOMPONEN NAVIGASI INTERNAL (Hanya untuk User Login) ---
const InternalNavigation = () => {
  const location = useLocation()
  
  // Sembunyikan Navigasi di Landing Page & Login
  const hideNavPaths = ['/', '/login'] 
  if (hideNavPaths.includes(location.pathname)) return null

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* 1. TOP NAVBAR (Desktop / Laptop) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 items-center justify-between px-6 lg:px-12 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2 text-green-600 font-bold text-xl">
          <Leaf className="fill-green-600" />
          <span>LaporKota <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md ml-2">Dashboard</span></span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/dashboard" className={`text-sm font-semibold transition hover:text-green-600 ${isActive('/dashboard') ? 'text-green-600' : 'text-gray-500'}`}>
            Beranda
          </Link>
          <Link to="/lapor" className={`text-sm font-semibold transition hover:text-green-600 ${isActive('/lapor') ? 'text-green-600' : 'text-gray-500'}`}>
            Lapor Sampah
          </Link>
          <Link to="/profile" className={`text-sm font-semibold transition hover:text-green-600 ${isActive('/profile') ? 'text-green-600' : 'text-gray-500'}`}>
            Profil Saya
          </Link>
          
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} 
            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition" 
            title="Keluar Aplikasi"
          >
             <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* 2. BOTTOM NAVBAR (Mobile / HP) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 pb-safe">
        <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-green-600' : 'text-gray-400'}`}>
          <Home size={24} />
          <span className="text-[10px]">Beranda</span>
        </Link>
        
        <Link to="/lapor">
          <div className="bg-green-600 p-3 rounded-full text-white -mt-8 shadow-lg shadow-green-200 border-4 border-gray-50">
            <Camera size={24} />
          </div>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-green-600' : 'text-gray-400'}`}>
          <User size={24} />
          <span className="text-[10px]">Profil</span>
        </Link>
      </div>
    </>
  )
}

// --- DASHBOARD UTAMA (Dengan Data Asli) ---
const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, myReports: 0 })
  const [userName, setUserName] = useState('Warga')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 1. Ambil User saat ini
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Ambil Nama User
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (profile) setUserName(profile.full_name)

        // 2. Hitung Total Laporan (Seluruh Kota)
        const { count: totalCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })

        // 3. Hitung Laporan Selesai (Seluruh Kota)
        const { count: resolvedCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Resolved')
        
        // 4. Hitung Laporan Saya
        const { count: myCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setStats({
          total: totalCount || 0,
          resolved: resolvedCount || 0,
          myReports: myCount || 0
        })
      }
    } catch (error) {
      console.error("Gagal ambil data dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 md:pt-24 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Halo, {userName.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500">Mari pantau kebersihan kota kita hari ini.</p>
          </div>
          <div className="hidden md:block">
             <span className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-gray-600 border border-gray-100 flex items-center gap-2">
               <Leaf size={14} className="text-green-500" /> Bengkulu, Indonesia
             </span>
          </div>
        </div>
  
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Banner Utama */}
          <div className="md:col-span-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Lapor Sampah Liar</h2>
              <p className="text-emerald-100 mb-6 max-w-md">
                Sudahkah Anda melapor hari ini? Kota yang bersih dimulai dari langkah kecilmu.
              </p>
              <Link to="/lapor" className="inline-block bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-sm">
                + Buat Laporan Baru
              </Link>
            </div>
            {/* Hiasan Background */}
            <Leaf className="absolute -right-10 -bottom-10 text-white opacity-20 w-64 h-64 rotate-12" />
          </div>
  
          {/* Statistik Live Cards */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
             {/* Card Total Laporan */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <Camera size={20} />
                </div>
                {loading ? (
                   <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
                ) : (
                   <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
                )}
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Laporan Masuk</p>
             </div>

             {/* Card Laporan Selesai */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle size={20} />
                </div>
                {loading ? (
                   <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
                ) : (
                   <h3 className="text-3xl font-bold text-gray-800">{stats.resolved}</h3>
                )}
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Sampah Bersih</p>
             </div>
          </div>
        </div>
  
        {/* Section Info User */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Status Anda</h3>
            <Link to="/profile" className="text-sm font-bold text-green-600 hover:underline">Lihat Detail</Link>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
               {userName.charAt(0)}
             </div>
             <div>
               <p className="font-bold text-gray-800">Kontribusi Saya</p>
               <p className="text-sm text-gray-500">Anda telah mengirim <span className="font-bold text-green-600">{stats.myReports} laporan</span> sejauh ini.</p>
             </div>
          </div>
        </div>
  
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
            {/* Navigasi Internal (Muncul di Dashboard, Lapor, Profile) */}
            <InternalNavigation />
            
            <Routes>
                {/* Rute Publik */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rute Aplikasi (Perlu Login) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lapor" element={<Lapor />} />
                <Route path="/profile" element={<Profile />} />

                {/* Rute Admin */}
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </div>
      </Router>
    </>
  )
}

export default App