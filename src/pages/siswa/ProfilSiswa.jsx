import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSiswa } from '../../context/SiswaContext';
import { User, Mail, GraduationCap, MapPin, Phone, Save, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProfilSiswa() {
  const { profil, fetchProfil } = useSiswa();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nisn: '',
    kelas: ''
  });

  useEffect(() => {
    if (profil) {
      setFormData({
        nama_lengkap: profil.nama_lengkap || '',
        nisn: profil.nisn || '',
        kelas: profil.kelas || ''
      });
    }
  }, [profil]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('studentId');
      
      await axios.put(`${import.meta.env.VITE_API_URL}/students/${studentId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchProfil();
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch {
      alert("Gagal memperbarui profil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profil) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-sora-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
        <div className="h-32 bg-sora-navy relative">
          <div className="absolute -bottom-12 left-10">
            <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
              <div className="w-full h-full bg-sora-blue/10 rounded-2xl flex items-center justify-center text-sora-blue">
                <User size={40} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-sora-navy">{profil.nama_lengkap}</h2>
              <p className="text-sm font-bold text-gray-400">Siswa • {profil.kelas}</p>
            </div>
            <div className="flex items-center gap-2 bg-sora-green/10 text-sora-green px-4 py-2 rounded-xl border border-sora-green/20">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-sora-navy uppercase tracking-widest">Data Personal</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] font-black text-sora-blue hover:bg-sora-blue/5 px-4 py-2 rounded-lg transition-all uppercase tracking-widest"
              >
                {isEditing ? 'Batal' : 'Edit Profil'}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">NISN</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.nisn}
                      onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Kelas</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.kelas}
                      onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full md:w-auto bg-sora-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sora-blue transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-8">
            <h3 className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-6">Kontak & Akses</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-sora-blue rounded-xl"><Mail size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Email Akun</p>
                  <p className="text-xs font-bold text-sora-navy">{profil.user?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Phone size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">WhatsApp</p>
                  <p className="text-xs font-bold text-sora-navy">0812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-sora-green rounded-xl"><MapPin size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Lokasi</p>
                  <p className="text-xs font-bold text-sora-navy">Jawa Timur, ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layers({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}