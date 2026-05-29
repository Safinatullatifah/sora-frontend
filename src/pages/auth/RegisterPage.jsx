import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Trash2, FileText, Loader2, User, Hash, Mail, Lock, BookOpen, Phone, MapPin, Users, Eye, EyeOff, UploadCloud, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [majors, setMajors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '',
    nisn: '',
    email: '',
    email_beasiswa: '',
    password: '',
    no_hp: '',
    alamat: '',
    jurusan: '',
    nama_orang_tua: '',
    email_orang_tua: '',
    hp_orang_tua: '',
    berkas_url: []
  });
  
  const [filesData, setFilesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/master/public/majors`);
        setMajors(res.data.data);
      } catch {
        toast.error("Gagal memuat daftar jurusan dari server.");
      }
    };
    fetchMajors();
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    const processedFiles = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve({ name: file.name, base64: reader.result });
          reader.onerror = (error) => reject(error);
        });
      })
    );
    
    setFilesData(processedFiles);
    setForm({ ...form, berkas_url: processedFiles.map(f => f.base64) });
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = filesData.filter((_, idx) => idx !== indexToRemove);
    setFilesData(updatedFiles);
    setForm({ ...form, berkas_url: updatedFiles.map(f => f.base64) });
    
    if (updatedFiles.length === 0) {
      const fileInput = document.getElementById('berkas');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.nisn.length !== 10) {
      toast.error("Data Tidak Valid", {
        description: "NISN harus berjumlah tepat 10 digit angka."
      });
      return;
    }

    if (filesData.length === 0) {
      toast.error("Berkas Belum Lengkap", {
        description: "Harap unggah minimal 1 berkas pendukung (Ijazah/KK/Akta)."
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/registrations`, form);
      toast.success("Pendaftaran Berhasil!", {
        description: "Data Anda telah masuk ke dalam sistem kami."
      });
      setIsSuccess(true);
    } catch (error) {
      let errorMsg = error.response?.data?.message || "Pendaftaran gagal! Pastikan server menyala dan data belum terdaftar.";
      if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        errorMsg = Object.values(errs).flat().join(', ');
      }
      setErrorMessage(`Validasi gagal: ${errorMsg}`);
      toast.error("Gagal Mendaftar", {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-sora-bg flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="bg-white max-w-4xl w-full p-6 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-sora-blue/10 border border-gray-100 relative z-10">
        
        {!isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sora-gray hover:text-sora-navy mb-6 sm:mb-8 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ArrowLeft size={16}/> Kembali ke Portal
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-sora-blue text-white rounded-2xl shadow-lg shadow-sora-blue/20 flex items-center justify-center flex-shrink-0">
                <UserPlus size={28}/>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-sora-navy tracking-tight mb-1">PPDB Online SORA</h2>
                <p className="text-sm font-medium text-sora-gray">Lengkapi form pendaftaran calon siswa baru di bawah ini.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-start gap-4 text-sm font-bold border border-red-100 animate-in fade-in">
                <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 mt-2">
                <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-3">Informasi Akun & Calon Siswa</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Nama sesuai ijazah" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">NISN</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required minLength={10} maxLength={10} value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="10 Digit NISN" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Siswa</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Email aktif untuk login" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Beasiswa (Opsional)</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={form.email_beasiswa} onChange={e => setForm({...form, email_beasiswa: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Email lembaga/donor beasiswa" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Password Login</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPassword ? "text" : "password"} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Buat password akun" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-sora-blue">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Pilihan Jurusan</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select required value={form.jurusan} onChange={e => setForm({...form, jurusan: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm appearance-none cursor-pointer">
                    <option value="" disabled>{majors.length > 0 ? "Pilih jurusan..." : "Memuat data..."}</option>
                    {majors.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">WhatsApp Siswa</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="08xxxxxxxxxx" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Alamat Lengkap</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 text-gray-400" size={18} />
                  <textarea required rows="3" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm resize-none" placeholder="Alamat domisili saat ini" />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-3">Data Orang Tua / Wali</h4>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Orang Tua</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required value={form.nama_orang_tua} onChange={e => setForm({...form, nama_orang_tua: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Nama Ayah / Ibu / Wali" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Orang Tua</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required value={form.email_orang_tua} onChange={e => setForm({...form, email_orang_tua: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="Email aktif orang tua" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">WhatsApp Orang Tua</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required value={form.hp_orang_tua} onChange={e => setForm({...form, hp_orang_tua: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all font-medium text-sm" placeholder="08xxxxxxxxxx" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 mt-4">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Unggah Berkas Pendukung (Ijazah, KK, Akta)</label>
                <div className="relative">
                  <input id="berkas" type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  <label htmlFor="berkas" className="w-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:bg-white hover:border-sora-blue transition-all cursor-pointer group">
                    <UploadCloud className="text-gray-400 group-hover:text-sora-blue mb-3 transition-colors" size={32} />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-sora-navy mb-1">Klik untuk memilih file</span>
                    <span className="text-xs text-gray-400">PDF, JPG, PNG (Max. 5MB)</span>
                  </label>
                </div>
                
                {filesData.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-2 ml-1">Berkas Terpilih:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filesData.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:border-sora-blue/30 hover:shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg border border-gray-100">
                              <FileText size={16} className="text-sora-blue flex-shrink-0" />
                            </div>
                            <span className="text-xs font-bold text-sora-navy truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <button type="button" onClick={() => removeFile(idx)} className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 mt-8 pt-6 border-t border-gray-100">
                <button type="submit" disabled={isLoading || filesData.length === 0} className="w-full bg-sora-navy text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-sora-blue transition-all shadow-xl shadow-sora-navy/20 disabled:opacity-50 flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                  {isLoading ? 'MENGIRIM DATA...' : 'DAFTAR SEKARANG'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500 py-10 sm:py-16 max-w-lg mx-auto">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-sora-green/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-sora-green/20">
              <CheckCircle2 size={48} className="text-sora-green sm:w-14 sm:h-14" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-sora-navy mb-4 tracking-tight">Pendaftaran Sukses!</h3>
            <p className="text-sm font-medium text-sora-gray leading-relaxed mb-10">
              Data pendaftaran dan berkas Anda telah berhasil dikirimkan ke server kami. Silakan cek email yang Anda daftarkan dan tunggu proses verifikasi akun oleh Admin SORA.
            </p>
            <button onClick={() => navigate('/login')} className="w-full bg-gray-50 text-sora-navy border border-gray-200 hover:border-sora-blue hover:bg-white hover:text-sora-blue py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
              Kembali ke Halaman Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}