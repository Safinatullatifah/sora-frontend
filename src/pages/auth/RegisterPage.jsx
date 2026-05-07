import { useState } from 'react';
import { ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: '', email: '', asalSekolah: '', nisn: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        nama_lengkap: form.nama,
        email: form.email,
        nisn: form.nisn,
        kelas: 'Calon Siswa', 
        password: 'password123' 
      });

      setIsSuccess(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Pendaftaran gagal! Pastikan server menyala dan email/NISN belum terdaftar.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-sora-bg flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="bg-white max-w-lg w-full p-10 rounded-[3rem] shadow-2xl shadow-sora-blue/10 border border-gray-100 relative z-10">
        
        {!isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sora-gray hover:text-sora-navy mb-8 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ArrowLeft size={16}/> Kembali ke Portal
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-sora-blue text-white p-4 rounded-2xl shadow-lg shadow-sora-blue/20"><UserPlus size={24}/></div>
              <div>
                <h2 className="text-2xl font-black text-sora-navy">PPDB Online SORA</h2>
                <p className="text-xs font-bold text-gray-400">Pendaftaran Calon Siswa Baru</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} placeholder="Nama Lengkap Calon Siswa" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all" />
              <input type="text" required value={form.nisn} onChange={e=>setForm({...form, nisn: e.target.value})} placeholder="NISN" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all" />
              <input type="email" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="Email Aktif (Siswa / Orang Tua)" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all" />
              <input type="text" required value={form.asalSekolah} onChange={e=>setForm({...form, asalSekolah: e.target.value})} placeholder="Asal Sekolah (SMP/MTs)" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all" />
              
              <button type="submit" disabled={isLoading} className="w-full bg-sora-navy text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-sora-blue transition-all mt-6 shadow-xl shadow-sora-navy/20 disabled:opacity-50">
                {isLoading ? 'MENGIRIM DATA...' : 'Daftar Sekarang'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95 duration-500 py-8">
            <div className="w-24 h-24 bg-sora-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-sora-green" />
            </div>
            <h3 className="text-2xl font-black text-sora-navy mb-2">Pendaftaran Sukses!</h3>
            <p className="text-sm font-bold text-sora-gray leading-relaxed mb-8">
              Kami telah mengirimkan instruksi login dan pembayaran formulir ke email <br/><strong className="text-sora-blue">{form.email}</strong>.
            </p>
            <div className="bg-blue-50 text-sora-blue p-4 rounded-xl mb-6 text-xs font-bold text-left border border-blue-100">
              <p>Harap catat kredensial awal Anda:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Email: {form.email}</li>
                <li>Password Default: password123</li>
              </ul>
            </div>
            <button onClick={() => navigate('/login')} className="w-full bg-gray-100 text-sora-navy hover:bg-gray-200 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              Tutup & Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}