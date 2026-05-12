import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Bell, Calendar, Loader2 } from 'lucide-react';

export default function PengumumanSiswa() {
  const [pengumuman, setPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/informasi/broadcast`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPengumuman(res.data.data);
      } catch {
        console.error("Gagal memuat pengumuman");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <Megaphone size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy tracking-tight">Pengumuman Sekolah</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Informasi dan berita terbaru dari administrasi sekolah.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-sora-blue" size={32} /></div>
        ) : pengumuman.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-[2rem] border border-gray-100"><p className="font-bold text-gray-400">Belum ada pengumuman saat ini.</p></div>
        ) : (
          pengumuman.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-sora-blue/30 transition-all flex flex-col md:flex-row gap-4 md:gap-6 group">
              <div className={`hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.tipe === 'Penting' ? 'bg-red-50 text-red-500' : 'bg-sora-blue/10 text-sora-blue'}`}>
                {item.tipe === 'Penting' ? <Bell size={24} /> : <Megaphone size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${item.tipe === 'Penting' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-sora-blue'}`}>
                    {item.tipe || 'Informasi'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Calendar size={12}/> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-sora-navy mb-2">{item.judul}</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-wrap">{item.pesan}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}