import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, Eye, Edit3, Trash2, Plus, Receipt, X, Printer, Mail, GraduationCap } from 'lucide-react';

export default function DataSiswaAdmin() {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterStatusSiswa, setFilterStatusSiswa] = useState('Semua');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [selectedSiswa, setSelectedSiswa] = useState(null); 
  const [formSiswa, setFormSiswa] = useState({ id: null, nisn: '', nama: '', kelas: '', telp: '', statusSiswa: 'Aktif' });
  const [isModalSiswaOpen, setIsModalSiswaOpen] = useState(false);

  const [isModalMassalOpen, setIsModalMassalOpen] = useState(false);
  const [formMassal, setFormMassal] = useState({ targetKelas: 'Semua', namaTagihan: '', nominal: '', kategori: 'SPP', isSemester: false });

  const [dataPrintStruk, setDataPrintStruk] = useState(null);
  const [dataPrintTanggungan, setDataPrintTanggungan] = useState(null);

  const getAuthHeaders = useCallback(() => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }, []);

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
        statusSiswa: 'Aktif',
        tagihan: item.invoices ? item.invoices.map(inv => ({
          id: inv.id,
          nama: inv.judul_tagihan,
          kategori: inv.bulan,
          nominal: inv.nominal,
          status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar'
        })) : [],
        emailOrtu: item.user?.email || ''
      }));
      
      setDataSiswa(mappedData);
      setTotalPages(response.data.meta.total_pages);
    } catch {
      console.error("Gagal memuat data siswa");
    }
  }, [currentPage, itemsPerPage, searchQuery, getAuthHeaders]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchStudents]);

  const handleSelectSiswa = async (siswa) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students/${siswa.id}`, getAuthHeaders());
      const item = res.data.data;
      setSelectedSiswa({
        id: item.id,
        nisn: item.nisn,
        nama: item.nama_lengkap,
        kelas: item.kelas,
        statusSiswa: 'Aktif',
        tagihan: item.invoices ? item.invoices.map(inv => ({
          id: inv.id,
          nama: inv.judul_tagihan,
          kategori: inv.bulan,
          nominal: inv.nominal,
          status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar'
        })) : [],
        emailOrtu: item.user?.email || ''
      });
    } catch {
      alert("Gagal mengambil detail siswa");
    }
  };

  const handleSaveSiswa = async () => {
    if (!formSiswa.nisn || !formSiswa.nama) return;

    try {
      if (formSiswa.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/students/${formSiswa.id}`, {
          nisn: formSiswa.nisn,
          nama_lengkap: formSiswa.nama,
          kelas: formSiswa.kelas
        }, getAuthHeaders());
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
          email: `${formSiswa.nisn}@sora.com`,
          password: 'password123',
          nisn: formSiswa.nisn,
          nama_lengkap: formSiswa.nama,
          kelas: formSiswa.kelas
        });
      }
      setIsModalSiswaOpen(false);
      fetchStudents();
      if (selectedSiswa?.id === formSiswa.id) handleSelectSiswa(formSiswa);
    } catch {
      alert("Gagal menyimpan data siswa");
    }
  };

  const handleDeleteSiswa = async (id) => {
    if (window.confirm('Hapus siswa ini dari sistem?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/students/${id}`, getAuthHeaders());
        if (selectedSiswa?.id === id) setSelectedSiswa(null);
        fetchStudents();
      } catch {
        alert("Gagal menghapus siswa");
      }
    }
  };

  const openModalSiswa = (siswa = null) => {
    if (siswa) setFormSiswa({ ...siswa });
    else setFormSiswa({ id: null, nisn: '', nama: '', kelas: '', telp: '', statusSiswa: 'Aktif' });
    setIsModalSiswaOpen(true);
  };

  const handleGenerateTagihanMassal = async () => {
    if (!formMassal.namaTagihan || !formMassal.nominal) return;

    try {
      const nominalAkhir = formMassal.isSemester ? parseInt(formMassal.nominal, 10) * 6 : parseInt(formMassal.nominal, 10);
      const namaAkhir = formMassal.isSemester ? `${formMassal.namaTagihan} (1 Semester)` : formMassal.namaTagihan;

      await axios.post(`${import.meta.env.VITE_API_URL}/invoices/massal`, {
        targetKelas: formMassal.targetKelas,
        judul_tagihan: namaAkhir,
        bulan: formMassal.kategori,
        nominal: nominalAkhir
      }, getAuthHeaders());

      alert("Tagihan massal berhasil di-generate");
      setIsModalMassalOpen(false);
      fetchStudents();
    } catch {
      alert("Gagal membuat tagihan massal");
    }
  };

  const handleEmailOrtu = async (siswa, tagihan) => {
    if (!siswa.emailOrtu || siswa.emailOrtu === '-') return;
  
    const isConfirm = window.confirm(`Kirim pengingat tagihan ke ${siswa.emailOrtu}?`);
    if (!isConfirm) return;
  
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/email/tagihan-ortu`, 
        {
          emailOrtu: siswa.emailOrtu,
          namaSiswa: siswa.nama,
          nominal: tagihan.nominal,
          bulan: tagihan.nama
        },
        getAuthHeaders()
      );
      alert("Email pengingat berhasil dikirim!");
    } catch {
      alert("Gagal mengirim email pengingat.");
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

  const filteredList = useMemo(() => {
    return dataSiswa.filter(s => {
      const klsPrefix = s.kelas ? s.kelas.split(" ")[0] : ""; 
      const isNunggak = s.tagihan.some(t => t.status === 'Belum Bayar');
      return (filterKelas === 'Semua' || klsPrefix === filterKelas) && 
             (filterStatus === 'Semua' || (filterStatus === 'Belum Lunas' ? isNunggak : !isNunggak)) &&
             (filterStatusSiswa === 'Semua' || s.statusSiswa === filterStatusSiswa);
    });
  }, [dataSiswa, filterKelas, filterStatus, filterStatusSiswa]);

  if (dataPrintStruk) {
    return (
      <div className="bg-white text-black p-10 min-h-screen font-sans">
        <div className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 p-10 rounded-3xl">
          <div className="flex justify-between items-center border-b-2 border-gray-200 pb-6 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest">SMK SORA Digitalization</h1>
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
          <h1 className="text-3xl font-black uppercase tracking-widest">SMK SORA Digitalization</h1>
          <p className="text-sm">Jl. Teknologi Masa Depan No. 99 | Telp: (031) 123456</p>
        </div>
        <h2 className="text-xl font-bold underline uppercase text-center mb-8">Surat Keterangan Rincian Tanggungan</h2>
        <div className="text-base mb-8">
          <p>Kepala Tata Usaha menerangkan bahwa:</p>
          <table className="ml-4 mt-2 font-bold"><tbody>
            <tr><td className="w-40">Nama</td><td>: {dataPrintTanggungan.nama}</td></tr>
            <tr><td>NISN / Kelas</td><td>: {dataPrintTanggungan.nisn} / {dataPrintTanggungan.kelas}</td></tr>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 print:hidden">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <Search className="text-gray-400" size={16}/>
            <input type="text" placeholder="Cari Nama/NISN..." className="w-full text-xs outline-none bg-transparent" onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}}/>
          </div>
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <select value={filterStatusSiswa} onChange={e=>{setFilterStatusSiswa(e.target.value); setCurrentPage(1);}} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none border"><option value="Semua">Semua Status</option><option value="Aktif">Aktif</option><option value="Keluar">Keluar / Lulus</option></select>
          <select value={filterKelas} onChange={e=>{setFilterKelas(e.target.value); setCurrentPage(1);}} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none border"><option value="Semua">Semua Kelas</option><option value="X">Kelas X</option><option value="XI">Kelas XI</option></select>
          <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setCurrentPage(1);}} className="text-[10px] font-bold text-sora-navy bg-sora-bg p-2 rounded-lg outline-none border"><option value="Semua">Bayar: Semua</option><option value="Belum Lunas">Belum Lunas</option><option value="Lunas">Lunas</option></select>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex gap-2 justify-end bg-gray-50/50">
            <button onClick={() => setIsModalMassalOpen(true)} className="bg-sora-bg border border-sora-blue/20 text-sora-blue px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sora-blue hover:text-white transition-all"><Receipt size={14}/> Massal</button>
            <button onClick={() => openModalSiswa()} className="bg-sora-blue text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sora-navy transition-all shadow-lg"><Plus size={14}/> Tambah</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
                <tr><th className="p-6">Siswa</th><th className="p-6">Kelas & Status</th><th className="p-6">Tunggakan</th><th className="p-6 text-center">Aksi</th></tr>
              </thead>
              <tbody>
                {filteredList.map(s => {
                  const nunggak = s.tagihan.filter(t => t.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.nominal, 0);
                  return (
                    <tr key={s.id} className={`border-b transition-all ${s.statusSiswa !== 'Aktif' ? 'bg-gray-50/50 opacity-70' : 'hover:bg-sora-bg/30'}`}>
                      <td className="p-6"><p className="font-black text-sora-navy">{s.nama}</p><p className="text-[10px] text-gray-400 font-mono">NISN: {s.nisn}</p></td>
                      <td className="p-6"><p className="text-xs font-bold text-sora-gray mb-1">{s.kelas}</p><span className={`px-2 py-1 rounded text-[9px] font-bold ${s.statusSiswa==='Aktif'?'bg-sora-green/10 text-sora-green':'bg-red-50 text-red-500'}`}>{s.statusSiswa}</span></td>
                      <td className="p-6 text-xs font-black text-red-500">{nunggak > 0 ? `Rp ${nunggak.toLocaleString('id-ID')}` : <span className="text-sora-green">Lunas</span>}</td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleSelectSiswa(s)} className="p-2 text-sora-blue hover:bg-sora-blue/10 rounded-lg"><Eye size={18}/></button>
                          <button onClick={() => openModalSiswa(s)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Edit3 size={18}/></button>
                          <button onClick={() => handleDeleteSiswa(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-between items-center bg-gray-50 border-t">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded-lg text-xs font-bold text-gray-500 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        {selectedSiswa ? (
          <div className="bg-white rounded-[2.5rem] border border-sora-blue/30 shadow-xl p-8 sticky top-0">
            <div className="flex justify-between items-start mb-4">
              <div><p className="text-[10px] font-black text-sora-blue uppercase tracking-widest">Detail Keuangan</p><h3 className="text-xl font-black text-sora-navy">{selectedSiswa.nama}</h3></div>
              <button onClick={() => setSelectedSiswa(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><X size={20}/></button>
            </div>
            <button onClick={() => handleCetakTanggungan(selectedSiswa)} className="w-full mb-6 bg-sora-navy text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sora-blue shadow-md"><Printer size={16}/> Cetak Rekap Tanggungan</button>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedSiswa.tagihan.length > 0 ? selectedSiswa.tagihan.map(t => (
                <div key={t.id} className={`p-4 border rounded-2xl ${t.status === 'Lunas' ? 'bg-sora-green/5 border-sora-green/20' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.kategori}</p><p className="text-xs font-bold text-sora-navy">{t.nama}</p></div>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${t.status === 'Lunas' ? 'bg-sora-green/20 text-sora-green' : 'bg-red-100 text-red-500'}`}>{t.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                    <span className="font-black text-sora-blue">Rp {t.nominal.toLocaleString('id-ID')}</span>
                    {t.status === 'Lunas' && (<button onClick={() => handleCetakStruk(selectedSiswa, t)} className="text-[9px] flex items-center gap-1 font-black text-sora-green bg-white border border-sora-green px-2 py-1 rounded hover:bg-sora-green hover:text-white transition-all"><Printer size={12}/> Struk</button>)}
                  </div>
                  {t.status === 'Belum Bayar' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-dashed">
                      <button onClick={() => handleEmailOrtu(selectedSiswa, t)} className="flex-1 bg-white border text-sora-gray p-2 rounded-lg text-[9px] font-black uppercase hover:text-sora-blue flex justify-center gap-1"><Mail size={12}/> Email Ortu</button>
                      <button className="flex-1 bg-orange-500 text-white p-2 rounded-lg text-[9px] font-black uppercase hover:bg-orange-600 flex justify-center gap-1"><GraduationCap size={12}/> Beasiswa</button>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-center text-xs font-bold text-gray-400 mt-10">Belum ada data tagihan</p>
              )}
            </div>
          </div>
        ) : (<div className="h-full border-2 border-dashed rounded-[2.5rem] flex items-center justify-center text-gray-400 text-xs font-bold text-center p-10">Pilih siswa<br/>untuk melihat rincian.</div>)}
      </div>

      {isModalSiswaOpen && (
        <div className="fixed inset-0 bg-sora-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg">
            <h3 className="text-2xl font-black mb-6">{formSiswa.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">NISN</label>
                <input type="text" value={formSiswa.nisn} onChange={e=>setFormSiswa({...formSiswa, nisn: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                <input type="text" value={formSiswa.nama} onChange={e=>setFormSiswa({...formSiswa, nama: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Kelas</label>
                <input type="text" value={formSiswa.kelas} onChange={e=>setFormSiswa({...formSiswa, kelas: e.target.value})} className="w-full p-4 mt-2 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 border border-transparent transition-all text-sm font-medium" placeholder="Contoh: X RPL 1"/>
              </div>
            </div>
            <button onClick={handleSaveSiswa} className="w-full bg-sora-navy text-white py-4 rounded-xl mt-8 font-black uppercase tracking-widest text-[10px] hover:bg-sora-blue transition-all">SIMPAN DATA</button>
            <button onClick={()=>setIsModalSiswaOpen(false)} className="w-full bg-gray-100 text-sora-navy py-4 rounded-xl mt-3 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">BATAL</button>
          </div>
        </div>
      )}
      
      {isModalMassalOpen && (
        <div className="fixed inset-0 bg-sora-navy/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md">
            <h3 className="text-2xl font-black mb-4">Tagihan Massal</h3>
            <input type="text" placeholder="Nama Tagihan" onChange={e=>setFormMassal({...formMassal, namaTagihan: e.target.value})} className="w-full p-4 bg-gray-50 mb-2 rounded-xl outline-none focus:border-sora-blue border border-transparent"/>
            <input type="number" placeholder="Nominal" onChange={e=>setFormMassal({...formMassal, nominal: e.target.value})} className="w-full p-4 bg-gray-50 mb-4 rounded-xl outline-none focus:border-sora-blue border border-transparent"/>
            <button onClick={handleGenerateTagihanMassal} className="w-full bg-sora-navy text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-sora-blue transition-all">GENERATE TAGIHAN</button>
            <button onClick={()=>setIsModalMassalOpen(false)} className="w-full bg-gray-100 text-sora-navy py-4 rounded-xl mt-2 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">BATAL</button>
          </div>
        </div>
      )}
    </div>
  );
}