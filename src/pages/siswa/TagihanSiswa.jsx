import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useSiswa } from '../../context/SiswaContext';
import { Layers, FileText, X, CreditCard, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function TagihanSiswa() {
  const { profil, tagihan, fetchTagihanData, totalNunggak } = useSiswa();
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [isModalPaketOpen, setIsModalPaketOpen] = useState(false);
  const [isPaymentOptionOpen, setIsPaymentOptionOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [isManualUpload, setIsManualUpload] = useState(false);
  const [fileBase64, setFileBase64] = useState(null);
  const [uploadingManual, setUploadingManual] = useState(false);
  const [loadingStruk, setLoadingStruk] = useState(false);

  useEffect(() => {
    fetchTagihanData();
  }, [fetchTagihanData]);

  useEffect(() => {
    if (profil) {
      console.log('Profil siswa:', profil);
    }
  }, [profil]);

  const filteredTagihan = useMemo(() => {
    if (kategoriAktif === 'Semua') return tagihan;
    if (kategoriAktif === 'Belum Bayar') return tagihan.filter(t => t.status !== 'Lunas');
    if (kategoriAktif === 'Riwayat Lunas') return tagihan.filter(t => t.status === 'Lunas');
    
    const dbKat = kategoriAktif === 'Dana Ujian' ? 'DU' : kategoriAktif.toUpperCase();
    return tagihan.filter(t => t.kategori?.toUpperCase() === dbKat || t.kategori === kategoriAktif);
  }, [tagihan, kategoriAktif]);

  const openPaymentModal = (t) => {
    setSelectedTagihan(t);
    setIsPaymentOptionOpen(true);
    setIsManualUpload(false);
    setFileBase64(null);
  };

  const handlePayMidtrans = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/invoices/${selectedTagihan.id}/pay`, 
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const snapToken = response.data.data?.token || response.data.token;

      if (!snapToken) {
        toast.error("Gagal mendapatkan token pembayaran dari server.");
        return;
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran Sukses!");
            fetchTagihanData();
          },
          onPending: () => {
            toast.info("Silakan selesaikan pembayaranmu di ATM/Aplikasi.");
            fetchTagihanData();
          },
          onError: () => {
            toast.error("Pembayaran gagal diproses.");
          },
          onClose: () => {
            toast.warning("Jendela pembayaran ditutup sebelum selesai.");
            fetchTagihanData();
          }
        });
      } else {
        toast.error("Sistem Midtrans belum terinisialisasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghubungi server pembayaran.");
    }
  };

  const handlePayPaket = async (paketType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/invoices/paket`,
        { paket: paketType },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const snapToken = response.data.data?.token || response.data.token;

      if (!snapToken) {
        toast.error("Gagal mendapatkan token pembayaran dari server.");
        return;
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            toast.success("Pembayaran Paket Sukses!");
            setIsModalPaketOpen(false);
            fetchTagihanData();
          },
          onPending: () => {
            toast.info("Silakan selesaikan pembayaranmu.");
            setIsModalPaketOpen(false);
            fetchTagihanData();
          },
          onError: () => {
            toast.error("Pembayaran gagal diproses.");
          },
          onClose: () => {
            toast.warning("Jendela pembayaran ditutup sebelum selesai.");
            fetchTagihanData();
          }
        });
      } else {
        toast.error("Sistem Midtrans belum terinisialisasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghubungi server pembayaran.");
    }
  };

  const handleFileManualChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setFileBase64(reader.result);
      reader.onerror = () => toast.error("Gagal membaca file");
    }
  };

  const submitManualPayment = async () => {
    setUploadingManual(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/invoices/${selectedTagihan.id}/manual-pay`, 
        { bukti_transfer_url: fileBase64 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success("Berhasil", { description: "Bukti transfer berhasil dikirim. Menunggu verifikasi Admin." });
      setIsPaymentOptionOpen(false);
      fetchTagihanData();
    } catch (error) {
      toast.error("Gagal mengirim bukti", { description: error.response?.data?.message || "Terjadi kesalahan sistem." });
    } finally {
      setUploadingManual(false);
    }
  };

  const handleCetakStruk = (item) => {
    if (!profil) {
      toast.error("Data siswa sedang dimuat, tunggu sebentar.");
      return;
    }

    const dataStruk = {
      namaSiswa: profil?.nama_lengkap || profil?.nama || 'Siswa',
      nisn: profil?.nisn || '-',
      kelas: profil?.kelas || '-',
      namaTagihan: item.nama,
      kategori: item.kategori === 'DU' ? 'Dana Ujian' : item.kategori,
      nominal: item.nominal,
      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    localStorage.setItem('printStrukTagihanData', JSON.stringify(dataStruk));
    window.open('/print-struk-tagihan', '_blank');
    setLoadingStruk(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div className="w-full md:w-auto">
          <h3 className="text-xl md:text-2xl font-black text-sora-navy tracking-tight">Rincian Keuangan</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">Pantau dan bayar tagihan sekolah Anda di sini.</p>
        </div>
        <div className="flex flex-row md:flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none shadow-sm md:shadow-none">
          <button onClick={() => setIsModalPaketOpen(true)} className="bg-sora-navy text-white px-4 md:px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
            <Layers size={14}/> Bayar Paket
          </button>
          <div className="hidden md:block w-px h-10 bg-gray-200"></div>
          <div className="text-right">
            <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest">Total Tunggakan</p>
            <p className="text-lg md:text-2xl font-black text-red-500">Rp {totalNunggak.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border shadow-sm custom-scrollbar pb-2">
        {['Semua', 'Belum Bayar', 'Riwayat Lunas', 'SPP', 'Dana Ujian', 'Buku', 'Seragam'].map(kat => (
          <button key={kat} onClick={() => setKategoriAktif(kat)} className={`px-5 md:px-6 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${kategoriAktif === kat ? 'bg-sora-navy text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-sora-navy'}`}>
            {kat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
              <tr>
                <th className="p-4 md:p-6 min-w-[200px]">Detail Tagihan</th>
                <th className="p-4 md:p-6 min-w-[120px]">Tenggat Waktu</th>
                <th className="p-4 md:p-6 min-w-[120px]">Nominal</th>
                <th className="p-4 md:p-6 min-w-[120px]">Status</th>
                <th className="p-4 md:p-6 text-center min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTagihan.length === 0 ? <tr><td colSpan="5" className="text-center p-10 text-gray-400 font-bold italic text-sm">Tidak ada tagihan dalam kategori ini.</td></tr> : null}
              {filteredTagihan.map(t => (
                <tr key={t.id} className={`border-b border-gray-50 transition-all ${t.status === 'Lunas' ? 'bg-gray-50/50 opacity-80 hover:opacity-100' : 'hover:bg-sora-bg/50'}`}>
                  <td className="p-4 md:p-6">
                    <p className="text-sm font-black text-sora-navy">{t.nama}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.id}</span>
                      <span className="text-[9px] font-black text-sora-blue bg-blue-50 px-2 rounded uppercase">{t.kategori === 'DU' ? 'Dana Ujian' : t.kategori}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-xs font-bold text-gray-500">{t.tglBatas}</td>
                  <td className="p-4 md:p-6 text-sm font-black text-sora-navy">Rp {t.nominal.toLocaleString('id-ID')}</td>
                  <td className="p-4 md:p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.status === 'Lunas' ? 'bg-sora-green/10 text-sora-green' : t.status === 'Menunggu Konfirmasi' ? 'bg-orange-100 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-center">
                    {t.status === 'Belum Bayar' ? (
                      <button onClick={() => openPaymentModal(t)} className="w-full bg-sora-blue text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-navy transition-all shadow-md shadow-sora-blue/20">Bayar</button>
                    ) : t.status === 'Lunas' ? (
                      <button onClick={() => handleCetakStruk(t)} disabled={loadingStruk} className="w-full bg-white border border-gray-200 text-sora-navy px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-sora-blue transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><FileText size={12}/> {loadingStruk ? 'Memproses...' : 'Struk'}</button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold italic">Diproses...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isPaymentOptionOpen} onOpenChange={setIsPaymentOptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
          </DialogHeader>

          {!isManualUpload ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div
                className="border border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-sora-blue hover:bg-blue-50 transition-all group"
                onClick={() => {
                  setIsPaymentOptionOpen(false);
                  handlePayMidtrans();
                }}
              >
                <div className="bg-sora-blue text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <CreditCard />
                </div>
                <h4 className="font-black text-sora-navy mb-1">Otomatis</h4>
                <p className="text-xs font-medium text-gray-500">Virtual Account, QRIS, Alfamart</p>
              </div>

              <div
                className="border border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-sora-green hover:bg-green-50 transition-all group"
                onClick={() => setIsManualUpload(true)}
              >
                <div className="bg-sora-green text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <UploadCloud />
                </div>
                <h4 className="font-black text-sora-navy mb-1">Transfer Manual</h4>
                <p className="text-xs font-medium text-gray-500">Upload bukti struk transfer</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-black text-sora-navy mb-2">Instruksi Transfer:</p>
                <ul className="text-xs font-medium text-gray-500 list-disc ml-4 space-y-1">
                  <li>Bank BCA: <strong>1234567890</strong> a.n SORA Foundation</li>
                  <li>Bank Mandiri: <strong>0987654321</strong> a.n SORA Foundation</li>
                  <li>Total Tagihan: <strong className="text-sora-navy">Rp {selectedTagihan?.nominal?.toLocaleString('id-ID')}</strong></li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Label>Upload Bukti Transfer</Label>
                <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileManualChange} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsManualUpload(false)}>Kembali</Button>
                <Button disabled={!fileBase64 || uploadingManual} onClick={submitManualPayment} className="bg-sora-green hover:bg-sora-green/80 text-white">
                  {uploadingManual ? 'Mengunggah...' : 'Kirim Bukti'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isModalPaketOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => setIsModalPaketOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-[110] p-6 md:p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-sora-navy">Paket Pelunasan SPP</h3>
                <p className="text-[10px] font-bold text-sora-gray uppercase tracking-widest mt-1">Bayar Praktis, Bebas Denda</p>
              </div>
              <button onClick={() => setIsModalPaketOpen(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-sora-blue transition-all group">
                <div className="mb-3 md:mb-0">
                  <p className="font-black text-sora-navy group-hover:text-sora-blue transition-colors">1 Semester (6 Bulan)</p>
                  <p className="text-xs text-gray-500 font-bold">6 x Rp 250.000</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-blue mb-2 text-lg">Rp 1.500.000</p>
                  <button onClick={() => handlePayPaket('SEMESTER')} className="w-full md:w-auto bg-sora-bg text-sora-blue border border-sora-blue/20 px-5 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue hover:text-white transition-all">Pilih Paket</button>
                </div>
              </div>
              <div className="border border-gray-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-sora-blue transition-all group">
                <div className="mb-3 md:mb-0">
                  <p className="font-black text-sora-navy group-hover:text-sora-blue transition-colors">1 Tahun (12 Bulan)</p>
                  <p className="text-xs text-gray-500 font-bold">12 x Rp 250.000</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-blue mb-2 text-lg">Rp 3.000.000</p>
                  <button onClick={() => handlePayPaket('TAHUN')} className="w-full md:w-auto bg-sora-bg text-sora-blue border border-sora-blue/20 px-5 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue hover:text-white transition-all">Pilih Paket</button>
                </div>
              </div>
              <div className="border border-sora-green bg-sora-green/5 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden mt-6 md:mt-4">
                <div className="absolute top-0 right-0 bg-sora-green text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">Paling Hemat</div>
                <div className="mb-3 md:mb-0 mt-2 md:mt-0">
                  <p className="font-black text-sora-green">Lunas Sampai Lulus</p>
                  <p className="text-xs text-gray-500 font-bold">36 Bulan Pembelajaran</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-green mb-2 text-lg">Rp 9.000.000</p>
                  <button onClick={() => handlePayPaket('LULUS')} className="w-full md:w-auto bg-sora-green text-white px-5 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all">Pilih Paket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}