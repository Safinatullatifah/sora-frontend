import { useSiswa } from '../../context/SiswaContext';
import { AlertTriangle, CheckCircle2, Clock, Megaphone, FileText, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardSiswa() {
  const { profil, tagihan, pengumuman, totalNunggak, totalBulanNunggak, isBlokirUjian } = useSiswa();
  const navigate = useNavigate();

  const tagihanMendesak = tagihan.find(t => t.status === 'Belum Bayar' && t.tglBatas === '20 Apr 2026');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isBlokirUjian && (
        <div className="bg-red-600 text-white p-6 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center gap-5 shadow-xl shadow-red-600/20 mb-8 animate-in slide-in-from-top-4">
          <div className="bg-white/20 p-4 rounded-2xl shrink-0"><ShieldAlert size={36} /></div>
          <div className="flex-1">
            <h4 className="font-black text-lg uppercase tracking-widest">Akses Ujian Diblokir!</h4>
            <p className="text-sm font-medium mt-1 leading-relaxed text-white/90">Sistem mendeteksi tunggakan SPP sebanyak <strong>{totalBulanNunggak} bulan</strong>. Kartu Ujian (UTS/UAS) tidak dapat diakses. Harap segera melunasi tagihan atau hubungi Tata Usaha.</p>
          </div>
          <button onClick={() => navigate('/siswa/tagihan')} className="w-full md:w-auto bg-white text-red-600 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md whitespace-nowrap">Lihat Tagihan</button>
        </div>
      )}

      {tagihanMendesak && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/30 animate-bounce"><AlertTriangle size={24}/></div>
            <div><p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Peringatan Jatuh Tempo</p><p className="text-sm font-bold text-red-500">Tagihan <strong className="font-black text-red-600">{tagihanMendesak.nama}</strong> harus dilunasi sebelum <strong className="font-black text-red-600">{tagihanMendesak.tglBatas}</strong>.</p></div>
          </div>
          <button onClick={() => navigate('/siswa/tagihan')} className="w-full md:w-auto bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20 whitespace-nowrap">Bayar Sekarang</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sora-blue p-8 rounded-[2.5rem] text-white shadow-xl shadow-sora-blue/20 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Tagihan Belum Dibayar</p>
            <h3 className="text-4xl font-black mb-6">Rp {totalNunggak.toLocaleString('id-ID')}</h3>
            <button onClick={() => navigate('/siswa/tagihan')} className="bg-white text-sora-blue px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Lihat Rincian</button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center min-h-[200px]">
          <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-4">Status Data Induk</p>
          <div className="flex items-center gap-4">
            {profil.statusVerifikasi === 'Verified' ? (
              <><div className="bg-sora-green/10 p-4 rounded-2xl text-sora-green"><CheckCircle2 size={32}/></div><div><h4 className="text-xl font-black text-sora-navy">Terverifikasi</h4><p className="text-xs text-sora-gray font-bold">Data Anda valid. <button onClick={()=>navigate('/siswa/profil')} className="text-sora-blue hover:underline">Lihat Profil</button></p></div></>
            ) : (
              <><div className="bg-orange-100 p-4 rounded-2xl text-orange-500 animate-pulse"><Clock size={32}/></div><div><h4 className="text-xl font-black text-sora-navy">Menunggu Review</h4><p className="text-xs text-sora-gray font-bold">Admin sedang mengecek data Anda.</p></div></>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6"><div className="bg-red-50 text-red-500 p-2 rounded-xl"><Megaphone size={20}/></div><h3 className="text-lg font-black text-sora-navy uppercase tracking-widest">Papan Pengumuman</h3></div>
        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {pengumuman.map(p => (
            <div key={p.id} className="p-6 bg-sora-bg border border-sora-blue/10 rounded-2xl hover:border-sora-blue transition-all">
              <div className="flex justify-between items-start mb-2"><p className="text-[10px] font-black text-sora-blue bg-blue-50 px-2 py-1 rounded uppercase">{p.tipe}</p><p className="text-[10px] font-bold text-gray-400">{p.tanggal}</p></div>
              <h4 className="text-md font-black text-sora-navy mb-2 mt-3">{p.judul}</h4>
              <p className="text-xs text-sora-gray font-medium leading-relaxed mb-4">{p.pesan}</p>
              {p.file && (<button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-sora-navy hover:bg-sora-blue hover:text-white transition-all shadow-sm"><FileText size={14}/> Unduh Dokumen ({p.file})</button>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}