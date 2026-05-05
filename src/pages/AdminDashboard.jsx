import { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, LogOut, TrendingUp, CreditCard, UserCheck, 
  Megaphone, Calendar, Printer, FileSpreadsheet, Download, 
  Edit, Trash2, X, Paperclip, CheckCircle2, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

// IMPORT KOMPONEN ANAK (TABEL SISWA YANG SUDAH DIPISAH)
import AdminDataSiswa from '../components/AdminDataSiswa';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 text-left transition-transform hover:scale-105 print:hidden">
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-lg`}>{icon}</div>
      <div><p className="text-[10px] font-black text-sora-gray uppercase tracking-widest">{label}</p><p className="text-xl font-black text-sora-navy">{value}</p><p className="text-[9px] font-bold text-gray-400 italic">{sub}</p></div>
    </div>
  );
}

function MenuBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-sora-blue shadow-lg shadow-sora-blue/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}

export default function AdminDashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // STATE UTAMA (MENYIMPAN DATA SISWA UNTUK DIKIRIM KE KOMPONEN ANAK & LAPORAN)
  const [dataSiswa, setDataSiswa] = useState([
    { id: 1, nisn: '005123', nama: 'Safinatul Latifah', kelas: 'XI RPL 1', telp: '0812345678', statusSiswa: 'Aktif', emailOrtu: 'ortu.fina@gmail.com', tagihan: [{ id: 't1', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar' }, { id: 't2', nama: 'SPP Maret 2026', kategori: 'SPP', nominal: 250000, status: 'Lunas' }, { id: 't5', nama: 'Buku Paket PBO', kategori: 'Buku', nominal: 150000, status: 'Lunas' }] },
    { id: 2, nisn: '005765', nama: 'Budi Santoso', kelas: 'X TKJ 2', telp: '0898765432', statusSiswa: 'Aktif', emailOrtu: 'budi.fam@gmail.com', tagihan: [{ id: 't3', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar' }, { id: 't4', nama: 'Uang Seragam', kategori: 'Seragam', nominal: 1500000, status: 'Belum Bayar' }] },
    { id: 3, nisn: '005999', nama: 'Rina Melati', kelas: 'XII MM 1', telp: '0811122233', statusSiswa: 'Keluar', emailOrtu: 'rina.ortu@gmail.com', tagihan: [] },
    { id: 4, nisn: '005124', nama: 'Andi Dermawan', kelas: 'XI RPL 1', telp: '0812345679', statusSiswa: 'Aktif', emailOrtu: 'andi@gmail.com', tagihan: [{ id: 't6', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Lunas' }] },
    { id: 5, nisn: '005125', nama: 'Siti Nurhaliza', kelas: 'X TKJ 1', telp: '0812345680', statusSiswa: 'Aktif', emailOrtu: 'siti@gmail.com', tagihan: [{ id: 't7', nama: 'Buku Jaringan', kategori: 'Buku', nominal: 120000, status: 'Belum Bayar' }] },
    { id: 6, nisn: '005126', nama: 'Reza Rahadian', kelas: 'XII MM 2', telp: '0812345681', statusSiswa: 'Aktif', emailOrtu: 'reza@gmail.com', tagihan: [{ id: 't8', nama: 'SPP Mei 2026', kategori: 'SPP', nominal: 250000, status: 'Lunas' }] },
    { id: 7, nisn: '005127', nama: 'Maya Sari', kelas: 'X RPL 2', telp: '0812345682', statusSiswa: 'Undur Diri', emailOrtu: 'maya@gmail.com', tagihan: [] },
    { id: 8, nisn: '005128', nama: 'Doni Salmanan', kelas: 'XI TKJ 2', telp: '0812345683', statusSiswa: 'Aktif', emailOrtu: 'doni@gmail.com', tagihan: [{ id: 't9', nama: 'Seragam Olahraga', kategori: 'Seragam', nominal: 300000, status: 'Belum Bayar' }] },
  ]);

  // STATE AGENDA & BROADCAST (YANG SEMPAT HILANG)
  const [agendas, setAgendas] = useState([
    { id: 1, rawDate: '2026-04-20', tanggal: '20', bulan: 'APR', judul: 'Batas Akhir SPP', sub: 'Agenda Sekolah', color: 'bg-sora-blue' },
    { id: 2, rawDate: '2026-05-02', tanggal: '02', bulan: 'MEI', judul: 'Ujian Semester', sub: 'Agenda Sekolah', color: 'bg-sora-green' },
  ]);
  const [newAgenda, setNewAgenda] = useState({ id: null, judul: '', tanggal: '' });

  const [broadcasts, setBroadcasts] = useState([
    { id: 1, tanggal: '15 Apr 2026', pesan: 'Pemberitahuan Libur Hari Raya', tipe: 'Pengumuman', file: null }
  ]);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastFile, setBroadcastFile] = useState(null);
  const [editingBroadcastId, setEditingBroadcastId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // KALKULASI REKAP KEUANGAN
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

  // HANDLER EXPORT LAPORAN
  const handleExport = (jenis) => {
    const dataUntukExcel = dataSiswa.map((s, index) => {
      const lunas = s.tagihan.filter(t => t.status === 'Lunas').reduce((a, c) => a + c.nominal, 0);
      const nunggak = s.tagihan.filter(t => t.status === 'Belum Bayar').reduce((a, c) => a + c.nominal, 0);
      return { "No": index + 1, "NISN": s.nisn, "Nama Siswa": s.nama, "Kelas": s.kelas, "Status Siswa": s.statusSiswa, "Total Lunas (Rp)": lunas, "Sisa Tunggakan (Rp)": nunggak };
    });
    dataUntukExcel.push({}); 
    dataUntukExcel.push({ "No": "", "NISN": "", "Nama Siswa": "TOTAL KESELURUHAN", "Kelas": "", "Status Siswa": "", "Total Lunas (Rp)": rekapKeuangan.totalLunas, "Sisa Tunggakan (Rp)": rekapKeuangan.totalNunggak });
    const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
    worksheet['!cols'] = [ { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 } ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan ${jenis}`);
    const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(workbook, `Laporan_SORA_${jenis}_${tanggal}.xlsx`);
  };

  // HANDLER AGENDA & BROADCAST
  const handleAddAgenda = () => {
    if (!newAgenda.judul || !newAgenda.tanggal) return;
    const dateObj = new Date(newAgenda.tanggal);
    const agendaBaru = {
      id: newAgenda.id || Date.now(), rawDate: newAgenda.tanggal,
      tanggal: dateObj.getDate().toString().padStart(2, '0'),
      bulan: dateObj.toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
      judul: newAgenda.judul, sub: 'Agenda Sekolah',
      color: newAgenda.id ? 'bg-orange-500' : 'bg-sora-navy' 
    };
    if (newAgenda.id) setAgendas(agendas.map(a => a.id === newAgenda.id ? agendaBaru : a));
    else setAgendas([agendaBaru, ...agendas]);
    setNewAgenda({ id: null, judul: '', tanggal: '' });
  };
  const handleEditAgenda = (item) => setNewAgenda({ id: item.id, judul: item.judul, tanggal: item.rawDate });
  const handleDeleteAgenda = (id) => { if(window.confirm('Hapus agenda ini?')) setAgendas(agendas.filter(a => a.id !== id)); };

  const handleBroadcast = () => {
    if (!broadcastText && !broadcastFile) return alert("Isi pengumuman!");
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false); setBroadcastSuccess(true);
      const payload = {
        id: editingBroadcastId || Date.now(), tanggal: 'Hari Ini', pesan: broadcastText,
        tipe: broadcastFile ? 'Dokumen Tersisip' : 'Pengumuman', file: broadcastFile ? broadcastFile.name : null
      };
      if (editingBroadcastId) setBroadcasts(broadcasts.map(b => b.id === editingBroadcastId ? payload : b));
      else setBroadcasts([payload, ...broadcasts]);
      setBroadcastText(''); setBroadcastFile(null); setEditingBroadcastId(null);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }, 1500);
  };
  const handleEditBroadcast = (b) => { setBroadcastText(b.pesan); setEditingBroadcastId(b.id); setBroadcastFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDeleteBroadcast = (id) => { if(window.confirm('Tarik/Hapus pengumuman ini dari siswa?')) setBroadcasts(broadcasts.filter(b => b.id !== id)); };

  return (
    <div className="flex h-screen bg-sora-bg font-sans overflow-hidden text-left print:hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-sora-navy text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="w-12 h-12 bg-sora-blue rounded-xl flex items-center justify-center font-black text-2xl">S</div>
          <div><h1 className="text-2xl font-black tracking-tighter">SORA</h1><p className="text-[10px] text-sora-cyan font-bold uppercase tracking-widest">Super Admin</p></div>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <MenuBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <MenuBtn icon={<Users size={20}/>} label="Data Siswa" active={activeMenu === 'siswa'} onClick={() => setActiveMenu('siswa')} />
          <MenuBtn icon={<FileSpreadsheet size={20}/>} label="Laporan Keuangan" active={activeMenu === 'laporan'} onClick={() => setActiveMenu('laporan')} />
          <MenuBtn icon={<Megaphone size={20}/>} label="Broadcast" active={activeMenu === 'broadcast'} onClick={() => setActiveMenu('broadcast')} />
          <MenuBtn icon={<Calendar size={20}/>} label="Kalender Akademik" active={activeMenu === 'kalender'} onClick={() => setActiveMenu('kalender')} />
        </nav>
        <div className="p-6"><button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"><LogOut size={18}/> Logout</button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white px-10 py-6 flex justify-between items-center border-b shadow-sm z-10">
          <div><h2 className="text-2xl font-black text-sora-navy uppercase tracking-tight">{activeMenu.replace('-', ' ')}</h2></div>
          <button onClick={() => handleExport('Harian')} className="flex items-center gap-2 px-6 py-3 bg-sora-bg text-sora-navy border rounded-2xl text-[10px] font-black hover:bg-sora-navy hover:text-white transition-all shadow-sm"><Printer size={16}/> CETAK LAPORAN HARI INI</button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {/* TAB 1: DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<TrendingUp/>} label="Arus Kas (Lunas)" value={`Rp ${(rekapKeuangan.totalLunas/1000000).toFixed(1)} M`} sub="Total Terkumpul" color="bg-sora-blue" />
                <StatCard icon={<CreditCard/>} label="Tunggakan" value={`Rp ${(rekapKeuangan.totalNunggak/1000000).toFixed(1)} M`} sub="Pending Payment" color="bg-red-500" />
                <StatCard icon={<UserCheck/>} label="Siswa Aktif" value={dataSiswa.filter(s=>s.statusSiswa==='Aktif').length} sub="Terdaftar" color="bg-sora-green" />
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

          {/* TAB 2: PANGGIL KOMPONEN ANAK (DATA SISWA & PRINT) */}
          {activeMenu === 'siswa' && (
            <AdminDataSiswa dataSiswa={dataSiswa} setDataSiswa={setDataSiswa} />
          )}

          {/* TAB 3: LAPORAN */}
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

          {/* TAB 4: BROADCAST */}
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

          {/* TAB 5: KALENDER */}
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
    </div>
  );
}