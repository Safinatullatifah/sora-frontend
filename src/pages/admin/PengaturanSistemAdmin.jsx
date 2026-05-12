import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Settings2, Save, Globe, Phone, Mail, MapPin, Building2, Loader2 } from 'lucide-react';

export default function PengaturanSistemAdmin() {
  const [config, setConfig] = useState({
    nama_sekolah: '',
    email_kontak: '',
    telepon_kontak: '',
    alamat: '',
    is_maintenance: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/system-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setConfig({ ...config, [e.target.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/system-config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pengaturan sistem berhasil diperbarui!');
    } catch {
      alert('Gagal memperbarui pengaturan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-sora-blue" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-sora-navy">
          <Settings2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-sora-navy tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sora-gray text-sm font-medium">Konfigurasi informasi instansi dan status aplikasi.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6 md:col-span-2 border-b border-gray-100 pb-8">
            <h3 className="text-[10px] font-black text-sora-blue uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Identitas Aplikasi
            </h3>
            <div>
              <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Nama Instansi / Sekolah</label>
              <div className="relative mt-2">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="nama_sekolah"
                  value={config.nama_sekolah || ''}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all text-sm font-medium text-sora-navy" 
                  placeholder="SMK SORA Digitalization" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-sora-blue uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} /> Informasi Kontak
            </h3>
            <div>
              <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Email Resmi</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  name="email_kontak"
                  value={config.email_kontak || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all text-sm font-medium text-sora-navy" 
                  placeholder="admin@sora.com" 
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Telepon</label>
              <div className="relative mt-2">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="telepon_kontak"
                  value={config.telepon_kontak || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all text-sm font-medium text-sora-navy" 
                  placeholder="(031) 123456" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-sora-blue uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Lokasi Instansi
            </h3>
            <div>
              <label className="text-[10px] font-black text-sora-navy uppercase tracking-[0.2em] ml-1">Alamat Lengkap</label>
              <textarea 
                name="alamat"
                value={config.alamat || ''}
                onChange={handleChange}
                rows="4"
                className="w-full p-4 mt-2 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-sora-blue focus:ring-4 focus:ring-sora-blue/10 outline-none transition-all text-sm font-medium text-sora-navy resize-none" 
                placeholder="Jl. Teknologi Masa Depan No. 99..." 
              ></textarea>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <label className="flex items-center gap-4 cursor-pointer p-4 border border-gray-100 rounded-2xl bg-gray-50 w-full md:w-auto hover:bg-gray-100 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="is_maintenance"
                  checked={config.is_maintenance || false}
                  onChange={handleChange}
                  className="sr-only" 
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${config.is_maintenance ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${config.is_maintenance ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <div>
                <p className="text-xs font-black text-sora-navy uppercase tracking-widest">Mode Maintenance</p>
                <p className="text-[10px] text-sora-gray font-bold">Aktifkan untuk menutup akses siswa sementara</p>
              </div>
            </label>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full md:w-auto bg-sora-navy text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-sora-blue transition-all shadow-xl shadow-sora-navy/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Simpan Konfigurasi
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}