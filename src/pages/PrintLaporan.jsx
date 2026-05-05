import { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintLaporan() {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('printLaporanData');
    if (savedData) {
      setReportData(JSON.parse(savedData));
    }
  }, []);

  if (!reportData) {
    return <div className="p-10 text-center font-bold text-gray-500">Memuat data laporan...</div>;
  }

  return (
    <div className="bg-white text-black p-10 font-sans max-w-4xl mx-auto relative">
      
      {/* TOMBOL KONTROL */}
      <div className="mb-10 flex justify-end items-center gap-3 print:hidden bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
         <button onClick={() => window.close()} className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-sora-navy hover:bg-gray-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
            <ArrowLeft size={16}/> Tutup Tab
         </button>
         <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sora-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sora-navy shadow-md transition-all">
            <Printer size={16}/> Cetak Laporan
         </button>
      </div>

      {/* KOP SURAT */}
      <div className="border-b-4 border-black pb-6 mb-8 text-center flex items-center justify-center gap-6">
        <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-black text-4xl rounded-full print-exact">
          S
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest">SMK SORA Digitalization</h1>
          <p className="text-sm">Jl. Teknologi Masa Depan No. 99, Surabaya, Jawa Timur</p>
          <p className="text-sm">Telp: (031) 123456 | Email: info@soraschool.com</p>
        </div>
      </div>

      {/* JUDUL LAPORAN */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold underline uppercase">Laporan Keuangan Harian</h2>
        <p className="text-sm mt-1">Periode Cetak: {reportData.tanggal}</p>
      </div>

      {/* RINGKASAN TOTAL */}
      <div className="mb-8 p-5 bg-gray-100 border border-black rounded-lg print-exact">
        <h3 className="font-bold uppercase mb-4 underline">A. Ringkasan Kas Sistem</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border-r border-black">
                <p className="text-xs font-bold uppercase text-gray-600 mb-1">Total Target Pendapatan</p>
                <p className="text-lg font-black">Rp {reportData.rekap.totalTagihan.toLocaleString('id-ID')}</p>
            </div>
            <div className="border-r border-black">
                <p className="text-xs font-bold uppercase text-gray-600 mb-1">Kas Masuk (Lunas)</p>
                <p className="text-lg font-black text-green-700">Rp {reportData.rekap.totalLunas.toLocaleString('id-ID')}</p>
            </div>
            <div>
                <p className="text-xs font-bold uppercase text-gray-600 mb-1">Sisa Tunggakan</p>
                <p className="text-lg font-black text-red-600">Rp {reportData.rekap.totalNunggak.toLocaleString('id-ID')}</p>
            </div>
        </div>
      </div>

      {/* TABEL RINCIAN SISWA */}
      <h3 className="font-bold uppercase mb-4 underline">B. Rincian per Siswa Aktif</h3>
      <table className="w-full border-collapse border border-black mb-16 text-sm">
        <thead>
          <tr className="bg-gray-100 print-exact">
            <th className="border border-black p-3 text-left">Nama Siswa</th>
            <th className="border border-black p-3 text-center">Kelas</th>
            <th className="border border-black p-3 text-right">Telah Dibayar (Rp)</th>
            <th className="border border-black p-3 text-right">Tunggakan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {reportData.detail.length === 0 ? (
            <tr><td colSpan="4" className="border border-black p-4 text-center italic">Belum ada data transaksi tercatat.</td></tr>
          ) : (
            reportData.detail.map((s, index) => (
              <tr key={index}>
                <td className="border border-black p-3 font-bold">{s.nama} <br/><span className="font-normal text-xs text-gray-500">{s.nisn}</span></td>
                <td className="border border-black p-3 text-center">{s.kelas}</td>
                <td className="border border-black p-3 text-right">{s.lunas > 0 ? s.lunas.toLocaleString('id-ID') : '-'}</td>
                <td className="border border-black p-3 text-right text-red-600">{s.nunggak > 0 ? s.nunggak.toLocaleString('id-ID') : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <div className="flex justify-between items-end mt-10">
        <div className="text-center w-64">
          <p className="mb-20">Mengetahui,<br/>Kepala Sekolah,</p>
          <p className="font-bold underline">Bpk. Ir. Teknologi, M.Kom.</p>
          <p className="text-sm">NIP. 19800101 2010 01</p>
        </div>
        <div className="text-center w-64">
          <p className="mb-20">Surabaya, {reportData.tanggal}<br/>Kepala Tata Usaha,</p>
          <p className="font-bold underline">Fina Khoirunnisa, S.Kom.</p>
          <p className="text-sm">NIP. 19900817 2026 01</p>
        </div>
      </div>
      
    </div>
  );
}