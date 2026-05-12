import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Activity, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogAdmin() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.data || []);
    } catch {
      toast.error("Gagal memuat log audit sistem");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-sora-navy tracking-tight">Log Audit Sistem</h1>
          <p className="text-sora-gray text-sm font-medium">Pantau seluruh riwayat aktivitas administrator.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari aksi atau email admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
              <tr>
                <th className="p-6">Waktu</th>
                <th className="p-6">Administrator</th>
                <th className="p-6">Aksi</th>
                <th className="p-6">Detail Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="p-6 bg-gray-50/20 h-20"></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-sora-bg/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-sora-gray">
                        <Clock size={14} className="text-sora-blue" />
                        {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-sora-blue">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-black text-sora-navy">{log.admin?.email || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 bg-sora-navy/5 text-sora-navy rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center w-fit gap-1.5">
                        <Activity size={12} />
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6 text-xs text-sora-gray font-bold max-w-sm truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-sm font-bold text-gray-400">
                    Tidak ada data log yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}