import { useSiswa } from '../../context/SiswaContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, Bell, Megaphone, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DashboardSiswa() {
  const { profil, totalNunggak, tagihan, pengumuman } = useSiswa();
  const navigate = useNavigate();

  const tagihanBelumBayar = tagihan.filter(t => t.status !== 'Lunas');
  const pengumumanTerbaru = pengumuman?.slice(0, 3) || []; // Ambil 3 info terbaru

  if (!profil) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Kartu Sapaan & Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-sora-navy rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-center text-white shadow-xl shadow-sora-navy/10 border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sora-blue rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Halo, {profil.nama_lengkap?.split(' ')[0]}! 👋</h2>
            <p className="text-gray-300 text-sm font-medium mb-8 max-w-md leading-relaxed">
              Selamat datang kembali di portal siswa SORA. Segala informasi akademik dan tagihan administrasi Anda dapat dipantau di sini.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                Kelas {profil.kelas} {profil.jurusan}
              </span>
              <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                NISN: {profil.nisn}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 border border-gray-100 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <Wallet size={32} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tunggakan</p>
          <h3 className="text-3xl font-black text-sora-navy mb-6">Rp {totalNunggak.toLocaleString('id-ID')}</h3>
          <Button onClick={() => navigate('/siswa/tagihan')} className="w-full bg-sora-navy hover:bg-sora-blue text-white rounded-xl py-6 shadow-lg shadow-sora-navy/10 text-xs font-black uppercase tracking-widest transition-all">
            Bayar Tagihan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Kolom Tagihan */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-sora-navy tracking-tight">Tagihan Terdekat</h3>
            <button onClick={() => navigate('/siswa/tagihan')} className="text-[10px] font-black text-sora-blue uppercase tracking-widest hover:text-sora-navy flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight size={14}/>
            </button>
          </div>

          <div className="space-y-4">
            {tagihanBelumBayar.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-100 text-center">
                <CheckCircle2 size={32} className="text-sora-green mb-3" />
                <p className="font-bold text-green-700 text-sm">Hore! Tidak ada tagihan.</p>
                <p className="text-xs text-green-600/80 mt-1">Anda sudah melunasi semua administrasi.</p>
              </div>
            ) : (
              tagihanBelumBayar.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-sora-blue/30 hover:bg-blue-50/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sora-navy text-sm mb-1 group-hover:text-sora-blue transition-colors line-clamp-1">{item.nama}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batas: {item.tglBatas}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sora-navy text-sm whitespace-nowrap">Rp {item.nominal.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Pengumuman */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-sora-navy tracking-tight">Info & Pengumuman</h3>
            <button onClick={() => navigate('/siswa/pengumuman')} className="text-[10px] font-black text-sora-blue uppercase tracking-widest hover:text-sora-navy flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight size={14}/>
            </button>
          </div>

          <div className="space-y-4">
            {pengumumanTerbaru.length === 0 ? (
              <div className="text-center py-8 font-bold text-gray-400 bg-gray-50 rounded-2xl">
                Belum ada pengumuman terbaru.
              </div>
            ) : (
              pengumumanTerbaru.map((info) => (
                <div key={info.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-sora-blue/30 transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${info.tipe === 'Penting' ? 'bg-red-50 text-red-500' : 'bg-sora-blue/10 text-sora-blue'}`}>
                    {info.tipe === 'Penting' ? <Bell size={20} /> : <Megaphone size={20} />}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${info.tipe === 'Penting' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-sora-blue'}`}>
                        {info.tipe}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(info.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-sora-navy text-sm mb-1 truncate group-hover:text-sora-blue transition-colors">{info.judul}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{info.pesan}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}