import { useState } from 'react';
import { ArrowLeft, Search, Printer, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CekStatusPage() {
  const navigate = useNavigate();
  const [nisn, setNisn] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/registrations/status/check`, {
        params: { nisn, email }
      });
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mencari data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStatus = (status) => {
    switch(status) {
      case 'ACCEPTED':
        return <div className="flex items-center gap-2 text-sora-green bg-green-50 p-3 rounded-xl border border-green-100"><CheckCircle size={20}/> <span className="font-black">DITERIMA</span></div>;
      case 'REJECTED':
        return <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"><XCircle size={20}/> <span className="font-black">DITOLAK</span></div>;
      default:
        return <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100"><Clock size={20}/> <span className="font-black">MENUNGGU VERIFIKASI</span></div>;
    }
  };

  return (
    <div className="min-h-screen w-full bg-sora-bg flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden print:bg-white print:items-start print:p-0">
      <div className="bg-white max-w-xl w-full p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-sora-blue/10 border border-gray-100 relative z-10 print:shadow-none print:border-none print:rounded-none print:p-0">
        
        <div className="print:hidden">
          <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sora-gray hover:text-sora-navy mb-8 font-bold text-[10px] uppercase tracking-widest transition-colors">
            <ArrowLeft size={16}/> Kembali ke Portal
          </button>
          
          <div className="mb-8">
            <h2 className="text-2xl font-black text-sora-navy tracking-tight">Cek Status & Cetak Bukti</h2>
            <p className="text-sm font-medium text-gray-500">Masukkan NISN dan Email yang Anda gunakan saat mendaftar.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label>NISN</Label>
              <Input required value={nisn} onChange={e => setNisn(e.target.value)} placeholder="Masukkan 10 digit NISN..." />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Masukkan email aktif..." />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-sora-navy hover:bg-sora-blue text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-sora-navy/20 mt-4 transition-all">
              {isLoading ? 'Mencari Data...' : <><Search className="w-4 h-4 mr-2"/> Cari Data</>}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100 text-center animate-in fade-in">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="mt-8 pt-8 border-t border-gray-100 print:border-none print:mt-0 print:pt-0 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-sora-blue text-white rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-lg print:hidden">S</div>
              <h3 className="text-2xl font-black text-sora-navy tracking-tight uppercase">Bukti Pendaftaran</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">PPDB Online SORA Foundation</p>
            </div>

            <div className="space-y-4 text-sm font-medium text-gray-500">
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>ID Pendaftaran</span>
                <span className="font-black text-sora-navy uppercase">{result.id.split('-')[0]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>Nama Lengkap</span>
                <span className="font-black text-sora-navy">{result.nama_lengkap}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>NISN</span>
                <span className="font-black text-sora-navy">{result.nisn}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>Email</span>
                <span className="font-black text-sora-navy">{result.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>Pilihan Jurusan</span>
                <span className="font-black text-sora-navy">{result.jurusan}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-3">
                <span>Tanggal Daftar</span>
                <span className="font-black text-sora-navy">
                  {new Date(result.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Status Saat Ini</span>
                <div className="flex justify-center">
                  {renderStatus(result.status)}
                </div>
                {result.status === 'REJECTED' && result.catatan_admin && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-600 text-xs font-bold text-center">
                    Catatan Admin: {result.catatan_admin}
                  </div>
                )}
                {result.status === 'ACCEPTED' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl text-green-700 text-xs font-bold text-center">
                    Selamat! Silakan periksa email Anda secara berkala untuk detail *login* portal siswa.
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handlePrint} className="print:hidden w-full mt-8 bg-gray-100 hover:bg-gray-200 text-sora-navy py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
              <Printer className="w-4 h-4 mr-2"/> Cetak Bukti Pendaftaran
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}