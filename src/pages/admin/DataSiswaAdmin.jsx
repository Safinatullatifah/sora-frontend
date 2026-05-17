import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, Eye, Edit3, Trash2, Plus, Receipt, X, Printer, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DataSiswaAdmin() {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [masterData, setMasterData] = useState({ majors: [], grades: [], years: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterStatusSiswa, setFilterStatusSiswa] = useState('Semua');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [selectedSiswa, setSelectedSiswa] = useState(null); 
  const [formSiswa, setFormSiswa] = useState({ 
    id: null, nisn: '', nama: '', kelas: '', jurusan: '', angkatan: '', 
    email: '', no_hp: '', alamat: '', nama_ortu: '', email_ortu: '', no_hp_ortu: '', statusSiswa: 'Aktif' 
  });
  const [isModalSiswaOpen, setIsModalSiswaOpen] = useState(false);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState('massal');
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [formInvoice, setFormInvoice] = useState({
    targetKelas: 'Semua',
    student_id: '',
    judul_tagihan: '',
    jenis_tagihan: 'SPP',
    nominal: '',
    bulan: '',
    tahun: new Date().getFullYear().toString(),
    tanggal_jatuh_tempo: ''
  });

  const [dataPrintStruk, setDataPrintStruk] = useState(null);
  const [dataPrintTanggungan, setDataPrintTanggungan] = useState(null);
  const [isResetting, setIsResetting] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', desc: '', action: null });

  const getAuthHeaders = useCallback(() => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/master`, getAuthHeaders());
      setMasterData({
        majors: res.data.data.majors,
        grades: res.data.data.grades,
        years: res.data.data.years
      });
    } catch {
      toast.error("Gagal memuat master data");
    }
  }, [getAuthHeaders]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/students`, {
        params: { page: currentPage, limit: itemsPerPage, search: searchQuery },
        ...getAuthHeaders()
      });
      
      const mappedData = response.data.data.map(item => ({
        id: item.id,
        nisn: item.nisn,
        nama: item.nama_lengkap,
        kelas: item.kelas,
        jurusan: item.jurusan || '',
        angkatan: item.angkatan || '',
        email: item.user?.email || '',
        no_hp: item.no_hp || '',
        alamat: item.alamat || item.orang_tua?.alamat || '',
        nama_ortu: item.orang_tua?.nama_lengkap || '',
        email_ortu: item.orang_tua?.email || '',
        no_hp_ortu: item.orang_tua?.no_hp || '',
        statusSiswa: item.status === 'AKTIF' ? 'Aktif' : 'Keluar',
        tagihan: item.invoices ? item.invoices.map(inv => ({
          id: inv.id,
          nama: inv.judul_tagihan,
          kategori: inv.jenis_tagihan,
          nominal: inv.nominal,
          status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar'
        })) : []
      }));
      
      setDataSiswa(mappedData);
      setTotalPages(response.data.meta.total_pages);
    } catch {
      toast.error("Gagal memuat data siswa");
    }
  }, [currentPage, itemsPerPage, searchQuery, getAuthHeaders]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchStudents]);

  const kelasTersedia = useMemo(() => {
    if (!formSiswa.jurusan) return []; 
    return masterData.grades.filter(g => 
      g.name.toUpperCase().includes(formSiswa.jurusan.toUpperCase())
    );
  }, [masterData.grades, formSiswa.jurusan]);

  const handleSelectSiswa = async (siswa) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students/${siswa.id}`, getAuthHeaders());
      const item = res.data.data;
      setSelectedSiswa({
        id: item.id,
        nisn: item.nisn,
        nama: item.nama_lengkap,
        kelas: item.kelas,
        jurusan: item.jurusan || '',
        angkatan: item.angkatan || '',
        email: item.user?.email || '',
        no_hp: item.no_hp || '',
        alamat: item.alamat || item.orang_tua?.alamat || '',
        nama_ortu: item.orang_tua?.nama_lengkap || '',
        email_ortu: item.orang_tua?.email || '',
        no_hp_ortu: item.orang_tua?.no_hp || '',
        statusSiswa: item.status === 'AKTIF' ? 'Aktif' : 'Keluar',
        tagihan: item.invoices ? item.invoices.map(inv => ({
          id: inv.id,
          nama: inv.judul_tagihan,
          kategori: inv.jenis_tagihan,
          nominal: inv.nominal,
          status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar'
        })) : []
      });
      if (window.innerWidth < 1024) {
        setTimeout(() => document.getElementById('detail-siswa-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {
      toast.error("Gagal mengambil detail siswa");
    }
  };

  const handleSaveSiswa = async () => {
    if (!formSiswa.nisn || !formSiswa.nama || !formSiswa.kelas || !formSiswa.jurusan || !formSiswa.angkatan || !formSiswa.email) {
      toast.error("Validasi Gagal", { description: "Harap lengkapi semua data wajib siswa (Email, Angkatan, Jurusan, Kelas)." });
      return;
    }

    try {
      if (formSiswa.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/students/${formSiswa.id}`, {
          nisn: formSiswa.nisn,
          nama_lengkap: formSiswa.nama,
          kelas: formSiswa.kelas,
          jurusan: formSiswa.jurusan,
          angkatan: formSiswa.angkatan,
          email: formSiswa.email,
          no_hp: formSiswa.no_hp,
          alamat: formSiswa.alamat,
          nama_ortu: formSiswa.nama_ortu,
          email_orang_tua: formSiswa.email_ortu,
          no_hp_ortu: formSiswa.no_hp_ortu
        }, getAuthHeaders());
        toast.success("Data siswa berhasil diperbarui");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
          email: formSiswa.email,
          password: 'password123',
          nisn: formSiswa.nisn,
          nama_lengkap: formSiswa.nama,
          kelas: formSiswa.kelas,
          jurusan: formSiswa.jurusan,
          angkatan: formSiswa.angkatan,
          no_hp: formSiswa.no_hp,
          alamat: formSiswa.alamat,
          nama_orang_tua: formSiswa.nama_ortu,
          email_orang_tua: formSiswa.email_ortu,
          hp_orang_tua: formSiswa.no_hp_ortu
        });
        toast.success("Siswa baru berhasil ditambahkan");
      }
      setIsModalSiswaOpen(false);
      fetchStudents();
      if (selectedSiswa?.id === formSiswa.id) handleSelectSiswa(formSiswa);
    } catch (error) {
      toast.error("Gagal menyimpan data", { description: error.response?.data?.message || "Terjadi kesalahan sistem" });
    }
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/students/${id}`, getAuthHeaders());
      toast.success("Siswa berhasil dihapus dari sistem");
      if (selectedSiswa?.id === id) setSelectedSiswa(null);
      fetchStudents();
    } catch {
      toast.error("Gagal menghapus siswa");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleDeleteSiswa = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Data Siswa",
      desc: "Apakah Anda yakin ingin menghapus siswa ini secara permanen? Data yang telah dihapus tidak dapat dikembalikan.",
      action: () => executeDelete(id)
    });
  };

  const openModalSiswa = (siswa = null) => {
    if (siswa) {
      setFormSiswa({ ...siswa });
    } else {
      setFormSiswa({ 
        id: null, nisn: '', nama: '', kelas: '', jurusan: '', angkatan: '', 
        email: '', no_hp: '', alamat: '', nama_ortu: '', email_ortu: '', no_hp_ortu: '', statusSiswa: 'Aktif' 
      });
    }
    setIsModalSiswaOpen(true);
  };

  const handleInvoiceChange = (e) => {
    setFormInvoice({ ...formInvoice, [e.target.name]: e.target.value });
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!formInvoice.judul_tagihan || !formInvoice.nominal || !formInvoice.tanggal_jatuh_tempo) {
      toast.error("Validasi Gagal", { description: "Judul tagihan, nominal, dan batas pembayaran wajib diisi!" });
      return;
    }
    setIsSubmittingInvoice(true);
    
    // Ubah format tanggal (YYYY-MM-DD) menjadi ISO-8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
    const isoDate = new Date(formInvoice.tanggal_jatuh_tempo).toISOString();

    try {
      if (invoiceMode === 'massal') {
        await axios.post(`${import.meta.env.VITE_API_URL}/invoices/massal/create`, {
          targetKelas: formInvoice.targetKelas,
          judul_tagihan: formInvoice.judul_tagihan,
          jenis_tagihan: formInvoice.jenis_tagihan,
          nominal: parseInt(formInvoice.nominal, 10),
          bulan: formInvoice.bulan,
          tahun: parseInt(formInvoice.tahun, 10),
          tanggal_jatuh_tempo: isoDate
        }, getAuthHeaders());
        toast.success("Tagihan massal berhasil diterbitkan");
      } else {
        if (!formInvoice.student_id) {
          toast.error("Validasi Gagal", { description: "Pilih siswa terlebih dahulu!" });
          setIsSubmittingInvoice(false);
          return;
        }
        await axios.post(`${import.meta.env.VITE_API_URL}/invoices`, {
          student_id: formInvoice.student_id,
          judul_tagihan: formInvoice.judul_tagihan,
          jenis_tagihan: formInvoice.jenis_tagihan,
          nominal: parseInt(formInvoice.nominal, 10),
          bulan: formInvoice.bulan,
          tahun: parseInt(formInvoice.tahun, 10),
          tanggal_jatuh_tempo: isoDate
        }, getAuthHeaders());
        toast.success("Tagihan individu berhasil diterbitkan");
      }
      setIsInvoiceModalOpen(false);
      setFormInvoice({
        ...formInvoice,
        judul_tagihan: '',
        nominal: '',
        bulan: '',
        tanggal_jatuh_tempo: ''
      });
      fetchStudents();
      if (selectedSiswa && invoiceMode === 'individu' && formInvoice.student_id === selectedSiswa.id) {
        handleSelectSiswa({ id: selectedSiswa.id });
      }
    } catch (error) {
      toast.error("Gagal membuat tagihan", { description: error.response?.data?.message || "Terjadi kesalahan sistem" });
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  const handleCetakStruk = (siswa, tagihan) => {
    setDataPrintStruk({
      namaSiswa: siswa.nama, nisn: siswa.nisn, kelas: siswa.kelas,
      namaTagihan: tagihan.nama, kategori: tagihan.kategori, nominal: tagihan.nominal,
      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    });
    setTimeout(() => { window.print(); setDataPrintStruk(null); }, 150);
  };

  const handleCetakTanggungan = (siswa) => {
    setDataPrintTanggungan(siswa);
    setTimeout(() => { window.print(); setDataPrintTanggungan(null); }, 150);
  };

  const executeResetPassword = async (id) => {
    setIsResetting(id);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/reset-password-student/${id}`, {}, getAuthHeaders());
      toast.success("Berhasil", { description: "Password berhasil direset ke default (123456)" });
    } catch {
      toast.error("Gagal mereset password siswa.");
    } finally {
      setIsResetting(null);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleResetPassword = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Password",
      desc: "Apakah Anda yakin ingin mereset password akun siswa ini menjadi default (123456)?",
      action: () => executeResetPassword(id)
    });
  };

  const filteredList = useMemo(() => {
    return dataSiswa.filter(s => {
      const isNunggak = s.tagihan.some(t => t.status === 'Belum Bayar');
      return (filterKelas === 'Semua' || s.kelas === filterKelas) && 
             (filterStatus === 'Semua' || (filterStatus === 'Belum Lunas' ? isNunggak : !isNunggak)) &&
             (filterStatusSiswa === 'Semua' || s.statusSiswa === filterStatusSiswa);
    });
  }, [dataSiswa, filterKelas, filterStatus, filterStatusSiswa]);

  if (dataPrintStruk) {
    return (
      <div className="bg-white text-black p-10 min-h-screen font-sans">
        <div className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 p-10 rounded-3xl">
          <div className="flex justify-between items-center border-b-2 border-gray-200 pb-6 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest">SORA Digitalization</h1>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bukti Pembayaran</p>
              <p className="font-bold">{dataPrintStruk.tanggal}</p>
            </div>
          </div>
          <div className="flex justify-center mb-8"><div className="border-4 border-green-600 text-green-600 px-8 py-3 rounded-2xl transform -rotate-12"><span className="text-3xl font-black tracking-widest">LUNAS</span></div></div>
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">Nama</p><p className="font-black">{dataPrintStruk.namaSiswa}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">NISN / Kelas</p><p className="font-black">{dataPrintStruk.nisn} / {dataPrintStruk.kelas}</p></div>
          </div>
          <div className="flex justify-between items-center border-t-2 pt-6">
            <div><p className="text-[10px] font-bold text-gray-500 uppercase">Telah Dibayar Untuk:</p><p className="text-xl font-black">{dataPrintStruk.namaTagihan}</p></div>
            <div className="text-right"><p className="text-[10px] font-bold text-gray-500 uppercase">Total Nominal</p><p className="text-3xl font-black text-green-600">Rp {dataPrintStruk.nominal.toLocaleString('id-ID')}</p></div>
          </div>
        </div>
      </div>
    );
  }

  if (dataPrintTanggungan) {
    const tunggakan = dataPrintTanggungan.tagihan.filter(t => t.status === 'Belum Bayar');
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="bg-white text-black p-10 min-h-screen font-sans max-w-4xl mx-auto">
        <div className="border-b-4 border-black pb-6 mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest">SORA Digitalization</h1>
          <p className="text-sm">Sistem Administrasi Terpadu</p>
        </div>
        <h2 className="text-xl font-bold underline uppercase text-center mb-8">Surat Keterangan Rincian Tanggungan</h2>
        <div className="text-base mb-8">
          <p>Kepala Administrasi menerangkan bahwa:</p>
          <table className="ml-4 mt-2 font-bold"><tbody>
            <tr><td className="w-40">Nama</td><td>: {dataPrintTanggungan.nama}</td></tr>
            <tr><td>NISN / Kelas</td><td>: {dataPrintTanggungan.nisn} / {dataPrintTanggungan.kelas} {dataPrintTanggungan.jurusan}</td></tr>
          </tbody></table>
          <p className="mt-4">Memiliki rincian tanggungan administrasi hingga tanggal <b>{tgl}</b> sebagai berikut:</p>
        </div>
        <table className="w-full border-collapse border border-black mb-16 text-sm">
          <thead><tr className="bg-gray-100"><th className="border border-black p-3 w-12">No</th><th className="border border-black p-3">Deskripsi Tagihan</th><th className="border border-black p-3">Nominal (Rp)</th></tr></thead>
          <tbody>
            {tunggakan.map((t, i) => (<tr key={t.id}><td className="border border-black p-3 text-center">{i+1}</td><td className="border border-black p-3">{t.nama}</td><td className="border border-black p-3 text-right">{t.nominal.toLocaleString('id-ID')}</td></tr>))}
            {tunggakan.length === 0 && <tr><td colSpan="3" className="border border-black p-4 text-center font-bold text-gray-500 italic">Tidak ada tanggungan (Lunas)</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500 print:hidden">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-full md:min-w-[150px] bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
            <Search className="text-gray-400 shrink-0" size={16}/>
            <input type="text" placeholder="Cari Nama/NISN..." className="w-full text-xs outline-none bg-transparent" onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}}/>
          </div>
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            <select value={filterStatusSiswa} onChange={e=>{setFilterStatusSiswa(e.target.value); setCurrentPage(1);}} className="w-full md:w-auto text-[10px] font-bold text-sora-navy bg-sora-bg p-3 md:p-2 rounded-xl md:rounded-lg outline-none border">
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Keluar">Keluar / Lulus</option>
            </select>
            <select value={filterKelas} onChange={e=>{setFilterKelas(e.target.value); setCurrentPage(1);}} className="w-full md:w-auto text-[10px] font-bold text-sora-navy bg-sora-bg p-3 md:p-2 rounded-xl md:rounded-lg outline-none border appearance-none">
              <option value="Semua">Semua Kelas</option>
              {masterData.grades.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setCurrentPage(1);}} className="col-span-2 md:col-span-1 w-full md:w-auto text-[10px] font-bold text-sora-navy bg-sora-bg p-3 md:p-2 rounded-xl md:rounded-lg outline-none border">
              <option value="Semua">Bayar: Semua</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b flex gap-2 justify-between md:justify-end bg-gray-50/50">
            <button onClick={() => setIsInvoiceModalOpen(true)} className="flex-1 md:flex-none justify-center bg-sora-bg border border-sora-blue/20 text-sora-blue px-4 py-3 md:py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sora-blue hover:text-white transition-all shadow-sm md:shadow-none"><Receipt size={14}/> Buat Tagihan</button>
            <button onClick={() => openModalSiswa()} className="flex-1 md:flex-none justify-center bg-sora-blue text-white px-4 py-3 md:py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sora-navy transition-all shadow-lg"><Plus size={14}/> Tambah</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
                <tr>
                  <th className="p-4 md:p-6">Siswa</th>
                  <th className="p-4 md:p-6">Kelas / Angkatan</th>
                  <th className="p-4 md:p-6">Tunggakan</th>
                  <th className="p-4 md:p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(s => {
                  const nunggak = s.tagihan.filter(t => t.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.nominal, 0);
                  return (
                    <tr key={s.id} className={`border-b transition-all ${s.statusSiswa !== 'Aktif' ? 'bg-gray-50/50 opacity-70' : 'hover:bg-sora-bg/30'}`}>
                      <td className="p-4 md:p-6">
                        <p className="font-black text-sora-navy text-sm">{s.nama}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">NISN: {s.nisn}</p>
                      </td>
                      <td className="p-4 md:p-6">
                        <p className="text-xs font-bold text-sora-gray mb-1">{s.kelas} {s.jurusan}</p>
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold mr-2">{s.angkatan || '-'}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.statusSiswa==='Aktif'?'bg-sora-green/10 text-sora-green':'bg-red-50 text-red-500'}`}>{s.statusSiswa}</span>
                      </td>
                      <td className="p-4 md:p-6 text-xs font-black text-red-500">
                        {nunggak > 0 ? `Rp ${nunggak.toLocaleString('id-ID')}` : <span className="text-sora-green">Lunas</span>}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="flex justify-center gap-1 md:gap-2">
                          <button onClick={() => handleResetPassword(s.id)} disabled={isResetting === s.id} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">{isResetting === s.id ? <Loader2 className="animate-spin" size={18}/> : <KeyRound size={18}/>}</button>
                          <button onClick={() => handleSelectSiswa(s)} className="p-2 text-sora-blue hover:bg-sora-blue/10 rounded-lg transition-colors"><Eye size={18}/></button>
                          <button onClick={() => openModalSiswa(s)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><Edit3 size={18}/></button>
                          <button onClick={() => handleDeleteSiswa(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 border-t">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex-1 md:flex-none px-4 py-2 bg-white border rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50 active:scale-95 transition-transform">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex-1 md:flex-none px-4 py-2 bg-white border rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50 active:scale-95 transition-transform">Next</button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1" id="detail-siswa-panel">
        {selectedSiswa ? (
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-sora-blue/30 shadow-xl p-6 md:p-8 sticky top-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-sora-blue uppercase tracking-widest">Detail Keuangan & Biodata</p>
                <h3 className="text-lg md:text-xl font-black text-sora-navy leading-tight mt-1">{selectedSiswa.nama}</h3>
              </div>
              <button onClick={() => setSelectedSiswa(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><X size={20}/></button>
            </div>

            <div className="mb-6 space-y-3 text-[11px] bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Email</span><span className="font-bold text-sora-navy">{selectedSiswa.email || '-'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">WA Siswa</span><span className="font-bold text-sora-navy">{selectedSiswa.no_hp || '-'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Alamat</span><span className="font-bold text-sora-navy text-right max-w-[180px] truncate">{selectedSiswa.alamat || '-'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Wali / Ortu</span><span className="font-bold text-sora-navy">{selectedSiswa.nama_ortu || '-'} ({selectedSiswa.no_hp_ortu || '-'})</span></div>
              <div className="flex justify-between"><span className="text-gray-500 font-medium">Email Ortu</span><span className="font-bold text-sora-navy">{selectedSiswa.email_ortu || '-'}</span></div>
            </div>

            <button onClick={() => handleCetakTanggungan(selectedSiswa)} className="w-full mb-6 bg-sora-navy text-white px-4 py-4 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sora-blue shadow-md transition-all active:scale-95"><Printer size={16}/> Cetak Rekap</button>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedSiswa.tagihan.length > 0 ? selectedSiswa.tagihan.map(t => (
                <div key={t.id} className={`p-4 md:p-5 border rounded-2xl ${t.status === 'Lunas' ? 'bg-sora-green/5 border-sora-green/20' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.kategori}</p>
                      <p className="text-xs md:text-sm font-bold text-sora-navy leading-snug">{t.nama}</p>
                    </div>
                    <span className={`px-2 py-1.5 rounded-md text-[8px] md:text-[9px] font-black uppercase text-center min-w-[70px] ${t.status === 'Lunas' ? 'bg-sora-green/20 text-sora-green' : 'bg-red-100 text-red-500'}`}>{t.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-300">
                    <span className="font-black text-sora-blue text-sm md:text-base">Rp {t.nominal.toLocaleString('id-ID')}</span>
                    {t.status === 'Lunas' && (<button onClick={() => handleCetakStruk(selectedSiswa, t)} className="text-[9px] flex items-center gap-1.5 font-black text-sora-green bg-white border border-sora-green px-3 py-1.5 rounded-lg hover:bg-sora-green hover:text-white transition-all shadow-sm"><Printer size={12}/> Struk</button>)}
                  </div>
                </div>
              )) : (
                <p className="text-center text-xs font-bold text-gray-400 mt-10">Belum ada data tagihan</p>
              )}
            </div>
          </div>
        ) : (<div className="h-[400px] md:h-full border-2 border-dashed border-gray-200 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 p-10 bg-gray-50/50"><Search size={40} className="mb-4 opacity-20"/><p className="text-xs font-bold text-center leading-relaxed">Pilih siswa dari daftar<br/>untuk melihat rincian keuangan.</p></div>)}
      </div>

      {isModalSiswaOpen && (
        <div className="fixed inset-0 bg-sora-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
            <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">{formSiswa.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">NISN</label>
                <input type="text" value={formSiswa.nisn} onChange={e=>setFormSiswa({...formSiswa, nisn: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                <input type="text" value={formSiswa.nama} onChange={e=>setFormSiswa({...formSiswa, nama: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Aktif Siswa</label>
                <input type="email" value={formSiswa.email} onChange={e=>setFormSiswa({...formSiswa, email: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">WhatsApp Siswa</label>
                <input type="text" value={formSiswa.no_hp} onChange={e=>setFormSiswa({...formSiswa, no_hp: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Alamat Lengkap</label>
                <textarea rows="2" value={formSiswa.alamat} onChange={e=>setFormSiswa({...formSiswa, alamat: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium resize-none"/>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Orang Tua</label>
                <input type="text" value={formSiswa.nama_ortu} onChange={e=>setFormSiswa({...formSiswa, nama_ortu: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">No HP Orang Tua</label>
                <input type="text" value={formSiswa.no_hp_ortu} onChange={e=>setFormSiswa({...formSiswa, no_hp_ortu: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Orang Tua</label>
                <input type="email" value={formSiswa.email_ortu} onChange={e=>setFormSiswa({...formSiswa, email_ortu: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Angkatan / Tahun Ajaran</label>
                <select value={formSiswa.angkatan} onChange={e=>setFormSiswa({...formSiswa, angkatan: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none">
                  <option value="">Pilih Angkatan</option>
                  {masterData.years.map(y => (
                    <option key={y.id} value={y.year}>{y.year} {y.is_active ? '(Aktif)' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Jurusan</label>
                <select 
                  value={formSiswa.jurusan} 
                  onChange={e => setFormSiswa({...formSiswa, jurusan: e.target.value, kelas: ''})} 
                  className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Pilih Jurusan</option>
                  {masterData.majors.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Kelas</label>
                <select 
                  value={formSiswa.kelas} 
                  onChange={e=>setFormSiswa({...formSiswa, kelas: e.target.value})} 
                  disabled={!formSiswa.jurusan}
                  className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{formSiswa.jurusan ? 'Pilih Kelas' : 'Pilih Jurusan Dulu'}</option>
                  {kelasTersedia.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

            </div>
            <div className="mt-8 md:mt-10 flex flex-col md:flex-row gap-3">
              <button onClick={handleSaveSiswa} className="w-full md:flex-1 bg-sora-navy text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-sora-blue transition-all shadow-lg active:scale-95">SIMPAN DATA</button>
              <button onClick={()=>setIsModalSiswaOpen(false)} className="w-full md:flex-1 bg-gray-100 text-sora-navy py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95">BATAL</button>
            </div>
          </div>
        </div>
      )}
      
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-sora-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
            <h3 className="text-xl md:text-2xl font-black mb-4">Buat Tagihan Baru</h3>
            
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setInvoiceMode('massal')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${invoiceMode === 'massal' ? 'bg-white text-sora-navy shadow-sm' : 'text-gray-400 hover:text-sora-navy'}`}
              >
                Tagihan Massal
              </button>
              <button
                type="button"
                onClick={() => setInvoiceMode('individu')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${invoiceMode === 'individu' ? 'bg-white text-sora-navy shadow-sm' : 'text-gray-400 hover:text-sora-navy'}`}
              >
                Tagihan Individu
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Judul Tagihan</label>
                <input type="text" name="judul_tagihan" required placeholder="Contoh: SPP Bulan Juli" value={formInvoice.judul_tagihan} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Kategori</label>
                  <select name="jenis_tagihan" value={formInvoice.jenis_tagihan} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none">
                    <option value="SPP">SPP</option>
                    <option value="DU">Dana Ujian (DU)</option>
                    <option value="BUKU">Buku</option>
                    <option value="SERAGAM">Seragam</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    name="nominal" 
                    required 
                    placeholder="250000" 
                    value={formInvoice.nominal} 
                    onChange={handleInvoiceChange}
                    onWheel={(e) => e.target.blur()} 
                    onKeyDown={(e) => ['ArrowUp', 'ArrowDown'].includes(e.key) && e.preventDefault()} 
                    className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {invoiceMode === 'massal' ? (
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Target Kelas</label>
                  <select name="targetKelas" value={formInvoice.targetKelas} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none">
                    <option value="Semua">Semua Siswa Aktif</option>
                    {masterData.grades.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Pilih Siswa</label>
                  <select name="student_id" required value={formInvoice.student_id} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium appearance-none">
                    <option value="">Pilih Siswa dari Daftar</option>
                    {dataSiswa.map(s => (
                      <option key={s.id} value={s.id}>{s.nama} - {s.kelas}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Bulan (Opsional)</label>
                  <input type="text" name="bulan" placeholder="Juli" value={formInvoice.bulan} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Tahun</label>
                  <input type="number" name="tahun" required value={formInvoice.tahun} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Batas Pembayaran (Jatuh Tempo)</label>
                <input type="date" name="tanggal_jatuh_tempo" required value={formInvoice.tanggal_jatuh_tempo} onChange={handleInvoiceChange} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>

              <div className="mt-8 pt-4 space-y-3">
                <button type="submit" disabled={isSubmittingInvoice} className="w-full bg-sora-navy text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-sora-blue transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {isSubmittingInvoice ? 'MEMPROSES...' : 'TERBITKAN TAGIHAN'}
                </button>
                <button type="button" onClick={()=>setIsInvoiceModalOpen(false)} className="w-full bg-gray-100 text-sora-navy py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, isOpen: false })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.desc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDialog.action}>
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}