import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Trash2, Loader2, LogOut, AlertTriangle } from 'lucide-react'
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
      // COBA 1: Ambil data LENGKAP dengan relasi profiles
      const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            profiles ( full_name, username )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log("Data Admin:", data) // Cek di Console (F12)
      setReports(data || [])

    } catch (err) {
      console.error("Gagal load relasi, mencoba mode simple...", err)
      
      // COBA 2: Fallback (Jika relasi gagal, ambil laporan saja tanpa nama)
      const { data: simpleData, error: simpleError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (simpleError) {
          setErrorMsg("Gagal memuat database: " + simpleError.message)
      } else {
          setReports(simpleData || [])
          toast.warning("Mode Terbatas: Nama pelapor tidak muncul (Cek Relasi DB)")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus, userId) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Gagal update')
    } else {
      toast.success(`Status: ${newStatus}`)
      fetchReports()
      
      // Tambah Poin jika Valid
      if (newStatus === 'Verified' && userId) {
         await supabase.rpc('increment_points', { user_id_param: userId, points_param: 10 })
         // Note: Kita butuh buat fungsi SQL 'increment_points' nanti jika belum ada
         // Untuk sekarang, update manual query:
         const { data: userPoints } = await supabase.from('profiles').select('points').eq('id', userId).single()
         if (userPoints) {
             await supabase.from('profiles').update({ points: (userPoints.points || 0) + 10 }).eq('id', userId)
         }
      }
    }
  }

  const deleteReport = async (id) => {
    if(!confirm("Hapus permanen?")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) toast.error('Gagal hapus')
    else {
      toast.success('Terhapus')
      fetchReports()
    }
  }

  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.status === filter)

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 font-sans md:pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              🛡️ Dashboard Admin
            </h1>
            <p className="text-gray-500">Panel Validasi Laporan Warga</p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={fetchReports} className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Refresh Data
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Kembali ke App
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> {errorMsg}
            </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-2xl font-bold">{reports.length}</h3>
                <p className="text-xs text-gray-500 uppercase">Total</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
                <h3 className="text-2xl font-bold">{reports.filter(r => r.status === 'Pending').length}</h3>
                <p className="text-xs text-gray-500 uppercase">Pending</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                <h3 className="text-2xl font-bold">{reports.filter(r => r.status === 'Resolved').length}</h3>
                <p className="text-xs text-gray-500 uppercase">Selesai</p>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-2 rounded-t-xl border-b border-gray-100 flex gap-2 overflow-x-auto">
            {['All', 'Pending', 'Verified', 'Resolved'].map(status => (
                <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                        filter === status ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-100 min-h-[300px]">
            {loading ? (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                    <span className="text-gray-400">Memuat data...</span>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="p-20 text-center text-gray-400">
                    Belum ada laporan masuk.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 uppercase tracking-wider font-bold border-b border-gray-100 text-xs">
                            <tr>
                                <th className="p-4">Bukti</th>
                                <th className="p-4">Detail</th>
                                <th className="p-4">Lokasi</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReports.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition group">
                                    <td className="p-4 align-top w-24">
                                        <div className="h-16 w-16 rounded-lg border border-gray-200 overflow-hidden cursor-pointer relative">
                                            <a href={item.image_url} target="_blank" rel="noreferrer">
                                                <img src={item.image_url} alt="bukti" className="h-full w-full object-cover group-hover:scale-110 transition" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col">
                                            {/* Handle jika profiles null (User dihapus/Relasi error) */}
                                            <span className="font-bold text-gray-800 text-base">
                                                {item.profiles?.full_name || 'User Tanpa Nama'}
                                            </span>
                                            <span className="text-xs text-gray-400 mb-2">
                                                {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                                            </span>
                                            <span className="bg-gray-100 px-2 py-1 rounded w-fit text-xs font-semibold mb-1 border border-gray-200">
                                                {item.category}
                                            </span>
                                            <p className="text-gray-500 text-xs line-clamp-2 italic">
                                                "{item.description || 'Tanpa keterangan'}"
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <a 
                                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`} 
                                            target="_blank" 
                                            className="flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg w-fit text-xs font-medium"
                                            rel="noreferrer"
                                        >
                                            <MapPin size={14} /> Buka Peta
                                        </a>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block
                                            ${item.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${item.status === 'Verified' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' : ''}
                                        `}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex justify-center gap-2">
                                            {item.status === 'Pending' && (
                                                <button onClick={() => updateStatus(item.id, 'Verified', item.user_id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition text-xs font-bold">
                                                    <CheckCircle size={14} /> Validasi
                                                </button>
                                            )}
                                            
                                            {item.status === 'Verified' && (
                                                <button onClick={() => updateStatus(item.id, 'Resolved', item.user_id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition text-xs font-bold">
                                                    <CheckCircle size={14} /> Selesai
                                                </button>
                                            )}

                                            <button onClick={() => deleteReport(item.id)} className="p-2 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition" title="Hapus">
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