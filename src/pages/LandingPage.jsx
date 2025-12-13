import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Camera, MapPin, Award, CheckCircle, Menu, X, ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- NAVBAR PUBLIK --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 text-green-600 font-bold text-2xl">
            <div className="bg-green-100 p-2 rounded-xl">
                <Leaf className="fill-green-600" size={24} />
            </div>
            <span>LaporKota</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-sm font-semibold text-gray-500 hover:text-green-600 transition">Fitur</a>
            <a href="#cara-kerja" className="text-sm font-semibold text-gray-500 hover:text-green-600 transition">Cara Kerja</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-green-600 transition">
              Masuk
            </Link>
            <Link to="/login" className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all">
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-6 space-y-4 shadow-lg absolute w-full">
            <a href="#fitur" className="block text-sm font-semibold text-gray-600">Fitur</a>
            <a href="#cara-kerja" className="block text-sm font-semibold text-gray-600">Cara Kerja</a>
            <hr />
            <Link to="/login" className="block w-full text-center py-3 rounded-xl border border-gray-200 font-bold text-gray-600">
              Masuk Akun
            </Link>
            <Link to="/login" className="block w-full text-center py-3 rounded-xl bg-green-600 text-white font-bold shadow-md">
              Daftar Sekarang
            </Link>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
            🚀 Bantu Kota Lebih Bersih
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Ubah Sampah Menjadi <br/> <span className="text-green-600">Kebaikan & Reward</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            Laporkan tumpukan sampah liar di sekitarmu, biarkan petugas membersihkan, dan dapatkan poin yang bisa ditukar dengan hadiah menarik.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-300 hover:bg-green-700 transition flex items-center justify-center gap-2">
              <Camera size={20} /> Mulai Lapor
            </Link>
            <a href="#cara-kerja" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition">
              Pelajari Cara Kerja
            </a>
          </div>

          {/* Hero Image / Mockup Placeholder */}
          <div className="mt-16 relative mx-auto max-w-4xl">
   <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-full animate-pulse"></div> {/* Efek Glow */}
   
   <img 
     src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop" 
     alt="App Preview" 
     // PERHATIKAN CLASS DI BAWAH INI: animate-float
     className="relative rounded-3xl shadow-2xl border-8 border-white mx-auto w-full object-cover h-64 md:h-96 animate-float"
   />
</div>
        </div>
      </section>

      {/* --- FITUR UNGGULAN --- */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Menggunakan LaporKota?</h2>
            <p className="text-gray-500">Teknologi canggih untuk lingkungan yang lebih baik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Camera className="text-white" size={28} />}
              title="Deteksi AI Pintar"
              desc="Tidak perlu bingung memilih kategori. AI kami otomatis mengenali jenis sampah dari foto Anda."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={<MapPin className="text-white" size={28} />}
              title="Lokasi Akurat"
              desc="Sistem GPS presisi tinggi memastikan petugas menemukan lokasi sampah dengan cepat."
              color="bg-green-500"
            />
            <FeatureCard 
              icon={<Award className="text-white" size={28} />}
              title="Gamifikasi & Reward"
              desc="Kumpulkan poin dari setiap laporan valid. Naikkan levelmu dan jadilah pahlawan lingkungan."
              color="bg-orange-500"
            />
          </div>
        </div>
      </section>

      {/* --- CARA KERJA --- */}
      <section id="cara-kerja" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Lapor dalam 3 Langkah Mudah</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <Step number="1" title="Ambil Foto" desc="Buka aplikasi dan foto tumpukan sampah yang Anda temukan." />
                <Step number="2" title="Kirim Laporan" desc="AI akan mendeteksi jenis sampah. Tambahkan detail lokasi lalu kirim." />
                <Step number="3" title="Dapat Poin" desc="Setelah diverifikasi petugas, Anda akan mendapatkan poin reward." />
            </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-green-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-green-300">
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Menjaga Kota Kita?</h2>
                <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">Bergabunglah dengan ribuan warga lainnya yang telah berkontribusi membuat lingkungan lebih bersih dan sehat.</p>
                <Link to="/login" className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition shadow-lg">
                    Daftar Gratis Sekarang <ArrowRight size={20} />
                </Link>
            </div>
            {/* Pattern Overlay */}
            <Leaf className="absolute top-10 left-10 text-white opacity-10 w-32 h-32 -rotate-45" />
            <Leaf className="absolute bottom-10 right-10 text-white opacity-10 w-40 h-40 rotate-12" />
        </div>
      </section>

      {/* --- FOOTER PROFESIONAL --- */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
                    <Leaf className="text-green-500" /> LaporKota
                </div>
                <p className="max-w-sm">Platform pelaporan sampah berbasis komunitas dan kecerdasan buatan untuk mewujudkan kota yang bebas sampah.</p>
            </div>
            
            <div>
                <h4 className="text-white font-bold mb-4">Navigasi</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-green-500 transition">Beranda</a></li>
                    <li><a href="#fitur" className="hover:text-green-500 transition">Fitur</a></li>
                    <li><a href="#tentang" className="hover:text-green-500 transition">Tentang Kami</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-4">Hubungi Kami</h4>
                <ul className="space-y-2 text-sm">
                    <li>support@laporkota.id</li>
                    <li>+62 812 3456 7890</li>
                    <li>Jl. Merdeka No. 45, Bengkulu</li>
                </ul>
                <div className="flex gap-4 mt-4">
                    <Instagram size={20} className="hover:text-white cursor-pointer" />
                    <Twitter size={20} className="hover:text-white cursor-pointer" />
                    <Facebook size={20} className="hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-sm">
            &copy; 2024 LaporKota Indonesia. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// Komponen Kecil untuk Kartu Fitur & Step
const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
        {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
)

const Step = ({ number, title, desc }) => (
    <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-green-100 text-green-700 font-bold text-xl rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
            {number}
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-500 text-sm max-w-xs">{desc}</p>
    </div>
)