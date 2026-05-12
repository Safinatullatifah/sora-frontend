import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { TrendingUp, CreditCard, UserCheck, Megaphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5 text-left transition-transform hover:scale-105 print:hidden">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-lg shrink-0`}>{icon}</div>
      <div className="overflow-hidden">
        <p className="text-[9px] md:text-[10px] font-black text-sora-gray uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg md:text-xl font-black text-sora-navy truncate">{value}</p>
        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 italic truncate">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  const { dataSiswa, broadcasts } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    };
    fetchDashboardStats();
  }, []);

  const formatCompactCurrency = (value) => {
    if (!value) return 'Rp 0';
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (!dataSiswa || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-sora-blue" size={32} />
      </div>
    );
  }

  const monthlyData = stats.invoices?.monthly_revenue || Array(12).fill(0);
  const maxRevenue = Math.max(...monthlyData, 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<TrendingUp size={20}/>} 
          label="Arus Kas Lunas" 
          value={formatCompactCurrency(stats.invoices.total_paid)} 
          sub="Total Terkumpul" 
          color="bg-sora-blue" 
        />
        <StatCard 
          icon={<CreditCard size={20}/>} 
          label="Tunggakan" 
          value={formatCompactCurrency(stats.invoices.total_unpaid)} 
          sub="Pending Payment" 
          color="bg-red-500" 
        />
        <StatCard 
          icon={<UserCheck size={20}/>} 
          label="Siswa Aktif" 
          value={dataSiswa.filter(s => s.statusSiswa === 'Aktif').length} 
          sub="Terdaftar" 
          color="bg-sora-green" 
        />
        <StatCard 
          icon={<Megaphone size={20}/>} 
          label="Broadcast" 
          value={broadcasts.length} 
          sub="Terkirim" 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
           <h3 className="text-base md:text-lg font-black text-sora-navy uppercase tracking-widest mb-6 md:mb-8 min-w-[300px]">Grafik Arus Kas Tahun Ini</h3>
           <div className="flex items-end justify-between h-40 md:h-48 gap-2 md:gap-4 px-2 md:px-4 min-w-[400px]">
              {monthlyData.map((val, i) => {
                const heightPercent = (val / maxRevenue) * 100;
                return (
                  <div 
                    key={i} 
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
                    title={`Rp ${val.toLocaleString('id-ID')}`}
                  >
                    <div className="w-full bg-sora-bg rounded-t-xl relative overflow-hidden h-full flex items-end">
                      <div 
                        className="w-full bg-sora-blue group-hover:bg-sora-navy transition-all rounded-t-xl duration-500" 
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 italic uppercase tracking-widest">
                      {monthNames[i]}
                    </span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="lg:col-span-1 bg-sora-navy p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden min-h-[200px]">
          <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 relative z-10">Selamat Datang di SORA!</h3>
          <p className="text-sora-cyan/80 text-xs md:text-sm font-medium relative z-10 mb-6 md:mb-8">Pantau arus kas, tagihan, dan pengumuman dengan mudah.</p>
          <button onClick={() => navigate('/admin/laporan')} className="w-max bg-sora-blue text-white px-6 py-3 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:scale-105 transition-transform shadow-lg">
            Lihat Rekapitulasi
          </button>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 md:w-48 md:h-48 bg-sora-blue/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}