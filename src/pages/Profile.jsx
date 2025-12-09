import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { LogOut, Calendar, CheckCircle, Clock, Trash2, Award } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/')

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: reps } = await supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      
      setProfile(prof)
      setReports(reps || [])
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-24 md:px-12">
        <div className="max-w-6xl mx-auto">
            
            {/* 1. Header Profil (Card Besar) */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
                    {/* Avatar */}
                    <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700 uppercase">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    
                    {/* Nama & Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">{profile?.full_name}</h2>
                        <p className="text-gray-500">{profile?.username}</p>
                    </div>

                    {/* Stats Cards Mini */}
                    <div className="flex gap-4">
                        <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-center">
                            <p className="text-xs font-bold uppercase text-gray-400 mb-1">Total Poin</p>
                            <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                                <Award className="text-yellow-500" size={20} /> {profile?.points || 0}
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-center">
                            <p className="text-xs font-bold uppercase text-gray-400 mb-1">Laporan</p>
                            <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Riwayat Laporan (Grid System) */}
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trash2 size={24} className="text-gray-400" /> Riwayat Laporan Saya
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
                        Belum ada laporan yang dikirim.
                    </div>
                )}
                
                {reports.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full">
                        {/* Image */}
                        <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                            <img src={item.image_url} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" alt="trash" />
                            <div className="absolute top-2 right-2">
                                {item.status === 'Resolved' ? (
                                    <span className="bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <CheckCircle size={12} /> Selesai
                                    </span>
                                ) : (
                                    <span className="bg-white/90 backdrop-blur text-yellow-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <Clock size={12} /> Diproses
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{item.category}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description || 'Tidak ada keterangan tambahan.'}</p>
                        </div>

                        {/* Footer Card */}
                        <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={14} /> 
                            {new Date(item.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}