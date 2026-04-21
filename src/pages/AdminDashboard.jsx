import { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, LogOut, Search, Bell, TrendingUp, 
  AlertCircle, Clock, FileText, CheckCircle2, ChevronRight, Megaphone, 
  Calendar, Printer, Info, UserCheck, CreditCard, X, Paperclip, 
  FileSpreadsheet, Download, Plus, Edit3, Trash2, Eye, Receipt, UploadCloud,
  DownloadCloud, Edit
} from 'lucide-react';

// ==========================================
// SUB-COMPONENTS
// ==========================================
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 text-left transition-transform hover:scale-105">
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-sora-navy">{value}</p>
        <p className="text-[9px] font-bold text-gray-400 italic">{sub}</p>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AdminDashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- STATE FILTER SISWA ---
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterJurusan, setFilterJurusan] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // --- STATE DATA SISWA (CRUD) ---
  const [dataSiswa, setDataSiswa] = useState([
    { 
      id: 1, nisn: '005123', nama: 'Fina Khoirunnisa', kelas: 'XI RPL 1', telp: '0812345678',
      tagihan: [
        { id: 't1', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar' },
        { id: 't2', nama: 'SPP Maret 2026', kategori: 'SPP', nominal: 250000, status: 'Lunas' },
        { id: 't5', nama: 'Buku Paket PBO', kategori: 'Buku', nominal: 150000, status: 'Lunas' }
      ]
    },
    { 
      id: 2, nisn: '005765', nama: 'Budi Santoso', kelas: 'X TKJ 2', telp: '0898765432',
      tagihan: [
        { id: 't3', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar' },
        { id: 't4', nama: 'Uang Seragam', kategori: 'Seragam', nominal: 1500000, status: 'Belum Bayar' }
      ]
    }
  ]);
  
  const [selectedSiswa, setSelectedSiswa] = useState(null); 
  const [formSiswa, setFormSiswa] = useState({ id: null, nisn: '', nama: '', kelas: '', telp: '' });
  const [isModalSiswaOpen, setIsModalSiswaOpen] = useState(false);

  // --- STATE TAGIHAN MASSAL & IMPORT EXCEL ---
  const [isModalMassalOpen, setIsModalMassalOpen] = useState(false);
  const [formMassal, setFormMassal] = useState({ targetKelas: 'Semua', namaTagihan: '', nominal: '', kategori: 'SPP' });
  
  const [isModalImportOpen, setIsModalImportOpen] = useState(false);
  const [importType, setImportType] = useState('siswa'); // 'siswa' atau 'tagihan'
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // --- STATE AGENDA ---
  const [agendas, setAgendas] = useState([
    { id: 1, rawDate: '2026-04-20', tanggal: '20', bulan: 'APR', judul: 'Batas Akhir SPP', sub: 'Agenda Sekolah', color: 'bg-sora-blue' },
    { id: 2, rawDate: '2026-05-02', tanggal: '02', bulan: 'MEI', judul: 'Ujian Semester', sub: 'Agenda Sekolah', color: 'bg-sora-green' },
  ]);
  const [newAgenda, setNewAgenda] = useState({ id: null, judul: '', tanggal: '' });

  // --- STATE BROADCAST ---
  const [broadcasts, setBroadcasts] = useState([
    { id: 1, tanggal: '15 Apr 2026', pesan: 'Pemberitahuan Libur Hari Raya', tipe: 'Pengumuman', file: null }
  ]);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastFile, setBroadcastFile] = useState(null);
  const [editingBroadcastId, setEditingBroadcastId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // --- HANDLERS CETAK & TEMPLATE ---
  const handleExport = (jenis) => alert(`[Simulasi] Mengunduh Laporan Keuangan ${jenis}.xlsx...`);
  const handleCetakStruk = (namaSiswa, namaTagihan) => alert(`[Simulasi] Mencetak Bukti Pembayaran (Struk) untuk:\nSiswa: ${namaSiswa}\nTagihan: ${namaTagihan}\n\nMembuka jendela print...`);
  const handleDownloadTemplate = (type) => alert(`[Simulasi] Mengunduh Template_${type}.xlsx...\nPastikan Anda mengisi kolom sesuai header template ini agar database tidak berantakan.`);

  // --- HANDLERS AGENDA (CRUD) ---
  const handleAddAgenda = () => {
    if (!newAgenda.judul || !newAgenda.tanggal) return;
    const dateObj = new Date(newAgenda.tanggal);
    const agendaBaru = {
      id: newAgenda.id || Date.now(),
      rawDate: newAgenda.tanggal,
      tanggal: dateObj.getDate().toString().padStart(2, '0'),
      bulan: dateObj.toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
      judul: newAgenda.judul,
      sub: 'Agenda Sekolah',
      color: newAgenda.id ? 'bg-orange-500' : 'bg-sora-navy' // Warna beda kalau di-edit
    };

    if (newAgenda.id) {
      setAgendas(agendas.map(a => a.id === newAgenda.id ? agendaBaru : a));
    } else {
      setAgendas([agendaBaru, ...agendas]);
    }
    setNewAgenda({ id: null, judul: '', tanggal: '' });
  };
  
  const handleEditAgenda = (item) => setNewAgenda({ id: item.id, judul: item.judul, tanggal: item.rawDate });
  const handleDeleteAgenda = (id) => { if(window.confirm('Hapus agenda ini?')) setAgendas(agendas.filter(a => a.id !== id)); };

  // --- HANDLERS BROADCAST (CRUD) ---
  const handleBroadcast = () => {
    if (!broadcastText && !broadcastFile) return alert("Isi pengumuman!");
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      
      const payload = {
        id: editingBroadcastId || Date.now(),
        tanggal: 'Hari Ini',
        pesan: broadcastText,
        tipe: broadcastFile ? 'Dokumen Tersisip' : 'Pengumuman',
        file: broadcastFile ? broadcastFile.name : null
      };

      if (editingBroadcastId) {
        setBroadcasts(broadcasts.map(b => b.id === editingBroadcastId ? payload : b));
      } else {
        setBroadcasts([payload, ...broadcasts]);
      }

      setBroadcastText('');
      setBroadcastFile(null);
      setEditingBroadcastId(null);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }, 1500);
  };

  const handleEditBroadcast = (b) => {
    setBroadcastText(b.pesan);
    setEditingBroadcastId(b.id);
    setBroadcastFile(null); // Reset file untuk simpelnya
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDeleteBroadcast = (id) => { if(window.confirm('Tarik/Hapus pengumuman ini dari siswa?')) setBroadcasts(broadcasts.filter(b => b.id !== id)); };

  // --- HANDLER CRUD SISWA ---
  const handleSaveSiswa = () => {
    if(formSiswa.id) {
      setDataSiswa(dataSiswa.map(s => s.id === formSiswa.id ? { ...s, ...formSiswa } : s));
    } else {
      setDataSiswa([{ ...formSiswa, id: Date.now(), tagihan: [] }, ...dataSiswa]);
    }
    setIsModalSiswaOpen(false);
  };

  const handleDeleteSiswa = (id) => {
    if(window.confirm('Hapus siswa ini beserta data tagihannya?')) {
      setDataSiswa(dataSiswa.filter(s => s.id !== id));
      if(selectedSiswa?.id === id) setSelectedSiswa(null);
    }
  };

  const openModalSiswa = (siswa = null) => {
    if(siswa) setFormSiswa(siswa);
    else setFormSiswa({ id: null, nisn: '', nama: '', kelas: '', telp: '' });
    setIsModalSiswaOpen(true);
  };

  const handleGenerateTagihanMassal = () => {
    if(!formMassal.namaTagihan || !formMassal.nominal) return alert("Lengkapi nama tagihan dan nominal!");
    const nominalAngka = parseInt(formMassal.nominal);
    if(isNaN(nominalAngka)) return alert("Nominal harus berupa angka!");

    const newDataSiswa = dataSiswa.map(siswa => {
      if (formMassal.targetKelas === 'Semua' || siswa.kelas.includes(formMassal.targetKelas)) {
        const tagihanBaru = { id: 'tm' + Date.now() + Math.floor(Math.random() * 100), nama: formMassal.namaTagihan, kategori: formMassal.kategori, nominal: nominalAngka, status: 'Belum Bayar' };
        return { ...siswa, tagihan: [tagihanBaru, ...siswa.tagihan] };
      }
      return siswa;
    });

    setDataSiswa(newDataSiswa);
    setIsModalMassalOpen(false);
    setFormMassal({ targetKelas: 'Semua', namaTagihan: '', nominal: '', kategori: 'SPP' });
    if(selectedSiswa) setSelectedSiswa(newDataSiswa.find(s => s.id === selectedSiswa.id));
    alert(`Berhasil! Tagihan "${formMassal.namaTagihan}" telah dikirim ke target siswa.`);
  };

  const handleImportExcel = () => {
    if (!importFile) return alert("Pilih file Excel terlebih dahulu!");
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImportSuccess(true);

      if (importType === 'siswa') {
        const dummySiswaBaru = [
          { id: Date.now() + 1, nisn: '008111', nama: 'Siswa Dari Excel 1', kelas: 'X RPL 2', telp: '08111111', tagihan: [] }
        ];
        setDataSiswa([...dummySiswaBaru, ...dataSiswa]);
      } else {
        const newData = dataSiswa.map(s => ({
          ...s,
          tagihan: [{id: 'imp'+Date.now(), nama: 'Tagihan Import', kategori: 'Lainnya', nominal: 350000, status: 'Belum Bayar'}, ...s.tagihan]
        }));
        setDataSiswa(newData);
        if(selectedSiswa) setSelectedSiswa(newData.find(s => s.id === selectedSiswa.id));
      }

      setTimeout(() => {
        setImportSuccess(false);
        setIsModalImportOpen(false);
        setImportFile(null);
      }, 1500);
    }, 2000);
  };

  // --- FILTER & CALCULATE ---
  const filteredSiswaList = useMemo(() => {
    return dataSiswa.filter(s => {
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
      const klsPrefix = s.kelas.split(" ")[0]; // Ambil 'X', 'XI', 'XII'
      const matchKelas = filterKelas === 'Semua' || klsPrefix === filterKelas;
      const matchJurusan = filterJurusan === 'Semua' || s.kelas.includes(filterJurusan);
      const isNunggak = s.tagihan.some(t => t.status === 'Belum Bayar');
      const matchStatus = filterStatus === 'Semua' ? true : (filterStatus === 'Belum Lunas' ? isNunggak : !isNunggak);
      
      return matchSearch && matchKelas && matchJurusan && matchStatus;
    });
  }, [dataSiswa, searchQuery, filterKelas, filterJurusan, filterStatus]);

  const rekapKeuangan = useMemo(() => {
    let totalTagihan = 0; let totalLunas = 0; let totalNunggak = 0;
    const kategoriRekap = { 'SPP': 0, 'Daftar Ulang': 0, 'Buku': 0, 'Seragam': 0, 'Lainnya': 0 };

    dataSiswa.forEach(s => {
      s.tagihan.forEach(t => {
        totalTagihan += t.nominal;
        if (t.status === 'Lunas') {
          totalLunas += t.nominal;
          if(kategoriRekap[t.kategori] !== undefined) kategoriRekap[t.kategori] += t.nominal;
          else kategoriRekap['Lainnya'] += t.nominal;
        } else {
          totalNunggak += t.nominal;
        }
      });
    });
    return { totalTagihan, totalLunas, totalNunggak, kategoriRekap };
  }, [dataSiswa]);

  return (
    <div className="flex h-screen bg-sora-bg font-sans overflow-hidden text-left">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-sora-navy text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-12 h-12 bg-sora-blue rounded-xl flex items-center justify-center font-black text-2xl">S</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">SORA</h1>
            <p className="text-[10px] text-sora-cyan font-bold uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <MenuBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <MenuBtn icon={<Users size={20}/>} label="Data Siswa" active={activeMenu === 'siswa'} onClick={() => setActiveMenu('siswa')} />
          <MenuBtn icon={<FileSpreadsheet size={20}/>} label="Laporan Keuangan" active={activeMenu === 'laporan'} onClick={() => setActiveMenu('laporan')} />
          <MenuBtn icon={<Megaphone size={20}/>} label="Broadcast" active={activeMenu === 'broadcast'} onClick={() => setActiveMenu('broadcast')} />
          <MenuBtn icon={<Calendar size={20}/>} label="Kalender Akademik" active={activeMenu === 'kalender'} onClick={() => setActiveMenu('kalender')} />
        </nav>
        <div className="p-6">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white px-10 py-6 flex justify-between items-center border-b shadow-sm z-10">
          <div className="text-left">
            <h2 className="text-2xl font-black text-sora-navy uppercase tracking-tight">{activeMenu.replace('-', ' ')}</h2>
            <p className="text-[10px] text-sora-gray font-bold tracking-[0.2em]">16 April 2026</p>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={() => handleExport('Harian')} className="flex items-center gap-2 px-6 py-3 bg-sora-bg text-sora-navy border border-gray-200 rounded-2xl text-[10px] font-black hover:bg-sora-navy hover:text-white transition-all shadow-sm">
                <Printer size={16}/> CETAK LAPORAN HARI INI
             </button>
             <div className="w-10 h-10 rounded-full bg-sora-cyan flex items-center justify-center text-sora-navy font-bold shadow-inner">A</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {/* 1. DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<TrendingUp/>} label="Arus Kas (Lunas)" value={`Rp ${(rekapKeuangan.totalLunas/1000000).toFixed(1)} M`} sub="Total Terkumpul" color="bg-sora-blue" />
                <StatCard icon={<CreditCard/>} label="Tunggakan" value={`Rp ${(rekapKeuangan.totalNunggak/1000000).toFixed(1)} M`} sub="Pending Payment" color="bg-red-500" />
                <StatCard icon={<UserCheck/>} label="Siswa Aktif" value={dataSiswa.length} sub="Terdaftar" color="bg-sora-green" />
                <StatCard icon={<Megaphone/>} label="Broadcast" value={broadcasts.length} sub="Terkirim" color="bg-orange-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                   <h3 className="text-lg font-black text-sora-navy uppercase tracking-widest mb-8">Grafik Arus Kas Bulanan</h3>
                   <div className="flex items-end justify-between h-48 gap-4 px-4">
                      {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full bg-sora-bg rounded-t-xl relative overflow-hidden h-full">
                            <div className="absolute bottom-0 w-full bg-sora-blue group-hover:bg-sora-navy transition-all rounded-t-xl" style={{height: `${h}%`}}></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 italic">B{i+1}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="lg:col-span-1 bg-sora-navy p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden">
                  <h3 className="text-2xl font-black mb-4 relative z-10">Selamat Datang di SORA!</h3>
                  <p className="text-sora-cyan/80 text-sm font-medium relative z-10 mb-8">Pantau arus kas, tagihan, dan pengumuman dengan mudah.</p>
                  <button onClick={() => setActiveMenu('laporan')} className="bg-sora-blue text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 hover:scale-105 transition-transform">Lihat Rekapitulasi</button>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sora-blue/30 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DATA SISWA (CRUD + IMPORT + MASSAL + FILTER) */}
          {activeMenu === 'siswa' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-6">
                
                {/* FILTER BAR */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                    <Search className="text-gray-400" size={16}/>
                    <input type="text" placeholder="Cari Nama/NISN..." className="w-full text-xs outline-none bg-transparent" onChange={e => setSearchQuery(e.target.value)}/>
                  </div>
                  <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
                  <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none cursor-pointer border focus:border-sora-blue">
                    <option value="Semua">Semua Kelas</option><option value="X">Kelas X</option><option value="XI">Kelas XI</option><option value="XII">Kelas XII</option>
                  </select>
                  <select value={filterJurusan} onChange={e=>setFilterJurusan(e.target.value)} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none cursor-pointer border focus:border-sora-blue">
                    <option value="Semua">Semua Jurusan</option><option value="RPL">RPL</option><option value="TKJ">TKJ</option><option value="MM">MM</option>
                  </select>
                  <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none cursor-pointer border focus:border-sora-blue">
                    <option value="Semua">Semua Status</option><option value="Belum Lunas">Belum Lunas</option><option value="Lunas">Sudah Lunas</option>
                  </select>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b flex flex-wrap gap-2 justify-end bg-gray-50/50">
                    <button onClick={() => setIsModalImportOpen(true)} className="bg-sora-green/10 border border-sora-green/20 text-sora-green px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sora-green hover:text-white transition-all"><FileSpreadsheet size={14}/> Import</button>
                    <button onClick={() => setIsModalMassalOpen(true)} className="bg-sora-bg border border-sora-blue/20 text-sora-blue px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sora-blue hover:text-white transition-all"><Receipt size={14}/> Massal</button>
                    <button onClick={() => openModalSiswa()} className="bg-sora-blue text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sora-navy transition-all shadow-lg"><Plus size={14}/> Tambah</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
                        <tr><th className="p-6">Siswa</th><th className="p-6">Kelas</th><th className="p-6">Tagihan Pending</th><th className="p-6 text-center">Aksi</th></tr>
                      </thead>
                      <tbody>
                        {filteredSiswaList.length === 0 && <tr><td colSpan="4" className="text-center p-10 text-gray-400 font-bold italic">Tidak ada data siswa ditemukan.</td></tr>}
                        {filteredSiswaList.map(s => {
                          const nunggak = s.tagihan.filter(t => t.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.nominal, 0);
                          return (
                            <tr key={s.id} className="border-b hover:bg-sora-bg/30 transition-all">
                              <td className="p-6"><p className="font-black text-sora-navy">{s.nama}</p><p className="text-[10px] text-gray-400 font-mono">NISN: {s.nisn}</p></td>
                              <td className="p-6 text-xs font-bold text-sora-gray">{s.kelas}</td>
                              <td className="p-6 text-xs font-black text-red-500">{nunggak > 0 ? `Rp ${nunggak.toLocaleString('id-ID')}` : <span className="text-sora-green">Lunas</span>}</td>
                              <td className="p-6">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => setSelectedSiswa(s)} className="p-2 text-sora-blue hover:bg-sora-blue/10 rounded-lg" title="Lihat Detail Tagihan"><Eye size={18}/></button>
                                  <button onClick={() => openModalSiswa(s)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Edit Biodata"><Edit3 size={18}/></button>
                                  <button onClick={() => handleDeleteSiswa(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus Siswa"><Trash2 size={18}/></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PANEL DETAIL TAGIHAN (+ CETAK STRUK) */}
              <div className="lg:col-span-1">
                {selectedSiswa ? (
                  <div className="bg-white rounded-[2.5rem] border border-sora-blue/30 shadow-xl p-8 sticky top-0 animate-in slide-in-from-right-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black text-sora-blue uppercase tracking-widest">Detail Keuangan</p>
                        <h3 className="text-xl font-black text-sora-navy">{selectedSiswa.nama}</h3>
                      </div>
                      <button onClick={() => setSelectedSiswa(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><X size={20}/></button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedSiswa.tagihan.length === 0 ? <p className="text-xs font-bold text-gray-400 italic">Belum ada tagihan.</p> : null}
                      {selectedSiswa.tagihan.map(t => (
                        <div key={t.id} className={`p-4 border rounded-2xl ${t.status === 'Lunas' ? 'bg-sora-green/5 border-sora-green/20' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.kategori}</p>
                              <p className="text-xs font-bold text-sora-navy">{t.nama}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${t.status === 'Lunas' ? 'bg-sora-green/20 text-sora-green' : 'bg-red-100 text-red-500'}`}>{t.status}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                            <span className="font-black text-sora-blue">Rp {t.nominal.toLocaleString('id-ID')}</span>
                            {/* TOMBOL CETAK STRUK */}
                            {t.status === 'Lunas' && (
                              <button onClick={() => handleCetakStruk(selectedSiswa.nama, t.nama)} className="text-[9px] flex items-center gap-1 font-black text-sora-green bg-white border border-sora-green px-2 py-1 rounded hover:bg-sora-green hover:text-white transition-all"><Printer size={12}/> Struk</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full border-2 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center text-gray-400 text-xs font-bold text-center p-10">Klik ikon mata (Lihat Detail)<br/>di tabel untuk melihat<br/>rincian tagihan siswa.</div>
                )}
              </div>
            </div>
          )}

          {/* 3. LAPORAN KEUANGAN (DENGAN KATEGORI) */}
          {activeMenu === 'laporan' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <div>
                  <h3 className="text-xl font-black text-sora-navy">Rekapitulasi Lunas Berdasarkan Kategori</h3>
                  <p className="text-xs font-bold text-sora-gray">Rincian pendapatan yang sudah masuk ke kas sekolah.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleExport('Bulanan')} className="flex items-center gap-2 px-5 py-3 bg-sora-green text-white rounded-xl text-[10px] font-black uppercase hover:opacity-80 transition-all shadow-lg"><Download size={16}/> Bulanan</button>
                  <button onClick={() => handleExport('Tahunan')} className="flex items-center gap-2 px-5 py-3 bg-sora-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-sora-navy transition-all shadow-lg"><Download size={16}/> Tahunan</button>
                </div>
              </div>

              {/* CARD KATEGORI PENDAPATAN */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(rekapKeuangan.kategoriRekap).map(([key, val]) => (
                  <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-2">{key}</p>
                    <p className="text-lg font-black text-sora-green">Rp {(val/1000).toLocaleString('id-ID')}k</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden mt-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
                    <tr><th className="p-6">NISN</th><th className="p-6">Nama Siswa</th><th className="p-6 text-right">Total Tagihan</th><th className="p-6 text-right text-sora-green">Terbayar (Lunas)</th><th className="p-6 text-right text-red-500">Sisa Tunggakan</th></tr>
                  </thead>
                  <tbody>
                    {dataSiswa.map(s => {
                      const total = s.tagihan.reduce((acc, curr) => acc + curr.nominal, 0);
                      const lunas = s.tagihan.filter(t => t.status === 'Lunas').reduce((acc, curr) => acc + curr.nominal, 0);
                      const nunggak = total - lunas;
                      return (
                        <tr key={s.id} className="border-b hover:bg-sora-bg/50">
                          <td className="p-6 font-mono text-xs">{s.nisn}</td>
                          <td className="p-6 font-black text-sora-navy">{s.nama}</td>
                          <td className="p-6 text-right font-bold">Rp {total.toLocaleString('id-ID')}</td>
                          <td className="p-6 text-right font-black text-sora-green">Rp {lunas.toLocaleString('id-ID')}</td>
                          <td className="p-6 text-right font-black text-red-500">Rp {nunggak.toLocaleString('id-ID')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-sora-navy text-white font-black">
                    <tr>
                      <td colSpan="2" className="p-6 text-right uppercase tracking-widest text-[10px]">TOTAL KESELURUHAN</td>
                      <td className="p-6 text-right">Rp {rekapKeuangan.totalTagihan.toLocaleString('id-ID')}</td>
                      <td className="p-6 text-right text-sora-green">Rp {rekapKeuangan.totalLunas.toLocaleString('id-ID')}</td>
                      <td className="p-6 text-right text-red-400">Rp {rekapKeuangan.totalNunggak.toLocaleString('id-ID')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 4. BROADCAST CENTER (CRUD) */}
          {activeMenu === 'broadcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <div className="bg-sora-navy text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col h-fit">
                {broadcastSuccess && (
                  <div className="absolute inset-0 bg-sora-green z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 size={56} className="text-white mb-4 shadow-xl rounded-full" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingBroadcastId ? 'Diperbarui!' : 'Terkirim!'}</h3>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6 relative z-0">
                  <Megaphone className="text-sora-cyan" size={28}/>
                  <h3 className="text-2xl font-black">{editingBroadcastId ? 'Edit Pengumuman' : 'Buat Pengumuman'}</h3>
                </div>
                <textarea value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} placeholder="Tulis pengumuman resmi di sini..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-sora-cyan h-40 placeholder:text-white/30 resize-none mb-6" />
                <div className="mb-8">
                  {broadcastFile ? (
                    <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl border border-white/20">
                      <div className="flex items-center gap-3 overflow-hidden"><FileText size={20} className="text-sora-cyan shrink-0"/><span className="text-xs font-bold truncate">{broadcastFile.name}</span></div>
                      <button onClick={() => setBroadcastFile(null)} className="text-red-400 hover:text-red-300 p-2"><X size={18}/></button>
                    </div>
                  ) : (
                    <><input type="file" id="file-upload" accept=".pdf" className="hidden" onChange={(e) => setBroadcastFile(e.target.files[0])} />
                    <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 hover:text-white hover:border-white/40 cursor-pointer transition-all"><Paperclip size={18}/> Lampirkan Dokumen Baru (PDF)</label></>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingBroadcastId && <button onClick={() => {setEditingBroadcastId(null); setBroadcastText('');}} className="w-1/3 bg-white/10 py-5 rounded-2xl font-black text-xs hover:bg-white/20 transition-all uppercase tracking-widest">Batal</button>}
                  <button onClick={handleBroadcast} disabled={isBroadcasting} className="flex-1 bg-sora-blue py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-sora-cyan transition-all disabled:opacity-50 relative z-0">
                    {isBroadcasting ? 'MEMPROSES...' : (editingBroadcastId ? 'Simpan Perubahan' : 'Kirim Pengumuman')}
                  </button>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
                <h3 className="text-xl font-black text-sora-navy mb-8">Riwayat Broadcast</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {broadcasts.length === 0 && <p className="text-gray-400 font-bold italic text-sm">Belum ada pengumuman.</p>}
                  {broadcasts.map(b => (
                    <div key={b.id} className="p-5 border rounded-2xl flex items-start gap-4 hover:border-sora-blue transition-all group">
                      <div className="bg-sora-bg p-3 rounded-xl text-sora-blue"><Megaphone size={20}/></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">{b.tanggal} • {b.tipe}</p>
                        <p className="text-sm font-black text-sora-navy leading-snug break-words">{b.pesan}</p>
                        {b.file && <p className="text-[10px] text-sora-blue font-bold mt-2 flex items-center gap-1"><FileText size={12}/> {b.file}</p>}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditBroadcast(b)} className="p-2 text-sora-gray hover:text-sora-blue rounded-lg bg-gray-50 hover:bg-sora-bg"><Edit size={14}/></button>
                        <button onClick={() => handleDeleteBroadcast(b.id)} className="p-2 text-sora-gray hover:text-red-500 rounded-lg bg-gray-50 hover:bg-red-50"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. KALENDER AKADEMIK (CRUD) */}
          {activeMenu === 'kalender' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
               <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm h-fit sticky top-0">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-sora-blue/10 p-3 rounded-xl"><Calendar className="text-sora-blue"/></div>
                    <h3 className="text-2xl font-black text-sora-navy">{newAgenda.id ? 'Edit Agenda' : 'Manajemen Agenda'}</h3>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-gray ml-1">Nama Acara</label>
                      <input type="text" className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-sora-blue text-sm font-bold" value={newAgenda.judul} onChange={(e) => setNewAgenda({...newAgenda, judul: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-gray ml-1">Tanggal Pelaksanaan</label>
                      <input type="date" className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-sora-blue text-sm font-bold" value={newAgenda.tanggal} onChange={(e) => setNewAgenda({...newAgenda, tanggal: e.target.value})} />
                    </div>
                    <div className="flex gap-2 mt-4">
                      {newAgenda.id && <button onClick={() => setNewAgenda({id:null, judul:'', tanggal:''})} className="w-1/3 bg-gray-100 text-sora-gray py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Batal</button>}
                      <button onClick={handleAddAgenda} className="flex-1 bg-sora-navy text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sora-blue transition-all">{newAgenda.id ? 'Simpan Perubahan' : 'Simpan Agenda'}</button>
                    </div>
                  </div>
               </div>

               <div className="bg-sora-bg p-10 rounded-[2.5rem] border border-gray-200">
                  <h3 className="text-xl font-black text-sora-navy mb-8">Agenda Mendatang</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {agendas.length === 0 && <p className="text-gray-400 font-bold italic text-sm">Tidak ada agenda tercatat.</p>}
                    {agendas.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center p-4 bg-white rounded-2xl shadow-sm group border border-transparent hover:border-sora-blue transition-all">
                        <div className={`${item.color} text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold shadow-md`}>
                          <span className="text-[10px] tracking-tighter">{item.bulan}</span>
                          <span className="text-2xl leading-none">{item.tanggal}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-black text-sora-navy uppercase truncate">{item.judul}</p>
                          <p className="text-[10px] text-sora-gray font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleEditAgenda(item)} className="p-2 text-sora-gray hover:bg-sora-bg rounded-lg"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteAgenda(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL CRUD SISWA ================= */}
      {isModalSiswaOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => setIsModalSiswaOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-[110] p-10 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-sora-navy mb-6">{formSiswa.id ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="NISN" value={formSiswa.nisn} onChange={e => setFormSiswa({...formSiswa, nisn: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
              <input type="text" placeholder="Nama Lengkap" value={formSiswa.nama} onChange={e => setFormSiswa({...formSiswa, nama: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Kelas (Misal: X RPL 1)" value={formSiswa.kelas} onChange={e => setFormSiswa({...formSiswa, kelas: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
                <input type="text" placeholder="No. Telp / WA" value={formSiswa.telp} onChange={e => setFormSiswa({...formSiswa, telp: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
              </div>
              <button onClick={handleSaveSiswa} className="w-full mt-4 bg-sora-blue text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sora-navy transition-all shadow-lg">Simpan Data Siswa</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL IMPORT EXCEL (+ TEMPLATE) ================= */}
      {isModalImportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => setIsModalImportOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl z-[110] p-10 animate-in zoom-in duration-300 relative overflow-hidden">
            
            {importSuccess && (
              <div className="absolute inset-0 bg-sora-green z-20 flex flex-col items-center justify-center animate-in fade-in duration-300 text-white">
                <CheckCircle2 size={56} className="mb-4" />
                <h3 className="text-xl font-black uppercase tracking-widest">Import Sukses!</h3>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sora-green/10 text-sora-green p-3 rounded-xl"><FileSpreadsheet size={24}/></div>
                <div>
                  <h3 className="text-xl font-black text-sora-navy leading-tight">Import Excel</h3>
                  <p className="text-[10px] font-bold text-sora-gray uppercase tracking-widest">Upload .xlsx / .csv</p>
                </div>
              </div>
              <button onClick={() => handleDownloadTemplate(importType)} className="text-[9px] font-black uppercase tracking-widest text-sora-blue bg-sora-bg hover:bg-sora-blue hover:text-white px-3 py-2 rounded-lg flex flex-col items-center gap-1 transition-all" title="Download Template"><DownloadCloud size={14}/> Template</button>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button onClick={() => setImportType('siswa')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importType === 'siswa' ? 'bg-white shadow text-sora-navy' : 'text-gray-400'}`}>Data Siswa</button>
              <button onClick={() => setImportType('tagihan')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${importType === 'tagihan' ? 'bg-white shadow text-sora-navy' : 'text-gray-400'}`}>Tagihan Massal</button>
            </div>

            <div className="mb-6">
              {importFile ? (
                <div className="flex items-center justify-between bg-sora-bg p-4 rounded-2xl border border-sora-blue/20">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileSpreadsheet size={20} className="text-sora-green shrink-0"/>
                    <span className="text-xs font-bold text-sora-navy truncate">{importFile.name}</span>
                  </div>
                  <button onClick={() => setImportFile(null)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                </div>
              ) : (
                <>
                  <input type="file" id="excel-upload" accept=".xlsx, .xls, .csv" className="hidden" onChange={(e) => setImportFile(e.target.files[0])} />
                  <label htmlFor="excel-upload" className="flex flex-col items-center justify-center gap-3 w-full py-10 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-sora-bg hover:border-sora-blue cursor-pointer transition-all group">
                    <UploadCloud size={32} className="text-gray-400 group-hover:text-sora-blue transition-colors"/>
                    <div className="text-center">
                      <p className="text-xs font-black text-sora-navy">Klik untuk Upload File</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gunakan template resmi SORA</p>
                    </div>
                  </label>
                </>
              )}
            </div>

            <button onClick={handleImportExcel} disabled={isImporting} className="w-full bg-sora-green text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {isImporting ? 'MEMPROSES DATA...' : 'Mulai Import'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL TAGIHAN MASSAL ================= */}
      {isModalMassalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => setIsModalMassalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl z-[110] p-10 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-sora-navy mb-2">Tagihan Massal</h3>
            <p className="text-[10px] font-bold text-sora-gray uppercase tracking-widest mb-6">Generate Tagihan Otomatis</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Target Kelas</label>
                  <select value={formMassal.targetKelas} onChange={e => setFormMassal({...formMassal, targetKelas: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 rounded-xl outline-none font-bold text-xs border focus:border-sora-blue">
                    <option value="Semua">Semua Kelas</option><option value="X">Hanya Kelas X</option><option value="XI">Hanya Kelas XI</option><option value="XII">Hanya Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Kategori</label>
                  <select value={formMassal.kategori} onChange={e => setFormMassal({...formMassal, kategori: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 rounded-xl outline-none font-bold text-xs border focus:border-sora-blue">
                    <option value="SPP">SPP</option><option value="Daftar Ulang">Daftar Ulang</option><option value="Buku">Buku</option><option value="Seragam">Seragam</option><option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nama Tagihan</label>
                <input type="text" placeholder="Misal: SPP Mei 2026" value={formMassal.namaTagihan} onChange={e => setFormMassal({...formMassal, namaTagihan: e.target.value})} className="w-full mt-2 p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nominal (Rp)</label>
                <input type="number" placeholder="250000" value={formMassal.nominal} onChange={e => setFormMassal({...formMassal, nominal: e.target.value})} className="w-full mt-2 p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm border focus:border-sora-blue" />
              </div>
              <button onClick={handleGenerateTagihanMassal} className="w-full mt-6 bg-sora-navy text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sora-blue transition-all shadow-lg flex items-center justify-center gap-2">
                <Receipt size={16}/> Proses Tagihan Massal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Komponen Pembantu Menu Sidebar
function MenuBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-sora-blue shadow-lg shadow-sora-blue/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}