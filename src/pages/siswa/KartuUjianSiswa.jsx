import { useSiswa } from '../../context/SiswaContext';
import { Printer, AlertCircle, FileBadge2, CalendarDays, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function KartuUjianSiswa() {
  const { profil, totalNunggak } = useSiswa();

  if (!profil) return null;

  const isBlocked = profil.blokir_ujian || totalNunggak > 0;
  const alasan = profil.alasan_blokir || (totalNunggak > 0 ? 'Anda memiliki tunggakan administrasi yang belum diselesaikan.' : 'Akses cetak ditangguhkan oleh Administrator.');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto print:m-0 print:p-0">
      
      <div className="flex items-center gap-4 mb-8 print:hidden">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <FileBadge2 size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy tracking-tight">Cetak Kartu Ujian</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Gunakan kartu ini sebagai syarat mengikuti evaluasi belajar.</p>
        </div>
      </div>

      {isBlocked ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center shadow-sm print:hidden animate-in zoom-in-95">
          <div className="w-20 h-20 bg-red-100 text-red-500 flex items-center justify-center rounded-3xl mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-xl font-black text-red-600 mb-2 uppercase tracking-tight">Akses Cetak Diblokir</h3>
          <p className="text-sm font-bold text-red-400 max-w-md mx-auto">{alasan}</p>
          <div className="mt-8">
            <Button disabled variant="outline" className="opacity-50">
              <Printer className="w-4 h-4 mr-2" /> Tidak Dapat Mencetak
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border shadow-xl shadow-sora-blue/5 relative overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sora-blue/5 rounded-full blur-3xl -mr-20 -mt-20 print:hidden"></div>
          
          <div className="relative z-10 border-2 border-sora-navy p-8 rounded-3xl print:border-black print:rounded-none">
            <div className="text-center border-b-2 border-sora-navy pb-6 mb-6 print:border-black">
              <h1 className="text-2xl font-black uppercase tracking-widest text-sora-navy print:text-black">KARTU PESERTA UJIAN</h1>
              <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest print:text-gray-800">Tahun Ajaran 2026/2027</p>
            </div>

            <div className="grid grid-cols-3 gap-8 items-center">
              <div className="col-span-2 space-y-4 text-sm font-bold text-sora-navy print:text-black">
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2 print:border-gray-300">
                  <span className="text-gray-500 uppercase tracking-widest text-xs print:text-gray-600">Nama Siswa</span>
                  <span className="col-span-2 font-black text-base">{profil.nama_lengkap}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2 print:border-gray-300">
                  <span className="text-gray-500 uppercase tracking-widest text-xs print:text-gray-600">NISN</span>
                  <span className="col-span-2">{profil.nisn}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2 print:border-gray-300">
                  <span className="text-gray-500 uppercase tracking-widest text-xs print:text-gray-600">Kelas</span>
                  <span className="col-span-2">{profil.kelas} {profil.jurusan}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2 print:border-gray-300">
                  <span className="text-gray-500 uppercase tracking-widest text-xs print:text-gray-600">Status</span>
                  <span className="col-span-2 text-sora-green">AKTIF MENGIKUTI UJIAN</span>
                </div>
              </div>

              <div className="col-span-1 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-200 pl-8 print:border-gray-400">
                <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center mb-4 print:border-black">
                  <span className="text-xs font-bold text-gray-400 text-center uppercase">Pas Foto<br/>3x4</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-sora-navy grid grid-cols-2 gap-4 text-xs font-bold text-gray-500 print:border-black print:text-black">
              <div className="flex items-center gap-2"><CalendarDays size={16}/> Berlaku selama masa evaluasi semester.</div>
              <div className="flex items-center gap-2"><MapPin size={16}/> SORA Foundation.</div>
            </div>
          </div>

          <div className="mt-8 text-right print:hidden">
            <Button onClick={handlePrint} className="bg-sora-navy hover:bg-sora-blue text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sora-navy/20">
              <Printer className="w-4 h-4 mr-2" /> Cetak Kartu Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}