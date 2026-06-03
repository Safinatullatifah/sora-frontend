import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Wallet, Loader2, X, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifikasiPembayaranAdmin() {
  const [tagihan, setTagihan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [isModalManualOpen, setIsModalManualOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    metode: 'CASH'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTagihan(res.data.data || []);
    } catch {
      toast.error("Gagal memuat data pembayaran.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTagihan = useMemo(() => {
    return tagihan.filter(item => {
      const namaSiswa = item.student?.nama_lengkap?.toLowerCase() || '';
      const nisn = item.student?.nisn || '';
      const namaTagihan = item.judul_tagihan?.toLowerCase() || '';
      
      const matchSearch = namaSiswa.includes(searchTerm.toLowerCase()) || 
                          nisn.includes(searchTerm) ||
                          namaTagihan.includes(searchTerm.toLowerCase());
                          
      const itemStatusUI = item.status === 'PAID' ? 'Lunas' : item.status === 'PENDING' ? 'Belum Bayar' : item.status;
      const matchStatus = filterStatus === 'Semua' ? true : itemStatusUI === filterStatus;
      
      return matchSearch && matchStatus;
    });
  }, [tagihan, searchTerm, filterStatus]);

  const openManualModal = (item) => {
    setSelectedTagihan(item);
    setManualForm({ metode: 'CASH' });
    setIsModalManualOpen(true);
  };

  const handleInputManual = async (e) => {
    e.preventDefault();
    if (!selectedTagihan) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/invoices/${selectedTagihan.id}/admin-pay`, 
        { metode_bayar: manualForm.metode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Pembayaran ${selectedTagihan.student?.nama_lengkap} berhasil diinput manual!`);
      setIsModalManualOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menginput pembayaran manual.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-sora-navy tracking-tight">Kelola Pembayaran</h2>
          <p className="text-sm font-bold text-gray-400 mt-1">Input pembayaran manual siswa secara langsung.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {['Semua', 'Belum Bayar', 'Lunas'].map(stat => (
            <button
              key={stat}
              onClick={() => setFilterStatus(stat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === stat ? 'bg-sora-navy text-white shadow-md' : 'text-gray-400 hover:text-sora-navy'}`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, atau tagihan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-sora-navy focus:ring-2 focus:ring-sora-blue/20 transition-all outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-6">Data Siswa</th>
                <th className="p-6">Detail Tagihan</th>
                <th className="p-6 text-right">Nominal</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <Loader2 className="animate-spin text-sora-blue mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredTagihan.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-10 text-gray-400 font-bold italic text-sm">
                    Tidak ada data pembayaran ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTagihan.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-sora-bg/50 transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-black text-sora-navy">{item.student?.nama_lengkap}</p>
                      <p className="text-[10px] font-bold text-gray-400 tracking-widest">{item.student?.nisn} • {item.student?.kelas}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-gray-700">{item.judul_tagihan}</p>
                      <span className="text-[9px] font-black text-sora-blue bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-widest">
                        {item.jenis_tagihan === 'DU' ? 'Dana Ujian' : item.jenis_tagihan}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <p className="text-sm font-black text-sora-navy">Rp {item.nominal.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'PAID' ? 'bg-sora-green/10 text-sora-green' : 
                        'bg-red-50 text-red-500'
                      }`}>
                        {item.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === 'PENDING' ? (
                          <button onClick={() => openManualModal(item)} className="bg-sora-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue transition-all shadow-md shadow-sora-navy/20 flex items-center gap-2">
                            <Wallet size={14} /> Input Manual
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold italic">Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalManualOpen && selectedTagihan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalManualOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-[110] p-8 md:p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-sora-navy">Input Pembayaran Manual</h3>
                <p className="text-[10px] font-bold text-sora-gray uppercase tracking-widest mt-1">Terima Uang Tunai / Transfer Langsung</p>
              </div>
              <button onClick={() => !isSubmitting && setIsModalManualOpen(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleInputManual} className="space-y-6">
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Siswa</span>
                  <span className="text-sm font-black text-sora-navy">{selectedTagihan.student?.nama_lengkap}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tagihan</span>
                  <span className="text-sm font-black text-sora-navy">{selectedTagihan.judul_tagihan}</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nominal</span>
                  <span className="text-lg font-black text-sora-blue">Rp {selectedTagihan.nominal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-sora-navy uppercase tracking-widest mb-2">Metode Penerimaan</label>
                <select
                  value={manualForm.metode}
                  onChange={(e) => setManualForm({ ...manualForm, metode: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-sora-navy focus:ring-2 focus:ring-sora-blue/20 outline-none transition-all appearance-none"
                  required
                >
                  <option value="CASH">Uang Tunai (Cash di TU)</option>
                  <option value="TRANSFER_BANK">Transfer Bank Langsung</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-sora-blue text-white px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sora-navy transition-all shadow-lg shadow-sora-blue/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                {isSubmitting ? 'Memproses...' : 'Konfirmasi & Lunasi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}