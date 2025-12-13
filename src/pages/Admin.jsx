import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Trash2, Loader2, LogOut, Shield, Filter, RefreshCw, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function Admin() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    setErrorMsg(null)
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`*, profiles ( full_name, username )`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setReports(data || [])

    } catch (err) {
      console.error("Gagal load relasi, mencoba mode simple...", err)
      const { data: simpleData, error: simpleError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (simpleError) {
          setErrorMsg("Gagal memuat database: " + simpleError.message)
      } else {
          setReports(simpleData || [])
          toast.warning("Mode Terbatas: Nama pelapor tidak muncul")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus, userId) => {
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', id)

    if (error) {
      toast.error('Gagal update')
    } else {
      toast.success(`Status diperbarui: ${newStatus}`)
      fetchReports()
      
      if (newStatus === 'Verified' && userId) {
         // Logika tambah poin manual sementara
         const { data: userPoints } = await supabase.from('profiles').select('points').eq('id', userId).single()
         if (userPoints) {
             await supabase.from('profiles').update({ points: (userPoints.points || 0) + 10 }).eq('id', userId)
         }
      }
    }
  }

  const deleteReport = async (id) => {
    if(!confirm("Hapus laporan ini secara permanen?")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) toast.error('Gagal hapus')
    else {
      toast.success('Laporan dihapus')
      fetchReports()
    }
  }

  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.status === filter)

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans md:pt-28 animate-enter">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section dengan Gradient Style */}
        <div className="relative rounded-[32px] overflow-hidden shadow-xl mb-10 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-green-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <Shield size={28} className="text-emerald-50" />
                        </div>
                        <span className="text-emerald-100 font-bold tracking-wider text-sm uppercase">Admin Panel</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">Dashboard Validasi</h1>
                    <p className="text-emerald-100 mt-2 font-medium opacity-90 max-w-lg">
                        Pantau kebersihan kota, validasi laporan warga, dan kelola poin rewards dalam satu tempat.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={fetchReports} 
                        className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition active:scale-95 font-bold text-sm group-hover:border-white/40"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-800 rounded-2xl hover:bg-emerald-50 transition active:scale-95 font-bold text-sm shadow-lg"
                    >
                        <LogOut size={18} /> Ke Dashboard
                    </button>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
                title="Total Laporan" 
                count={reports.length} 
                icon={<Filter size={24} />} 
                color="text-emerald-700" 
                bg="bg-white border-emerald-100" 
            />
            <StatCard 
                title="Perlu Validasi" 
                count={reports.filter(r => r.status === 'Pending').length} 
                icon={<Loader2 size={24} />} 
                color="text-amber-600" 
                bg="bg-white border-amber-100" 
            />
            <StatCard 
                title="Telah Selesai" 
                count={reports.filter(r => r.status === 'Resolved').length} 
                icon={<CheckCircle size={24} />} 
                color="text-blue-600" 
                bg="bg-white border-blue-100" 
            />
            <StatCard 
                title="Ditolak / Spam" 
                count={0} 
                icon={<XCircle size={24} />} 
                color="text-red-500" 
                bg="bg-white border-red-100" 
            />
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex gap-1">
                {['All', 'Pending', 'Verified', 'Resolved'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                            filter === status 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-emerald-600'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden min-h-[400px] relative">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                    <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                    <span className="text-gray-400 font-medium animate-pulse">Memuat data terbaru...</span>
                </div>
            ) : null}

            {filteredReports.length === 0 && !loading ? (
                <div className="p-24 text-center text-gray-400 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={40} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">Tidak ada laporan ditemukan.</p>
                    <p className="text-sm">Coba ubah filter atau tunggu laporan masuk.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                                <th className="p-6 font-bold">Bukti Foto</th>
                                <th className="p-6 font-bold">Detail Pelapor</th>
                                <th className="p-6 font-bold">Lokasi</th>
                                <th className="p-6 font-bold">Status</th>
                                <th className="p-6 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredReports.map((item) => (
                                <tr key={item.id} className="group hover:bg-emerald-50/30 transition-colors duration-200">
                                    <td className="p-5 align-top w-32">
                                        <div className="h-20 w-24 rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer relative group-hover:shadow-md transition">
                                            <a href={item.image_url} target="_blank" rel="noreferrer">
                                                <img 
                                                    src={item.image_url} 
                                                    alt="bukti" 
                                                    className="h-full w-full object-cover transform group-hover:scale-110 transition duration-500" 
                                                />
                                            </a>
                                        </div>
                                    </td>
                                    
                                    <td className="p-5 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-base">
                                                {item.profiles?.full_name || 'User Tanpa Nama'}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium mb-2">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            
                                            <div className="flex gap-2 mb-2">
                                                <span className="bg-white border border-gray-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                                                "{item.description || 'Tidak ada keterangan'}"
                                            </p>
                                        </div>
                                    </td>
                                    
                                    <td className="p-5 align-top">
                                        <a 
                                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`} 
                                            target="_blank" 
                                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition group-hover:translate-x-1"
                                            rel="noreferrer"
                                        >
                                            <MapPin size={14} /> Lihat Peta
                                        </a>
                                    </td>
                                    
                                    <td className="p-5 align-top">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    
                                    <td className="p-5 align-top">
                                        <div className="flex justify-center gap-2">
                                            {item.status === 'Pending' && (
                                                <button onClick={() => updateStatus(item.id, 'Verified', item.user_id)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition text-xs font-bold shadow-blue-200">
                                                    <CheckCircle size={14} /> Validasi
                                                </button>
                                            )}
                                            
                                            {item.status === 'Verified' && (
                                                <button onClick={() => updateStatus(item.id, 'Resolved', item.user_id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition text-xs font-bold shadow-emerald-200">
                                                    <CheckCircle size={14} /> Selesai
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => deleteReport(item.id)} 
                                                className="p-2 bg-white border border-red-100 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition shadow-sm hover:shadow-md" 
                                                title="Hapus Permanen"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

// --- KOMPONEN KECIL ---

const StatCard = ({ title, count, icon, color, bg }) => (
    <div className={`p-6 rounded-3xl ${bg} border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center gap-5 group`}>
        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className={`text-3xl font-black ${color}`}>{count}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{title}</p>
        </div>
    </div>
)

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: "bg-amber-50 text-amber-600 border-amber-200 ring-amber-100",
        Verified: "bg-blue-50 text-blue-600 border-blue-200 ring-blue-100",
        Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100"
    }
    
    // Icon mapping
    const icons = {
        Pending: <Loader2 size={12} className="animate-spin" />,
        Verified: <Shield size={12} />,
        Resolved: <CheckCircle size={12} />
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border ring-2 ring-opacity-50 ${styles[status] || 'bg-gray-100'}`}>
            {icons[status]} {status}
        </span>
    )
}