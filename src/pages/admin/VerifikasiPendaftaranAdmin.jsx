import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Search, Loader2, FileText } from 'lucide-react';

export default function VerifikasiPendaftaranAdmin() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [selectedReg, setSelectedReg] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/registrations?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(res.data.data);
    } catch {
      toast.error('Gagal memuat data pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const openBerkas = (url) => {
    if (!url) return;

    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch {
        toast.error("Gagal membuka file. Format tidak didukung.");
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleAccept = async (id) => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/registrations/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pendaftaran berhasil disetujui');
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui pendaftaran');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/registrations/${selectedReg.id}/reject`, {
        alasan: rejectReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Pendaftaran ditolak');
      setIsRejectOpen(false);
      setRejectReason('');
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menolak pendaftaran');
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredData = registrations.filter(reg => 
    reg.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    reg.nisn.includes(search)
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-sora-navy mb-2">Verifikasi PPDB</h1>
        <p className="text-sora-gray text-sm">Kelola dan verifikasi pendaftaran calon siswa baru.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NISN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-sora-blue/20 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-sora-gray font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Jurusan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    Tidak ada pendaftaran pending saat ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-sora-navy">{reg.nama_lengkap}</td>
                    <td className="px-6 py-4 text-sora-gray">{reg.nisn}</td>
                    <td className="px-6 py-4 text-sora-gray">{reg.jurusan}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedReg(reg);
                            setIsDetailOpen(true);
                          }}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleAccept(reg.id)}
                          disabled={isActionLoading}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Terima Pendaftaran"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedReg(reg);
                            setIsRejectOpen(true);
                          }}
                          disabled={isActionLoading}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Tolak Pendaftaran"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && selectedReg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-black text-sora-navy">Detail Pendaftaran</h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Nama Lengkap</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">NISN</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.nisn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email Beasiswa</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.email_beasiswa || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jurusan</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.jurusan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">No HP Siswa</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.no_hp || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Alamat Lengkap</p>
                  <p className="font-semibold text-sora-navy">{selectedReg.alamat || '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-sora-navy mb-4">Data Orang Tua</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Nama Orang Tua</p>
                    <p className="font-semibold text-sora-navy">{selectedReg.nama_orang_tua}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">No HP Orang Tua</p>
                    <p className="font-semibold text-sora-navy">{selectedReg.hp_orang_tua || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Email Orang Tua</p>
                    <p className="font-semibold text-sora-navy">{selectedReg.email_orang_tua || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedReg.berkas_url && selectedReg.berkas_url.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-sora-navy mb-4">Berkas Pendukung</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReg.berkas_url.map((url, idx) => (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => openBerkas(url)}
                        className="w-full text-left flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-sora-blue transition-colors group"
                      >
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                          <FileText size={20} className="text-sora-blue" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-sora-blue">Lihat Berkas {idx + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isRejectOpen && selectedReg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-sora-navy">Tolak Pendaftaran</h2>
            </div>
            <form onSubmit={handleReject} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-sora-navy mb-2">Alasan Penolakan</label>
                <textarea 
                  required
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masukkan alasan pendaftaran ditolak (wajib)..."
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all resize-none text-sm font-medium"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRejectOpen(false);
                    setRejectReason('');
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}