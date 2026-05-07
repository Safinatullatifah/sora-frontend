import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Megaphone, Calendar, FileSpreadsheet, Printer, Menu, X } from 'lucide-react';
import { AdminProvider } from "../context/AdminProvider";
import { useAdmin } from "../context/AdminContext";
import * as XLSX from 'xlsx';

function MenuBtn({ to, icon, label, end = false, onClick }) {
  return (
    <NavLink onClick={onClick} to={to} end={end} className={({ isActive }) => `w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${isActive ? 'bg-sora-blue shadow-lg shadow-sora-blue/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </NavLink>
  );
}

function AdminLayoutContent({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { dataSiswa, rekapKeuangan } = useAdmin();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'admin') return 'Dashboard';
    return path.replace('-', ' ');
  };

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

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-sora-bg font-sans overflow-hidden text-left print:hidden">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu}></div>
      )}

      <aside className={`fixed md:relative z-50 w-72 h-full bg-sora-navy text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sora-blue rounded-xl flex items-center justify-center font-black text-2xl">S</div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">SORA</h1>
              <p className="text-[10px] text-sora-cyan font-bold uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <button onClick={closeMenu} className="md:hidden text-white hover:text-sora-cyan">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <MenuBtn to="/admin" end icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={closeMenu} />
          <MenuBtn to="/admin/siswa" icon={<Users size={20}/>} label="Data Siswa" onClick={closeMenu} />
          <MenuBtn to="/admin/laporan" icon={<FileSpreadsheet size={20}/>} label="Laporan Keuangan" onClick={closeMenu} />
          <MenuBtn to="/admin/broadcast" icon={<Megaphone size={20}/>} label="Broadcast" onClick={closeMenu} />
          <MenuBtn to="/admin/kalender" icon={<Calendar size={20}/>} label="Kalender Akademik" onClick={closeMenu} />
        </nav>
        <div className="p-6">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        <header className="bg-white px-6 md:px-10 py-6 flex flex-wrap gap-4 justify-between items-center border-b shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-sora-navy p-2 bg-gray-50 rounded-xl">
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-sora-navy uppercase tracking-tight truncate max-w-[150px] md:max-w-md">{getPageTitle()}</h2>
          </div>
          <button onClick={() => handleExport('Harian')} className="flex items-center gap-2 px-4 md:px-6 py-3 bg-sora-bg text-sora-navy border rounded-2xl text-[10px] font-black hover:bg-sora-navy hover:text-white transition-all shadow-sm whitespace-nowrap">
            <Printer size={16}/> <span className="hidden md:inline">CETAK LAPORAN HARI INI</span><span className="md:hidden">CETAK</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout(props) {
  return (
    <AdminProvider>
      <AdminLayoutContent {...props} />
    </AdminProvider>
  );
}