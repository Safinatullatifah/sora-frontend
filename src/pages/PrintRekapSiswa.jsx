import { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintRekapSiswa() {
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('printRekapSiswaData');
      if (savedData) {
        try {
          setSiswa(JSON.parse(savedData));
        } catch {
          setSiswa(null);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center font-bold text-gray-500">Mempersiapkan data rekap...</div>;
  }

  if (!siswa) {
    return (
      <div className="p-10 text-center font-bold text-gray-500 max-w-md mx-auto">
        <p className="mb-4">Data rekap tidak ditemukan</p>
        <button onClick={() => window.close()} className="px-4 py-2 bg-sora-blue text-white rounded-lg hover:bg-sora-navy">Tutup Tab</button>
      </div>
    );
  }

  const tunggakan = siswa.tagihan?.filter(t => t.status === 'Belum Bayar') || [];
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white text-black p-10 font-sans max-w-4xl mx-auto relative">
      <div className="mb-10 flex justify-end items-center gap-3 print:hidden bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
        <button onClick={() => window.close()} className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-sora-navy hover:bg-gray-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Tutup Tab
        </button>
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sora-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sora-navy shadow-md transition-all">
          <Printer size={16} /> Cetak Rekap
        </button>
      </div>

      <div className="border-b-4 border-black pb-6 mb-8 text-center">
        <h1 className="text-3xl font-black uppercase tracking-widest">SORA Digitalization</h1>
        <p className="text-sm">Sistem Administrasi Terpadu</p>
      </div>
      <h2 className="text-xl font-bold underline uppercase text-center mb-8">Surat Keterangan Rincian Tanggungan</h2>
      <div className="text-base mb-8">
        <p>Kepala Administrasi menerangkan bahwa:</p>
        <table className="ml-4 mt-2 font-bold">
          <tbody>
            <tr><td className="w-40">Nama</td><td>: {siswa.nama}</td></tr>
            <tr><td>NISN / Kelas</td><td>: {siswa.nisn} / {siswa.kelas} {siswa.jurusan}</td></tr>
          </tbody>
        </table>
        <p className="mt-4">
          Memiliki rincian tanggungan administrasi hingga tanggal <b>{tgl}</b> sebagai berikut:
        </p>
      </div>
      <table className="w-full border-collapse border border-black mb-16 text-sm">
        <thead>
          <tr className="bg-gray-100 print-exact">
            <th className="border border-black p-3 w-12 text-center">No</th>
            <th className="border border-black p-3 text-left">Deskripsi Tagihan</th>
            <th className="border border-black p-3 text-right">Nominal (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {tunggakan.map((t, i) => (
            <tr key={t.id}>
              <td className="border border-black p-3 text-center">{i + 1}</td>
              <td className="border border-black p-3 text-left">{t.nama}</td>
              <td className="border border-black p-3 text-right">{t.nominal.toLocaleString('id-ID')}</td>
            </tr>
          ))}
          {tunggakan.length === 0 && (
            <tr>
              <td colSpan="3" className="border border-black p-4 text-center font-bold text-gray-500 italic">
                Tidak ada tanggungan (Lunas)
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}