import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSiswa } from '../../context/SiswaContext';
import { User, Mail, GraduationCap, MapPin, Phone, Save, CheckCircle2, Loader2, Layers, Lock, KeyRound, Eye, EyeOff, BookOpen, Users } from 'lucide-react';

export default function ProfilSiswa() {
  const { profil, fetchProfil } = useSiswa();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nisn: '',
    kelas: '',
    jurusan: '',
    email: '',
    no_hp: '',
    alamat: '',
    nama_ortu: '',
    no_hp_ortu: ''
  });

  const [isPassLoading, setIsPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profil) {
      setFormData({
        nama_lengkap: profil.nama_lengkap || '',
        nisn: profil.nisn || '',
        kelas: profil.kelas || '',
        jurusan: profil.jurusan || '',
        email: profil.user?.email || '',
        no_hp: profil.no_hp || '',
        alamat: profil.alamat || profil.orang_tua?.alamat || '',
        nama_ortu: profil.orang_tua?.nama_lengkap || '',
        no_hp_ortu: profil.orang_tua?.no_hp || ''
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    setIsPassLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Password berhasil diubah! Silakan gunakan password baru pada login berikutnya.");
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mengubah password. Pastikan password lama benar.";
      alert(msg);
    } finally {
      setIsPassLoading(false);
    }
  };

  if (!profil) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-sora-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border shadow-sm overflow-hidden">
        <div className="h-28 md:h-32 bg-sora-navy relative">
          <div className="absolute -bottom-10 md:-bottom-12 left-6 md:left-10">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-3xl p-1 shadow-xl">
              <div className="w-full h-full bg-sora-blue/10 rounded-xl md:rounded-2xl flex items-center justify-center text-sora-blue">
                <User size={32} className="md:w-10 md:h-10" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-14 pb-8 px-6 md:pt-16 md:pb-10 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-sora-navy">{profil.nama_lengkap}</h2>
              <p className="text-xs md:text-sm font-bold text-gray-400">Siswa • {profil.kelas} {profil.jurusan}</p>
            </div>
            <div className="flex items-center gap-2 bg-sora-green/10 text-sora-green px-4 py-2 rounded-xl border border-sora-green/20 w-max">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h3 className="text-base md:text-lg font-black text-sora-navy uppercase tracking-widest">Data Personal</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] font-black text-sora-blue hover:bg-sora-blue/5 px-4 py-2 rounded-lg transition-all uppercase tracking-widest whitespace-nowrap"
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
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Email Aktif</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">WhatsApp Siswa</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.no_hp}
                      onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Jurusan</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select 
                      disabled={!isEditing}
                      value={formData.jurusan}
                      onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60 appearance-none"
                    >
                      <option value="">Pilih Jurusan...</option>
                      <option value="IPA">IPA (Ilmu Pengetahuan Alam)</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                      <option value="BAHASA">Bahasa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400" size={16} />
                    <textarea 
                      disabled={!isEditing}
                      value={formData.alamat}
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                      rows="3"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">Nama Orang Tua</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.nama_ortu}
                      onChange={(e) => setFormData({...formData, nama_ortu: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sora-gray uppercase tracking-widest ml-1">No HP Orang Tua</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.no_hp_ortu}
                      onChange={(e) => setFormData({...formData, no_hp_ortu: e.target.value})}
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
                    className="w-full md:w-auto bg-sora-navy text-white px-8 py-4 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sora-blue transition-all disabled:opacity-50 shadow-md"
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
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border shadow-sm p-6 md:p-8">
            <h3 className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-6">Kontak & Akses</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-sora-blue rounded-xl shrink-0"><Mail size={18} /></div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Email Akun</p>
                  <p className="text-xs font-bold text-sora-navy truncate">{formData.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0"><Phone size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">WhatsApp</p>
                  <p className="text-xs font-bold text-sora-navy">{formData.no_hp || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-sora-green rounded-xl shrink-0"><MapPin size={18} /></div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Lokasi</p>
                  <p className="text-xs font-bold text-sora-navy">{formData.alamat || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border shadow-sm p-6 md:p-8">
            <h3 className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-6">Keamanan Akun</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    value={passForm.oldPassword}
                    onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})}
                    placeholder="Password Lama"
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sora-blue">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                    placeholder="Password Baru"
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                    placeholder="Konfirmasi Password Baru"
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-sora-blue outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isPassLoading}
                className="w-full bg-sora-bg text-sora-navy border border-sora-blue/20 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sora-navy hover:text-white transition-all disabled:opacity-50"
              >
                {isPassLoading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Ganti Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}