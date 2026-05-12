import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, Loader2 } from 'lucide-react';

export default function KalenderSiswa() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKalender = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/informasi/kalender`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data.data);
      } catch {
        console.error("Gagal memuat kalender");
      } finally {
        setIsLoading(false);
      }
    };
    fetchKalender();
  }, []);

  const getTheme = (type) => {
    switch(type) {
      case 'Ujian': return { bg: 'bg-red-50', text: 'text-red-500' };
      case 'Libur': return { bg: 'bg-green-50', text: 'text-sora-green' };
      case 'Kegiatan': return { bg: 'bg-orange-50', text: 'text-orange-500' };
      default: return { bg: 'bg-blue-50', text: 'text-sora-blue' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <CalendarDays size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy tracking-tight">Kalender Akademik</h2>
          <p className="text-sm font-medium text-gray-400 mt-1">Jadwal kegiatan belajar mengajar dan acara penting sekolah.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 flex justify-center p-10"><Loader2 className="animate-spin text-sora-blue" size={32} /></div>
        ) : events.length === 0 ? (
          <div className="col-span-2 text-center p-10 bg-white rounded-[2rem] border border-gray-100"><p className="font-bold text-gray-400">Belum ada agenda akademik.</p></div>
        ) : (
          events.map((evt) => {
            const dateObj = new Date(evt.tanggal);
            const theme = getTheme(evt.tipe);
            
            return (
              <div key={evt.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:border-sora-blue/30 hover:shadow-md transition-all group">
                <div className="flex gap-5">
                  <div className={`w-20 h-24 rounded-2xl ${theme.bg} flex flex-col items-center justify-center shrink-0 border border-white/50 shadow-inner group-hover:scale-105 transition-transform`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{dateObj.toLocaleString('id-ID', { month: 'short' })}</span>
                    <span className={`text-2xl font-black ${theme.text} my-0.5`}>{dateObj.toLocaleString('id-ID', { day: '2-digit' })}</span>
                    <span className="text-[10px] font-bold text-gray-400">{dateObj.getFullYear()}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className={`w-max px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest mb-2 ${theme.bg} ${theme.text}`}>
                      {evt.tipe}
                    </span>
                    <h3 className="text-base font-black text-sora-navy mb-1 group-hover:text-sora-blue transition-colors">{evt.judul}</h3>
                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{evt.deskripsi || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}