import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, User, LogOut, Bell, Loader2, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SiswaProvider } from "../context/SiswaProvider";
import { useSiswa } from "../context/SiswaContext";

function MenuBtn({ to, icon, label, end = false, onClick }) {
  return (
    <NavLink onClick={onClick} to={to} end={end} className={({ isActive }) => `w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${isActive ? 'bg-sora-blue shadow-lg shadow-sora-blue/20 text-white' : 'text-gray-400 hover:text-sora-navy hover:bg-gray-50'}`}>
      {icon} {label}
    </NavLink>
  );
}

function SiswaLayoutContent({ onLogout, userRole }) {
  const [showNotif, setShowNotif] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profil, pengumuman } = useSiswa();
  const notifRef = useRef();

  const isOrangTua = userRole === 'ortu';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'siswa') return 'Dashboard';
    if (path === 'profil') return 'Pengaturan Akun';
    return path.replace('-', ' ');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  if (!profil) {
    return (
      <div className="flex flex-col h-screen w-screen bg-sora-bg items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-sora-blue" size={48} />
        <p className="text-sm font-black text-sora-navy uppercase tracking-widest">Memuat Data Akun...</p>
      </div>
    );
  }

  const namaSiswa = profil.nama_lengkap || profil.nama || 'Siswa';

  return (
    <div className="flex h-screen bg-sora-bg font-sans overflow-hidden text-left relative">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu}></div>
      )}

      <aside className={`fixed md:relative z-50 w-72 h-full bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-gray-100`}>
        <div className="p-8 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sora-blue rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sora-blue/20">S</div>
            <div>
              <h1 className="text-2xl font-black text-sora-navy tracking-tighter">SORA</h1>
              <p className="text-[10px] text-sora-blue font-black uppercase tracking-widest">{isOrangTua ? 'Portal Orang Tua' : 'Portal Siswa'}</p>
            </div>
          </div>
          <button onClick={closeMenu} className="md:hidden text-sora-navy hover:text-sora-blue">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 pb-2">
          <div className="bg-sora-bg p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="relative w-10 h-10 min-w-[40px] bg-sora-navy text-white rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
              {profil.fotoUrl ? <img src={profil.fotoUrl} alt="Profil" className="w-full h-full object-cover"/> : namaSiswa.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-sora-navy truncate">{namaSiswa}</p>
              <p className="text-[10px] font-bold text-sora-gray truncate">{profil.kelas || '-'}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 pt-4 overflow-y-auto">
          <MenuBtn to="/siswa" end icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={closeMenu} />
          <MenuBtn to="/siswa/tagihan" icon={<CreditCard size={20}/>} label="Keuangan & Tagihan" onClick={closeMenu} />
          {!isOrangTua && <MenuBtn to="/siswa/profil" icon={<User size={20}/>} label="Pengaturan Akun" onClick={closeMenu} />}
        </nav>
        <div className="p-6">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-red-100">
            <LogOut size={18}/> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
        <header className="bg-white px-6 md:px-10 py-6 flex justify-between items-center border-b shadow-sm z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-sora-navy p-2 bg-gray-50 rounded-xl">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-sora-navy uppercase tracking-tight truncate max-w-[150px] md:max-w-md">{getPageTitle()}</h2>
              <p className="hidden md:block text-[10px] text-sora-gray font-bold tracking-[0.2em]">Sistem Digitalisasi Sekolah</p>
            </div>
          </div>
          <div className="flex gap-4 items-center" ref={notifRef}>
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className={`relative p-3 rounded-2xl transition-all ${showNotif ? 'bg-sora-blue text-white' : 'bg-gray-50 text-sora-navy hover:bg-sora-blue hover:text-white'}`}>
                <Bell size={20}/>
                {pengumuman?.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-4 w-[280px] sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-right">
                  <div className="p-5 bg-sora-navy text-white flex justify-between items-center"><h4 className="font-black tracking-widest uppercase text-[10px]">Notifikasi Baru</h4><span className="bg-white/20 px-2 py-1 rounded text-[9px] font-bold">{pengumuman?.length || 0}</span></div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {pengumuman?.map(p => (
                      <div key={p.id} className="p-5 border-b hover:bg-gray-50 transition-all cursor-pointer"><p className="text-[9px] font-bold text-sora-blue mb-1">{p.tanggal}</p><p className="text-xs font-black text-sora-navy mb-1 leading-snug">{p.judul}</p><p className="text-[10px] text-gray-500 line-clamp-2">{p.pesan}</p></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function SiswaLayout(props) {
  return (
    <SiswaProvider>
      <SiswaLayoutContent {...props} />
    </SiswaProvider>
  );
}