import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function KalenderAdmin() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ judul: '', deskripsi: '', tipe: 'Akademik', tanggal: '' });

  const fetchKalender = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/informasi/kalender`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data.data);
    } catch {
      alert("Gagal memuat data kalender");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchKalender(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/informasi/kalender`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setForm({ judul: '', deskripsi: '', tipe: 'Akademik', tanggal: '' });
      fetchKalender();
    } catch {
      alert("Gagal menambahkan agenda kalender");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus agenda ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/informasi/kalender/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKalender();
    } catch {
      alert("Gagal menghapus agenda");
    }
  };

  const getTheme = (type) => {
    switch(type) {
      case 'Ujian': return { bg: 'bg-red-50', text: 'text-red-500' };
      case 'Libur': return { bg: 'bg-green-50', text: 'text-sora-green' };
      case 'Kegiatan': return { bg: 'bg-orange-50', text: 'text-orange-500' };
      default: return { bg: 'bg-blue-50', text: 'text-sora-blue' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
            <CalendarDays size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-sora-navy">Kalender Akademik</h2>
            <p className="text-sm font-bold text-gray-400">Kelola jadwal kegiatan dan agenda sekolah</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-sora-navy hover:bg-sora-blue text-white rounded-xl shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Tambah Agenda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10 font-bold text-gray-400">Memuat data...</div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-[2rem] border border-gray-100 font-bold text-gray-400">Belum ada agenda yang dibuat.</div>
        ) : (
          events.map((evt) => {
            const dateObj = new Date(evt.tanggal);
            const theme = getTheme(evt.tipe);
            return (
              <div key={evt.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:border-sora-blue/30 hover:shadow-md transition-all group relative">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(evt.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 z-10 w-8 h-8">
                  <Trash2 size={16} />
                </Button>
                <div className="flex gap-4">
                  <div className={`w-16 h-20 rounded-2xl ${theme.bg} flex flex-col items-center justify-center shrink-0 border border-white/50 shadow-inner group-hover:scale-105 transition-transform`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme.text}`}>{dateObj.toLocaleString('id-ID', { month: 'short' })}</span>
                    <span className={`text-xl font-black ${theme.text} my-0.5`}>{dateObj.toLocaleString('id-ID', { day: '2-digit' })}</span>
                  </div>
                  <div className="flex flex-col justify-center pr-6">
                    <span className={`w-max px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1.5 ${theme.bg} ${theme.text}`}>
                      {evt.tipe}
                    </span>
                    <h3 className="text-sm font-black text-sora-navy mb-1 group-hover:text-sora-blue transition-colors line-clamp-1">{evt.judul}</h3>
                    <p className="text-xs font-medium text-gray-500 line-clamp-2">{evt.deskripsi || '-'}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Agenda Kalender</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tanggal Agenda</Label>
              <Input required type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Judul Agenda</Label>
              <Input required value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} placeholder="Misal: Ujian Tengah Semester" />
            </div>
            <div className="space-y-2">
              <Label>Kategori/Tipe</Label>
              <Select value={form.tipe} onValueChange={val => setForm({...form, tipe: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Akademik">Akademik (Biru)</SelectItem>
                  <SelectItem value="Ujian">Ujian (Merah)</SelectItem>
                  <SelectItem value="Libur">Libur (Hijau)</SelectItem>
                  <SelectItem value="Kegiatan">Kegiatan (Oranye)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Opsional)</Label>
              <Textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} placeholder="Keterangan singkat..." rows={3} />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-sora-navy hover:bg-sora-blue text-white">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}