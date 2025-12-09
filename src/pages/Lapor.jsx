import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import { Camera, MapPin, Send, X, Loader2, Sparkles, Leaf, Trash2, AlertTriangle } from 'lucide-react'
// Pastikan library ini terinstall: npm install @tensorflow/tfjs @tensorflow-models/coco-ssd
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'

export default function Lapor() {
  const navigate = useNavigate()
  
  // State Data
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState({ lat: null, lng: null })
  
  // State Status
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState([]) 
  const [locationStatus, setLocationStatus] = useState('Mencari lokasi...')
  
  const imageRef = useRef(null)

  // 1. Ambil Lokasi (GPS)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationStatus('Lokasi Terkunci')
        },
        (error) => {
          console.error(error)
          setLocationStatus('Gagal deteksi GPS')
          toast.error("Aktifkan lokasi di browser Anda")
        }
      )
    }
  }, [])

  // 2. Fungsi Utama AI
  const detectObjects = async (imgElement) => {
    // Pastikan gambar sudah termuat
    if (!imgElement) return;

    setAiLoading(true)
    setAiResult([])
    
    try {
      // Load Model
      const model = await cocoSsd.load()
      
      // Deteksi
      const predictions = await model.detect(imgElement)
      
      // Filter Objek Sampah
      const trashKeywords = ['bottle', 'cup', 'bowl', 'bag', 'banana', 'apple', 'sandwich', 'orange', 'carrot', 'pizza', 'donut', 'cake', 'book', 'paper']
      const detectedTrash = predictions.filter(pred => trashKeywords.includes(pred.class))

      if (detectedTrash.length > 0) {
        setAiResult(detectedTrash)
        toast.success(`AI Mendeteksi: ${detectedTrash[0].class}`)
        
        // Auto-Suggest Kategori
        const trashItem = detectedTrash[0].class
        if (['bottle', 'cup', 'bag'].includes(trashItem)) setCategory('Plastik')
        else if (['banana', 'apple', 'food', 'sandwich', 'pizza'].includes(trashItem)) setCategory('Organik')
        else if (['book', 'paper'].includes(trashItem)) setCategory('Organik')
      } else {
        toast.info("AI: Objek tidak spesifik, silakan pilih manual.")
      }

    } catch (error) {
      console.error("AI Error:", error)
      toast.error("Gagal memuat AI, silakan lanjutkan manual.")
    } finally {
      setAiLoading(false)
    }
  }

  // 3. Handle Ganti Foto
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setAiResult([]) // Reset AI lama
    }
  }

  // 4. Submit Laporan
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!image || !category || !location.lat) {
      toast.error('Mohon lengkapi foto, kategori, dan lokasi!')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Anda harus login')

      // Upload Foto
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('sampah-images')
        .upload(fileName, image)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('sampah-images')
        .getPublicUrl(fileName)

      // Simpan ke Database
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          category: category,
          description: description,
          latitude: location.lat,
          longitude: location.lng,
          status: 'Pending'
        })

      if (insertError) throw insertError

      toast.success('Laporan Berhasil Dikirim!')
      navigate('/dashboard')

    } catch (error) {
      console.error(error)
      toast.error('Gagal: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pt-24 md:px-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Page */}
        <div className="mb-6 flex items-center justify-between px-4 md:px-0">
            <h1 className="text-2xl font-bold text-gray-800">Buat Laporan Baru</h1>
            <div className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-2 font-medium bg-white shadow-sm border ${location.lat ? 'text-green-700 border-green-200' : 'text-red-600 border-red-200'}`}>
                <MapPin size={16} /> {locationStatus}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
            
            {/* KOLOM KIRI: Foto */}
            <div className="space-y-4">
              <div className="group relative w-full aspect-square sm:aspect-video lg:aspect-square overflow-hidden rounded-3xl bg-white border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/30 transition-all shadow-sm">
                {imagePreview ? (
                    <div className="relative w-full h-full">
                        <img 
                            ref={imageRef} 
                            src={imagePreview} 
                            onLoad={() => detectObjects(imageRef.current)} 
                            className="h-full w-full object-cover" 
                            alt="Preview" 
                            crossOrigin='anonymous'
                        />
                        
                        {aiLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
                                <Loader2 className="animate-spin mb-2" size={40} />
                                <span className="animate-pulse font-medium">AI Menganalisa...</span>
                            </div>
                        )}

                        <button type="button" onClick={() => { setImage(null); setImagePreview(null) }} className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-red-500 shadow-lg hover:bg-white transition">
                            <X size={20} />
                        </button>

                        {aiResult.length > 0 && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-green-500/90 px-4 py-2 text-white shadow-lg backdrop-blur-md">
                                <Sparkles size={16} className="text-yellow-300" />
                                <span className="text-sm font-bold capitalize">{aiResult[0].class}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-10">
                        <div className="mb-4 rounded-full bg-green-50 p-6 text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Camera size={48} />
                        </div>
                        <span className="text-lg font-bold text-gray-700">Ambil Foto Sampah</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                    </label>
                )}
              </div>
            </div>

            {/* KOLOM KANAN: Input */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <div className="space-y-6">
                
                {/* Kategori Grid */}
                <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">Pilih Kategori</label>
                    <div className="grid grid-cols-2 gap-3">
                    {['Organik', 'Plastik', 'B3', 'Liar'].map((cat) => (
                        <div 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                            category === cat 
                            ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500 shadow-sm' 
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-green-200'
                        }`}
                        >
                        <div className="mb-2 flex justify-center">
                            {cat === 'Organik' && <Leaf size={24} />}
                            {cat === 'Plastik' && <Trash2 size={24} />}
                            {cat === 'B3' && <AlertTriangle size={24} />}
                            {cat === 'Liar' && <MapPin size={24} />}
                        </div>
                        <span className="text-sm font-semibold">{cat}</span>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">Keterangan</label>
                    <textarea 
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all resize-none"
                        placeholder="Detail lokasi..."
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading || aiLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 font-bold text-white shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                >
                    {loading ? 'Mengirim Data...' : <><Send size={20} /> Kirim Laporan</>}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}