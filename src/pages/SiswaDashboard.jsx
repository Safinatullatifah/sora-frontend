import { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios'; 
import { 
  User, CreditCard, LogOut, LayoutDashboard, Bell, 
  CheckCircle2, Clock, Megaphone, FileText, ChevronRight, 
  AlertCircle, UploadCloud, ShieldAlert, CheckCircle, X,
  Wallet, QrCode, Building, Camera, KeyRound, Lock, Eye, EyeOff,
  AlertTriangle, MailCheck, Layers
} from 'lucide-react';

export default function SiswaDashboard({ onLogout, isOrangTua = false }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showNotif, setShowNotif] = useState(false);
  
  // --- STATE BARU UNTUK MODAL PAKET SPP ---
  const [isModalPaketOpen, setIsModalPaketOpen] = useState(false);
  
  // --- INJEKSI SCRIPT MIDTRANS OTOMATIS (ANTI-ERROR) ---
  useEffect(() => {
    const scriptId = 'midtrans-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", "SB-Mid-client-Ecm_Qy3M-nD2gGGQ"); 
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // --- STATE DATA SISWA ---
  const [profil, setProfil] = useState({
    nama: 'Safinatul Latifah',
    nisn: '005123',
    kelas: 'XI RPL 1',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-05-14',
    asalSekolah: 'SMPN 1 Surabaya',
    namaAyah: 'Budi Santoso',
    namaIbu: 'Siti Aminah',
    pekerjaanOrtu: 'Wiraswasta',
    telp: '08123456789',
    alamat: 'Jl. Ketintang Baru No. 12, Surabaya',
    statusVerifikasi: 'Verified',
    fotoUrl: null
  });
  const [tempProfil, setTempProfil] = useState({...profil});

  // --- STATE PASSWORD ---
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [passResetStep, setPassResetStep] = useState(1); 

  // --- STATE TAGIHAN ---
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [tagihan, setTagihan] = useState([
    { id: 'INV-0426-01', nama: 'SPP April 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar', tglBatas: '20 Apr 2026' },
    { id: 'INV-0426-02', nama: 'Uang Buku Paket PBO', kategori: 'Buku', nominal: 150000, status: 'Belum Bayar', tglBatas: '25 Apr 2026' },
    { id: 'INV-0426-03', nama: 'Seragam Olahraga', kategori: 'Seragam', nominal: 350000, status: 'Belum Bayar', tglBatas: '30 Apr 2026' },
    { id: 'INV-0326-01', nama: 'SPP Maret 2026', kategori: 'SPP', nominal: 250000, status: 'Lunas', tglBatas: '20 Mar 2026' },
    { id: 'INV-0226-01', nama: 'SPP Februari 2026', kategori: 'SPP', nominal: 250000, status: 'Belum Bayar', tglBatas: '20 Feb 2026' },
    { id: 'INV-0725-01', nama: 'Daftar Ulang Ganjil', kategori: 'Daftar Ulang', nominal: 1250000, status: 'Lunas', tglBatas: '15 Jul 2025' },
  ]);

  // --- STATE PENGUMUMAN ---
  const [pengumuman] = useState([
    { id: 1, tanggal: '15 Apr 2026', judul: 'Pemberitahuan Libur Hari Raya Idul Fitri', file: 'Surat_Edaran_Libur.pdf', pesan: 'Diberitahukan kepada seluruh siswa bahwa libur akan dimulai pada tanggal 18 April 2026.' },
    { id: 2, tanggal: '10 Apr 2026', judul: 'Batas Akhir Pembayaran SPP', file: null, pesan: 'Mohon segera melunasi SPP bulan April sebelum ujian tengah semester dimulai.' }
  ]);

  // --- HANDLERS ---
  const handleUpdateProfil = () => {
    setProfil({ ...tempProfil, statusVerifikasi: 'Pending' });
    alert("Profil berhasil diperbarui! Menunggu verifikasi dari Tata Usaha.");
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempProfil({ ...tempProfil, fotoUrl: url });
      setProfil({ ...profil, fotoUrl: url }); 
    }
  };

  const handleUbahPassword = () => {
    if (!passForm.old || !passForm.new || !passForm.confirm) return alert("Lengkapi form password!");
    if (passForm.new !== passForm.confirm) return alert("Password baru dan konfirmasi tidak cocok!");
    setPassResetStep(2);
  };

  // --- LOGIKA PEMBAYARAN MIDTRANS SATUAN ---
  const handlePay = async (item) => {
    const btn = document.activeElement;
    const originalText = btn.innerText;
    try {
      btn.innerText = "PROSES..."; btn.disabled = true;

      const response = await axios.post(`http://localhost:3000/api/invoices/${item.id}/pay`, { nominal: item.nominal });
      const snapToken = response.data.token || response.data.snap_token;

      btn.innerText = originalText; btn.disabled = false;

      if (!snapToken) {
        return alert("Backend belum siap mengirimkan Token Midtrans. Cek file routes kamu ya!");
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: function(){
            alert("Yay! Pembayaran Sukses!");
            setTagihan(tagihan.map(t => t.id === item.id ? { ...t, status: 'Lunas' } : t));
          },
          onPending: function(){
            alert("Sip, silakan selesaikan pembayaranmu di ATM/Aplikasi.");
            setTagihan(tagihan.map(t => t.id === item.id ? { ...t, status: 'Menunggu Konfirmasi' } : t));
          }
        });
      } else {
        alert("Midtrans masih loading, coba refresh (F5).");
      }
    } catch (error) {
      console.error("Midtrans Error:", error);
      btn.innerText = originalText; btn.disabled = false;
      alert("Gagal memanggil Backend.");
    }
  };

  // --- LOGIKA PEMBAYARAN MIDTRANS PAKET (MULTIPLE BULAN) ---
  const handlePayPaket = async (namaPaket, jumlahBulan) => {
    setIsModalPaketOpen(false); // Tutup modal dulu biar lega
    const nominalTotal = 250000 * jumlahBulan; // Rp 250.000 x jumlah bulan
    const paketId = `PKT-${Date.now()}`; // Bikin ID unik untuk paket ini

    try {
      const response = await axios.post(`http://localhost:3000/api/invoices/${paketId}/pay`, { nominal: nominalTotal });
      const snapToken = response.data.token || response.data.snap_token;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => { 
            alert(`Luar Biasa! Pembayaran ${namaPaket} Berhasil!`); 
            // Ubah tagihan SPP jadi lunas sebagai simulasi
            setTagihan(tagihan.map(t => t.kategori === 'SPP' ? { ...t, status: 'Lunas' } : t)); 
          },
          onPending: () => {
            alert(`Silakan lanjutkan pembayaran ${namaPaket} Anda.`);
          }
        });
      }
    } catch (error) {
      alert("Gagal memanggil Backend untuk fitur Paket SPP.");
    }
  };

  // --- LOGIKA CETAK STRUK PEMBAYARAN ---
  const handleCetakStruk = (item) => {
    const dataStruk = {
      namaSiswa: profil.nama,
      nisn: profil.nisn,
      kelas: profil.kelas,
      namaTagihan: item.nama,
      kategori: item.kategori,
      nominal: item.nominal,
      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    };
    // Lempar data ke jembatan memori
    localStorage.setItem('printStrukData', JSON.stringify(dataStruk));
    // Buka tab baru
    window.open('/print-struk', '_blank');
  };

  // --- CALCULATIONS & FILTERS ---
  const totalNunggak = useMemo(() => {
    return tagihan.filter(t => t.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.nominal, 0);
  }, [tagihan]);

  const filteredTagihan = useMemo(() => {
    if (kategoriAktif === 'Semua') return tagihan;
    return tagihan.filter(t => t.kategori === kategoriAktif);
  }, [tagihan, kategoriAktif]);

  const tagihanMendesak = useMemo(() => {
    return tagihan.find(t => t.status === 'Belum Bayar' && t.tglBatas === '20 Apr 2026');
  }, [tagihan]);

  const totalBulanNunggak = useMemo(() => {
    return tagihan.filter(t => t.status === 'Belum Bayar' && t.kategori === 'SPP').length;
  }, [tagihan]);
  const isBlokirUjian = totalBulanNunggak >= 3;

  // --- CLOSE NOTIF OUTSIDE CLICK ---
  const notifRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-sora-bg font-sans overflow-hidden text-left relative">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-white shadow-xl flex flex-col z-20 border-r border-gray-100">
        <div className="p-8 flex items-center gap-4 border-b border-gray-50">
          <div className="w-12 h-12 bg-sora-blue rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sora-blue/20">S</div>
          <div>
            <h1 className="text-2xl font-black text-sora-navy tracking-tighter">SORA</h1>
            <p className="text-[10px] text-sora-blue font-black uppercase tracking-widest">{isOrangTua ? 'Portal Orang Tua' : 'Portal Siswa'}</p>
          </div>
        </div>
        <div className="p-6 pb-2">
          <div className="bg-sora-bg p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="relative w-10 h-10 bg-sora-navy text-white rounded-full flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
              {profil.fotoUrl ? <img src={profil.fotoUrl} alt="Profil" className="w-full h-full object-cover"/> : profil.nama.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-sora-navy truncate">{profil.nama}</p>
              <p className="text-[10px] font-bold text-sora-gray">{profil.kelas}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 pt-4">
          <MenuBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <MenuBtn icon={<CreditCard size={20}/>} label="Keuangan & Tagihan" active={activeMenu === 'tagihan'} onClick={() => setActiveMenu('tagihan')} />
          {!isOrangTua && (
            <MenuBtn icon={<User size={20}/>} label="Pengaturan Akun" active={activeMenu === 'profil'} onClick={() => setActiveMenu('profil')} />
          )}
        </nav>
        <div className="p-6">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-red-100">
            <LogOut size={18}/> Keluar
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white px-10 py-6 flex justify-between items-center border-b shadow-sm z-30">
          <div>
            <h2 className="text-2xl font-black text-sora-navy uppercase tracking-tight">{activeMenu === 'profil' ? 'Pengaturan Akun' : activeMenu.replace('-', ' ')}</h2>
            <p className="text-[10px] text-sora-gray font-bold tracking-[0.2em]">16 April 2026 • Tahun Ajaran 2025/2026</p>
          </div>
          <div className="flex gap-4 items-center" ref={notifRef}>
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className={`relative p-3 rounded-2xl transition-all ${showNotif ? 'bg-sora-blue text-white' : 'bg-gray-50 text-sora-navy hover:bg-sora-blue hover:text-white'}`}>
                <Bell size={20}/>
                {pengumuman.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
              
              {showNotif && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-right">
                  <div className="p-5 bg-sora-navy text-white flex justify-between items-center">
                    <h4 className="font-black tracking-widest uppercase text-[10px]">Notifikasi Baru</h4>
                    <span className="bg-white/20 px-2 py-1 rounded text-[9px] font-bold">{pengumuman.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {pengumuman.map(p => (
                      <div key={p.id} className="p-5 border-b hover:bg-gray-50 transition-all cursor-pointer">
                        <p className="text-[9px] font-bold text-sora-blue mb-1">{p.tanggal}</p>
                        <p className="text-xs font-black text-sora-navy mb-1 leading-snug">{p.judul}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-2">{p.pesan}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 text-center border-t">
                    <button className="text-[10px] font-black text-sora-blue hover:underline uppercase tracking-widest">Tandai sudah dibaca</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {isBlokirUjian && (
            <div className="bg-red-600 text-white p-6 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center gap-5 shadow-xl shadow-red-600/20 mb-8 animate-in slide-in-from-top-4">
              <div className="bg-white/20 p-4 rounded-2xl shrink-0"><ShieldAlert size={36} /></div>
              <div className="flex-1">
                <h4 className="font-black text-lg uppercase tracking-widest">Akses Ujian Diblokir!</h4>
                <p className="text-sm font-medium mt-1 leading-relaxed text-white/90">Sistem mendeteksi tunggakan SPP sebanyak <strong>{totalBulanNunggak} bulan</strong>. Kartu Ujian (UTS/UAS) tidak dapat diakses. Harap segera melunasi tagihan atau hubungi Tata Usaha.</p>
              </div>
              <button onClick={() => setActiveMenu('tagihan')} className="w-full md:w-auto bg-white text-red-600 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md whitespace-nowrap">Lihat Tagihan</button>
            </div>
          )}

          {/* 1. DASHBOARD OVERVIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {tagihanMendesak && (
                <div className="bg-red-50 border border-red-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/30 animate-bounce"><AlertTriangle size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Peringatan Jatuh Tempo</p>
                      <p className="text-sm font-bold text-red-500">Tagihan <strong className="font-black text-red-600">{tagihanMendesak.nama}</strong> harus dilunasi sebelum <strong className="font-black text-red-600">{tagihanMendesak.tglBatas}</strong>.</p>
                    </div>
                  </div>
                  <button onClick={() => {setActiveMenu('tagihan'); handlePay(tagihanMendesak);}} className="w-full md:w-auto bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-md shadow-red-500/20 whitespace-nowrap">Bayar Sekarang</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-sora-blue p-8 rounded-[2.5rem] text-white shadow-xl shadow-sora-blue/20 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Tagihan Belum Dibayar</p>
                    <h3 className="text-4xl font-black mb-6">Rp {totalNunggak.toLocaleString('id-ID')}</h3>
                    <button onClick={() => setActiveMenu('tagihan')} className="bg-white text-sora-blue px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Lihat Rincian</button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center min-h-[200px]">
                  <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-4">Status Data Induk</p>
                  <div className="flex items-center gap-4">
                    {profil.statusVerifikasi === 'Verified' ? (
                      <><div className="bg-sora-green/10 p-4 rounded-2xl text-sora-green"><CheckCircle2 size={32}/></div>
                      <div><h4 className="text-xl font-black text-sora-navy">Terverifikasi</h4><p className="text-xs text-sora-gray font-bold">Data Anda valid. {!isOrangTua && <button onClick={()=>setActiveMenu('profil')} className="text-sora-blue hover:underline">Lihat Profil</button>}</p></div></>
                    ) : (
                      <><div className="bg-orange-100 p-4 rounded-2xl text-orange-500 animate-pulse"><Clock size={32}/></div>
                      <div><h4 className="text-xl font-black text-sora-navy">Menunggu Review</h4><p className="text-xs text-sora-gray font-bold">Admin sedang mengecek data Anda.</p></div></>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 text-red-500 p-2 rounded-xl"><Megaphone size={20}/></div>
                  <h3 className="text-lg font-black text-sora-navy uppercase tracking-widest">Papan Pengumuman</h3>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {pengumuman.map(p => (
                    <div key={p.id} className="p-6 bg-sora-bg border border-sora-blue/10 rounded-2xl hover:border-sora-blue transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-sora-blue bg-blue-50 px-2 py-1 rounded uppercase">{p.tipe}</p>
                        <p className="text-[10px] font-bold text-gray-400">{p.tanggal}</p>
                      </div>
                      <h4 className="text-md font-black text-sora-navy mb-2 mt-3">{p.judul}</h4>
                      <p className="text-xs text-sora-gray font-medium leading-relaxed mb-4">{p.pesan}</p>
                      {p.file && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-sora-navy hover:bg-sora-blue hover:text-white transition-all shadow-sm">
                          <FileText size={14}/> Unduh Dokumen ({p.file})
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. KEUANGAN & TAGIHAN */}
          {activeMenu === 'tagihan' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
              
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-black text-sora-navy tracking-tight">Rincian Keuangan</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Pantau dan bayar tagihan sekolah Anda di sini.</p>
                </div>
                
                {/* --- TOMBOL PEMICU MODAL PAKET --- */}
                <div className="flex items-center gap-4 text-right">
                  <button onClick={() => setIsModalPaketOpen(true)} className="bg-sora-navy text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue transition-all shadow-lg flex items-center gap-2">
                    <Layers size={14}/> Bayar Paket SPP
                  </button>
                  <div className="hidden md:block w-px h-10 bg-gray-200"></div>
                  <div>
                    <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest">Total Tunggakan</p>
                    <p className="text-2xl font-black text-red-500">Rp {totalNunggak.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border shadow-sm custom-scrollbar">
                {['Semua', 'SPP', 'Daftar Ulang', 'Buku', 'Seragam'].map(kat => (
                  <button key={kat} onClick={() => setKategoriAktif(kat)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${kategoriAktif === kat ? 'bg-sora-navy text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-sora-navy'}`}>
                    {kat}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
                    <tr><th className="p-6">Detail Tagihan</th><th className="p-6">Tenggat Waktu</th><th className="p-6">Nominal</th><th className="p-6">Status</th><th className="p-6 text-center">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {filteredTagihan.length === 0 ? <tr><td colSpan="5" className="text-center p-10 text-gray-400 font-bold italic text-sm">Tidak ada tagihan untuk kategori ini.</td></tr> : null}
                    {filteredTagihan.map(t => (
                      <tr key={t.id} className={`border-b border-gray-50 transition-all ${t.status === 'Lunas' ? 'bg-gray-50/50 opacity-80 hover:opacity-100' : 'hover:bg-sora-bg/50'}`}>
                        <td className="p-6">
                          <p className="text-sm font-black text-sora-navy">{t.nama}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.id}</span>
                            <span className="text-[9px] font-black text-sora-blue bg-blue-50 px-2 rounded uppercase">{t.kategori}</span>
                          </div>
                        </td>
                        <td className="p-6 text-xs font-bold text-gray-500">{t.tglBatas}</td>
                        <td className="p-6 text-sm font-black text-sora-navy">Rp {t.nominal.toLocaleString('id-ID')}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${t.status === 'Lunas' ? 'bg-sora-green/10 text-sora-green' : t.status === 'Menunggu Konfirmasi' ? 'bg-orange-100 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          {t.status === 'Belum Bayar' ? (
                            <button onClick={() => handlePay(t)} className="bg-sora-blue text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-navy transition-all shadow-md shadow-sora-blue/20">Bayar</button>
                          ) : t.status === 'Lunas' ? (
                            <button onClick={() => handleCetakStruk(t)} className="bg-white border border-gray-200 text-sora-navy px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-sora-blue transition-all flex items-center justify-center gap-2 mx-auto"><FileText size={12}/> Struk</button>
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
          )}

          {/* 3. PENGATURAN AKUN */}
          {activeMenu === 'profil' && !isOrangTua && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center flex flex-col items-center">
                  <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-50 overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                      {tempProfil.fotoUrl ? (
                        <img src={tempProfil.fotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-gray-300"/>
                      )}
                    </div>
                    <label className="absolute inset-0 bg-sora-navy/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-sm">
                      <Camera size={24} className="mb-1"/>
                      <span className="text-[9px] font-black uppercase tracking-widest">Ubah Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                    </label>
                  </div>
                  <h3 className="text-xl font-black text-sora-navy">{profil.nama}</h3>
                  <p className="text-xs font-bold text-gray-400 mb-6">{profil.nisn} • {profil.kelas}</p>
                  
                  <div className={`w-full p-4 rounded-2xl flex flex-col items-center gap-2 border ${profil.statusVerifikasi === 'Verified' ? 'bg-sora-green/5 border-sora-green/20 text-sora-green' : 'bg-orange-50 border-orange-200 text-orange-500'}`}>
                    {profil.statusVerifikasi === 'Verified' ? <ShieldAlert size={24}/> : <Clock size={24}/>}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Status Data</p>
                      <p className="text-sm font-black">{profil.statusVerifikasi}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden h-fit transition-all duration-300">
                  {passResetStep === 1 ? (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <KeyRound className="text-sora-blue" size={20}/>
                        <h3 className="text-md font-black text-sora-navy uppercase tracking-widest">Keamanan Akun</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input type={showPass?"text":"password"} placeholder="Password Lama" value={passForm.old} onChange={e=>setPassForm({...passForm, old: e.target.value})} className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:border-sora-blue border border-transparent transition-all"/>
                          <button onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sora-navy">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input type={showPass?"text":"password"} placeholder="Password Baru" value={passForm.new} onChange={e=>setPassForm({...passForm, new: e.target.value})} className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:border-sora-blue border border-transparent transition-all"/>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input type={showPass?"text":"password"} placeholder="Konfirmasi Password Baru" value={passForm.confirm} onChange={e=>setPassForm({...passForm, confirm: e.target.value})} className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:border-sora-blue border border-transparent transition-all"/>
                        </div>
                        <button onClick={handleUbahPassword} className="w-full bg-sora-navy text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue transition-all shadow-md">Kirim Link Verifikasi</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 animate-in fade-in zoom-in-95">
                      <div className="bg-sora-green/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MailCheck size={36} className="text-sora-green" />
                      </div>
                      <h4 className="text-lg font-black text-sora-navy mb-2">Cek Email Anda!</h4>
                      <p className="text-xs text-sora-gray font-bold mb-6 leading-relaxed">Kami telah mengirimkan link konfirmasi perubahan password ke email yang terdaftar pada sistem.</p>
                      <button onClick={() => {setPassResetStep(1); setPassForm({old:'',new:'',confirm:''})}} className="w-full bg-gray-100 text-sora-navy py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Kembali</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] border shadow-sm h-fit">
                <div className="mb-8 border-b pb-6">
                  <h3 className="text-2xl font-black text-sora-navy tracking-tight">Biodata Lengkap Siswa</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Isi data sesuai dengan Kartu Keluarga dan Ijazah Terakhir. Perubahan memerlukan validasi ulang.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">NISN (Permanen)</label>
                      <input type="text" value={profil.nisn} disabled className="w-full mt-2 p-3 bg-gray-200 rounded-xl border-none outline-none font-bold text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kelas (Permanen)</label>
                      <input type="text" value={profil.kelas} disabled className="w-full mt-2 p-3 bg-gray-200 rounded-xl border-none outline-none font-bold text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] border-b pb-2 mt-8">I. Data Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nama Lengkap Sesuai Ijazah</label>
                      <input type="text" value={tempProfil.nama} onChange={e=>setTempProfil({...tempProfil, nama: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Tempat Lahir</label>
                      <input type="text" value={tempProfil.tempatLahir} onChange={e=>setTempProfil({...tempProfil, tempatLahir: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Tanggal Lahir</label>
                      <input type="date" value={tempProfil.tanggalLahir} onChange={e=>setTempProfil({...tempProfil, tanggalLahir: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Jenis Kelamin</label>
                      <select value={tempProfil.jenisKelamin} onChange={e=>setTempProfil({...tempProfil, jenisKelamin: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all">
                        <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Agama</label>
                      <select value={tempProfil.agama} onChange={e=>setTempProfil({...tempProfil, agama: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all">
                        <option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-sora-blue uppercase tracking-[0.2em] border-b pb-2 mt-8">II. Data Pendukung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nama Ayah Kandung</label>
                      <input type="text" value={tempProfil.namaAyah} onChange={e=>setTempProfil({...tempProfil, namaAyah: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nama Ibu Kandung</label>
                      <input type="text" value={tempProfil.namaIbu} onChange={e=>setTempProfil({...tempProfil, namaIbu: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Pekerjaan Orang Tua</label>
                      <input type="text" value={tempProfil.pekerjaanOrtu} onChange={e=>setTempProfil({...tempProfil, pekerjaanOrtu: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Asal Sekolah (SMP/MTs)</label>
                      <input type="text" value={tempProfil.asalSekolah} onChange={e=>setTempProfil({...tempProfil, asalSekolah: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Nomor WhatsApp Siswa / Orang Tua</label>
                      <input type="text" value={tempProfil.telp} onChange={e=>setTempProfil({...tempProfil, telp: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-sora-navy ml-1">Alamat Tinggal Lengkap Sesuai KK</label>
                      <textarea value={tempProfil.alamat} onChange={e=>setTempProfil({...tempProfil, alamat: e.target.value})} className="w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl outline-none font-bold text-sm focus:border-sora-blue transition-all h-24 resize-none" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-2xl flex items-start gap-4 text-sora-blue border border-blue-100 mt-8">
                    <ShieldAlert size={24} className="shrink-0 mt-1"/>
                    <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">Penyimpanan perubahan biodata akan mengubah status Anda menjadi <span className="font-black">Menunggu Review</span> sampai disetujui kembali oleh pihak Tata Usaha.</p>
                  </div>

                  <button onClick={handleUpdateProfil} className="w-full bg-sora-navy text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-sora-blue transition-all shadow-xl shadow-sora-navy/20">
                    Ajukan Perubahan Biodata
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL BAYAR PAKET SPP ================= */}
      {isModalPaketOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sora-navy/60 backdrop-blur-sm" onClick={() => setIsModalPaketOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-[110] p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-sora-navy">Paket Pelunasan SPP</h3>
                <p className="text-[10px] font-bold text-sora-gray uppercase tracking-widest mt-1">Bayar Praktis, Bebas Denda</p>
              </div>
              <button onClick={() => setIsModalPaketOpen(false)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"><X size={24}/></button>
            </div>

            <div className="space-y-4">
              {/* Paket 1 Semester */}
              <div className="border border-gray-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-sora-blue transition-all group">
                <div className="mb-3 md:mb-0">
                  <p className="font-black text-sora-navy group-hover:text-sora-blue transition-colors">1 Semester (6 Bulan)</p>
                  <p className="text-xs text-gray-500 font-bold">6 x Rp 250.000</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-blue mb-2 text-lg">Rp 1.500.000</p>
                  <button onClick={() => handlePayPaket('1 Semester', 6)} className="w-full md:w-auto bg-sora-bg text-sora-blue border border-sora-blue/20 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue hover:text-white transition-all">Pilih Paket</button>
                </div>
              </div>

              {/* Paket 1 Tahun */}
              <div className="border border-gray-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-sora-blue transition-all group">
                <div className="mb-3 md:mb-0">
                  <p className="font-black text-sora-navy group-hover:text-sora-blue transition-colors">1 Tahun (12 Bulan)</p>
                  <p className="text-xs text-gray-500 font-bold">12 x Rp 250.000</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-blue mb-2 text-lg">Rp 3.000.000</p>
                  <button onClick={() => handlePayPaket('1 Tahun', 12)} className="w-full md:w-auto bg-sora-bg text-sora-blue border border-sora-blue/20 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sora-blue hover:text-white transition-all">Pilih Paket</button>
                </div>
              </div>

              {/* Paket Sampai Lulus */}
              <div className="border border-sora-green bg-sora-green/5 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sora-green text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">Paling Hemat</div>
                <div className="mb-3 md:mb-0 mt-2 md:mt-0">
                  <p className="font-black text-sora-green">Lunas Sampai Lulus</p>
                  <p className="text-xs text-gray-500 font-bold">36 Bulan Pembelajaran</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="font-black text-sora-green mb-2 text-lg">Rp 9.000.000</p>
                  <button onClick={() => handlePayPaket('Lunas Sampai Lulus', 36)} className="w-full md:w-auto bg-sora-green text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all">Pilih Paket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-sora-blue shadow-lg shadow-sora-blue/20 text-white' : 'text-gray-400 hover:text-sora-navy hover:bg-gray-50'}`}>
      {icon} {label}
    </button>
  );
}