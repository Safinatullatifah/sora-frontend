import { useAdmin } from '../../context/AdminContext';
import { TrendingUp, CreditCard, UserCheck, Megaphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 text-left transition-transform hover:scale-105 print:hidden">
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-lg`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-sora-navy">{value}</p>
        <p className="text-[9px] font-bold text-gray-400 italic">{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardAdmin() {
  const { rekapKeuangan, dataSiswa, broadcasts } = useAdmin();
  const navigate = useNavigate();

  // Helper untuk format Rupiah ringkas (Juta/Miliar)
  const formatCompactCurrency = (value) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (!dataSiswa) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-sora-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp/>} 
          label="Arus Kas (Lunas)" 
          value={formatCompactCurrency(rekapKeuangan.totalLunas)} 
          sub="Total Terkumpul" 
          color="bg-sora-blue" 
        />
        <StatCard 
          icon={<CreditCard/>} 
          label="Tunggakan" 
          value={formatCompactCurrency(rekapKeuangan.totalNunggak)} 
          sub="Pending Payment" 
          color="bg-red-500" 
        />
        <StatCard 
          icon={<UserCheck/>} 
          label="Siswa Aktif" 
          value={dataSiswa.filter(s => s.statusSiswa === 'Aktif').length} 
          sub="Terdaftar" 
          color="bg-sora-green" 
        />
        <StatCard 
          icon={<Megaphone/>} 
          label="Broadcast" 
          value={broadcasts.length} 
          sub="Terkirim" 
          color="bg-orange-500" 
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-lg font-black text-sora-navy uppercase tracking-widest mb-8">Grafik Arus Kas Bulanan</h3>
           <div className="flex items-end justify-between h-48 gap-4 px-4">
              {/* Data Grafik Statis (Bisa diubah jadi dinamis nanti jika ada API riwayat transaksi) */}
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
          <button onClick={() => navigate('/admin/laporan')} className="bg-sora-blue text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 hover:scale-105 transition-transform">Lihat Rekapitulasi</button>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sora-blue/30 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}