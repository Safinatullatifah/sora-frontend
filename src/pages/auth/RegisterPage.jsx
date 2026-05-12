import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Trash2, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({
    nama_lengkap: '',
    nisn: '',
    email: '',
    no_hp: '',
    alamat: '',
    jurusan: '',
    nama_orang_tua: '',
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
        setErrorMessage("Gagal memuat daftar jurusan dari server.");
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
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/registrations`, form);
      setIsSuccess(true);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        const messages = Object.values(errs).flat().join(', ');
        setErrorMessage(`Validasi gagal: ${messages}`);
      } else {
        setErrorMessage(error.response?.data?.message || "Pendaftaran gagal! Pastikan server menyala dan data belum terdaftar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-sora-bg flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <div className="bg-white max-w-3xl w-full p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-sora-blue/10 border border-gray-100 relative z-10">
        
        {!isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sora-gray hover:text-sora-navy mb-6 sm:mb-8 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ArrowLeft size={16}/> Kembali ke Portal
            </button>
            
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="bg-sora-blue text-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-sora-blue/20">
                <UserPlus size={24}/>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-sora-navy">PPDB Online SORA</h2>
                <p className="text-xs font-bold text-gray-400">Pendaftaran Calon Siswa Baru</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-bold border border-red-100 animate-in fade-in">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 mt-2">
                <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Calon Siswa</h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                <Input id="nama_lengkap" required value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})} placeholder="Nama calon siswa" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input id="nisn" required value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} placeholder="Masukkan 10 digit NISN" minLength={10} maxLength={10} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Aktif</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email aktif" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan">Pilih Jurusan</Label>
                <Select onValueChange={(val) => setForm({...form, jurusan: val})} required>
                  <SelectTrigger>
                    <SelectValue placeholder={majors.length > 0 ? "Pilih jurusan..." : "Memuat data..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map(m => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp">WhatsApp Siswa</Label>
                <Input id="no_hp" required value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} placeholder="08xxxxxxxxxx" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea id="alamat" required value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} placeholder="Alamat domisili saat ini" rows={2} />
              </div>

              <div className="md:col-span-2 mt-4">
                <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Orang Tua / Wali</h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_orang_tua">Nama Orang Tua</Label>
                <Input id="nama_orang_tua" required value={form.nama_orang_tua} onChange={e => setForm({...form, nama_orang_tua: e.target.value})} placeholder="Nama Ayah / Ibu" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hp_orang_tua">WhatsApp Orang Tua</Label>
                <Input id="hp_orang_tua" required value={form.hp_orang_tua} onChange={e => setForm({...form, hp_orang_tua: e.target.value})} placeholder="08xxxxxxxxxx" />
              </div>

              <div className="space-y-2 md:col-span-2 mt-4">
                <Label htmlFor="berkas">Upload Berkas (Ijazah, KK, Akta)</Label>
                <Input id="berkas" type="file" multiple onChange={handleFileChange} className="cursor-pointer file:text-sora-navy" accept=".pdf,.jpg,.jpeg,.png" />
                
                {filesData.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-2">Berkas Terpilih:</p>
                    {filesData.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:border-sora-blue/30">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText size={16} className="text-sora-blue flex-shrink-0" />
                          <span className="text-xs font-bold text-sora-navy truncate">{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 mt-6">
                <Button type="submit" disabled={isLoading || filesData.length === 0} className="w-full bg-sora-navy text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-sora-blue transition-all shadow-xl shadow-sora-navy/20 disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  {isLoading ? 'MENGIRIM DATA...' : 'Daftar Sekarang'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500 py-6 sm:py-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sora-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-sora-green sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-sora-navy mb-2">Pendaftaran Sukses!</h3>
            <p className="text-xs sm:text-sm font-bold text-sora-gray leading-relaxed mb-8">
              Data dan berkas telah berhasil dikirimkan. <br/><strong className="text-sora-blue">Silakan menunggu proses verifikasi oleh Admin SORA.</strong>
            </p>
            <button onClick={() => navigate('/login')} className="w-full bg-gray-100 text-sora-navy hover:bg-gray-200 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Tutup & Kembali ke Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}