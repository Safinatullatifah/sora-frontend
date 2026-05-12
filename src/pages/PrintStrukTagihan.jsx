import { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintStrukTagihan() {
  const [strukData, setStrukData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('printStrukTagihanData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setStrukData(parsed);
        } catch {
          console.error("Error parsing struk data");
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Mempersiapkan struk pembayaran...
      </div>
    );
  }

  if (!strukData) {
    return (
      <div className="p-10 text-center font-bold text-gray-500 max-w-md mx-auto">
        <p className="mb-4">Data struk tidak ditemukan</p>
        <p className="text-sm text-gray-400 mb-6">Kemungkinan:</p>
        <ul className="text-left text-sm text-gray-400 mb-6 space-y-2">
          <li>• Tab dibuka terlalu cepat sebelum data selesai dikirim</li>
          <li>• Silakan kembali ke halaman tagihan dan coba lagi</li>
        </ul>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-sora-blue text-white rounded-lg hover:bg-sora-navy"
        >
          Tutup Tab
        </button>
      </div>
    );
  }

  if (!strukData.namaSiswa || strukData.namaSiswa === 'Siswa') {
    console.log('Struk data:', strukData);
    return (
      <div className="p-10 text-center font-bold text-gray-500 max-w-md mx-auto">
        <p className="mb-4">Data siswa tidak lengkap</p>
        <p className="text-sm text-gray-400 mb-6">Silakan:</p>
        <ul className="text-left text-sm text-gray-400 mb-6 space-y-2">
          <li>1. Kembali ke halaman tagihan</li>
          <li>2. Refresh halaman (F5)</li>
          <li>3. Coba lagi klik struk</li>
        </ul>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-sora-blue text-white rounded-lg hover:bg-sora-navy"
        >
          Tutup Tab
        </button>
      </div>
    );
  }

  const generateStrukNumber = () => {
    return `STK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  return (
    <div className="bg-white text-black p-10 font-sans max-w-2xl mx-auto relative">
      <div className="mb-10 flex justify-end items-center gap-3 print:hidden bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-sora-navy hover:bg-gray-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={16} />
          {' '}
          Tutup Tab
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sora-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sora-navy shadow-md transition-all"
        >
          <Printer size={16} />
          {' '}
          Cetak Struk
        </button>
      </div>

      <div className="border-b-4 border-black pb-6 mb-8 text-center">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-3xl rounded-full mx-auto mb-4">
          S
        </div>
        <h1 className="text-2xl font-black uppercase tracking-widest">
          SMK SORA Digitalization
        </h1>
        <p className="text-xs mt-1">
          Jl. Teknologi Masa Depan No. 99, Surabaya, Jawa Timur
        </p>
        <p className="text-xs">
          Telp: (031) 123456 | Email: info@soraschool.com
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-lg font-bold uppercase">Struk Pembayaran</h2>
        <div className="border-t-2 border-b-2 border-black my-4 py-4">
          <p className="text-xs font-bold">No. Struk: {generateStrukNumber()}</p>
          <p className="text-xs">
            Tanggal: {strukData.tanggal}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-600">NAMA SISWA</p>
            <p className="text-sm font-black">{strukData.namaSiswa}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">NISN</p>
            <p className="text-sm font-black">{strukData.nisn}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">KELAS</p>
            <p className="text-sm font-black">{strukData.kelas}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600">KATEGORI</p>
            <p className="text-sm font-black">{strukData.kategori}</p>
          </div>
        </div>

        <div className="border-t-2 border-black pt-4">
          <p className="text-xs font-bold text-gray-600 mb-2">DESKRIPSI PEMBAYARAN</p>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold">{strukData.namaTagihan}</p>
            <p className="text-sm font-black">
              Rp
              {' '}
              {strukData.nominal.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="border-t-2 border-black pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold">TOTAL PEMBAYARAN</p>
              <p className="text-lg font-black">
                Rp
                {' '}
                {strukData.nominal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black text-center text-xs">
        <p className="font-bold mb-4">Pembayaran telah diterima dan diproses</p>
        <p className="text-gray-600 mb-8">
          Simpan struk ini sebagai bukti pembayaran Anda
        </p>
        <p className="text-gray-500 text-[10px]">
          Dicetak pada:
          {' '}
          {new Date().toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}
