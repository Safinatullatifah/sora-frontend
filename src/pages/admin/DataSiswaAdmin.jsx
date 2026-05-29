import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, Eye, Edit3, Trash2, Plus, Receipt, X, Printer, KeyRound, Loader2, FileUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

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
    email: '', email_beasiswa: '', no_hp: '', alamat: '', nama_ortu: '', email_ortu: '', no_hp_ortu: '', statusSiswa: 'Aktif' 
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

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

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
        email_beasiswa: item.email_beasiswa || '',
        no_hp: item.no_hp || '',
        alamat: item.alamat || item.orang_tua?.alamat || '',
        nama_ortu: item.orang_tua?.nama_lengkap || '',
        email_ortu: item.email_orang_tua || item.orang_tua?.email || '',
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
        email_beasiswa: item.email_beasiswa || '',
        no_hp: item.no_hp || '',
        alamat: item.alamat || item.orang_tua?.alamat || '',
        nama_ortu: item.orang_tua?.nama_lengkap || '',
        email_ortu: item.email_orang_tua || item.orang_tua?.email || '',
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
          email_beasiswa: formSiswa.email_beasiswa,
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
          email_beasiswa: formSiswa.email_beasiswa,
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
        email: '', email_beasiswa: '', no_hp: '', alamat: '', nama_ortu: '', email_ortu: '', no_hp_ortu: '', statusSiswa: 'Aktif' 
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

  const handleDownloadTemplate = () => {
    const wsData = [{
      "NISN": "1234567890",
      "Nama Lengkap": "Siswa Teladan",
      "Email": "siswa@sora.com",
      "Email Beasiswa": "",
      "WA Siswa": "081234567890",
      "Alamat": "Jl. Kemerdekaan No 1",
      "Nama Orang Tua": "Bapak Teladan",
      "No HP Orang Tua": "089876543210",
      "Email Orang Tua": "ortu@sora.com",
      "Angkatan": "2026",
      "Jurusan": "Rekayasa Perangkat Lunak",
      "Kelas": "X RPL 1"
    }];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Data_Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Pilih file excel terlebih dahulu!");
      return;
    }
    
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);

        if (excelData.length === 0) {
          toast.error("File Excel kosong");
          setIsImporting(false);
          return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of excelData) {
          try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
              email: row["Email"],
              email_beasiswa: row["Email Beasiswa"] || null,
              password: 'password123',
              nisn: String(row["NISN"]),
              nama_lengkap: row["Nama Lengkap"],
              kelas: row["Kelas"],
              jurusan: row["Jurusan"],
              angkatan: String(row["Angkatan"]),
              no_hp: String(row["WA Siswa"] || ''),
              alamat: row["Alamat"] || '',
              nama_orang_tua: row["Nama Orang Tua"] || '',
              hp_orang_tua: String(row["No HP Orang Tua"] || ''),
              email_orang_tua: row["Email Orang Tua"] || ''
            });
            successCount++;
          } catch (err) {
            failCount++;
          }
        }

        toast.success("Import Selesai", { description: `${successCount} data berhasil, ${failCount} data gagal.` });
        setIsImportModalOpen(false);
        setImportFile(null);
        fetchStudents();
      } catch (error) {
        toast.error("Gagal membaca file Excel. Pastikan format sesuai template.");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  // ✅ FUNGSI CETAK DIPERBARUI: Menggunakan halaman Print khusus
  const handleCetakStruk = (siswa, tagihan) => {
    const dataPrintStruk = {
      namaSiswa: siswa.nama, nisn: siswa.nisn, kelas: siswa.kelas,
      namaTagihan: tagihan.nama, kategori: tagihan.kategori, nominal: tagihan.nominal,
      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    localStorage.setItem('printStrukTagihanData', JSON.stringify(dataPrintStruk));
    window.open('/print-struk-tagihan', '_blank');
  };

  // ✅ FUNGSI CETAK DIPERBARUI: Menggunakan halaman Print khusus
  const handleCetakTanggungan = (siswa) => {
    localStorage.setItem('printRekapSiswaData', JSON.stringify(siswa));
    window.open('/print-rekap-siswa', '_blank');
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in duration-500">
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
            <div className="p-4 md:p-6 border-b flex flex-wrap gap-2 justify-between md:justify-end bg-gray-50/50">
              <button onClick={() => setIsInvoiceModalOpen(true)} className="flex-1 md:flex-none justify-center bg-sora-bg border border-sora-blue/20 text-sora-blue px-4 py-3 md:py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sora-blue hover:text-white transition-all shadow-sm md:shadow-none"><Receipt size={14}/> Buat Tagihan</button>
              <button onClick={() => setIsImportModalOpen(true)} className="flex-1 md:flex-none justify-center bg-green-50 text-sora-green px-4 py-3 md:py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-green-500 hover:text-white transition-all shadow-sm md:shadow-none"><FileUp size={14}/> Import Data</button>
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
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-medium">Email Beasiswa</span><span className="font-bold text-sora-navy">{selectedSiswa.email_beasiswa || '-'}</span></div>
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
                  <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Beasiswa (Opsional)</label>
                  <input type="email" value={formSiswa.email_beasiswa} onChange={e=>setFormSiswa({...formSiswa, email_beasiswa: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
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

        {isImportModalOpen && (
          <div className="fixed inset-0 bg-sora-navy/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg animate-in zoom-in duration-300">
              <h3 className="text-xl md:text-2xl font-black mb-2 text-sora-navy">Import Data Excel</h3>
              <p className="text-xs font-medium text-gray-500 mb-6">Unggah file Excel (.xlsx) untuk menambahkan data siswa secara massal.</p>
              
              <button 
                onClick={handleDownloadTemplate} 
                className="w-full py-4 border-2 border-sora-blue/20 bg-blue-50/50 text-sora-blue rounded-2xl flex items-center justify-center gap-2 hover:bg-sora-blue hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                <Download size={16} /> Download Template Excel
              </button>

              <form onSubmit={handleImportExcel}>
                <div className="mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-sora-blue/50 transition-colors relative cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={(e) => setImportFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <FileUp size={32} className={`mx-auto mb-3 transition-colors ${importFile ? 'text-sora-blue' : 'text-gray-400 group-hover:text-sora-blue'}`} />
                  <p className="text-sm font-bold text-sora-navy truncate px-4">
                    {importFile ? importFile.name : "Pilih File atau Seret Kesini"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Hanya format .XLSX atau .XLS</p>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    type="submit" 
                    disabled={isImporting || !importFile} 
                    className="w-full bg-sora-green text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition-all shadow-lg shadow-sora-green/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isImporting ? <><Loader2 size={16} className="animate-spin"/> MENGIMPORT DATA...</> : 'MULAI IMPORT'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} 
                    className="w-full bg-gray-100 text-sora-navy py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95"
                  >
                    BATAL
                  </button>
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
    </>
  );
}