import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2, Calendar, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function BroadcastAdmin() {
  const [pengumuman, setPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ judul: '', pesan: '', tipe: 'Informasi' });

  const fetchPengumuman = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/informasi/broadcast`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengumuman(res.data.data);
    } catch {
      alert("Gagal memuat data pengumuman");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/informasi/broadcast`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setForm({ judul: '', pesan: '', tipe: 'Informasi' });
      fetchPengumuman();
    } catch {
      alert("Gagal menambahkan pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/informasi/broadcast/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPengumuman();
    } catch {
      alert("Gagal menghapus pengumuman");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
            <Megaphone size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-sora-navy">Broadcast Pengumuman</h2>
            <p className="text-sm font-bold text-gray-400">Kelola informasi yang akan tampil di portal siswa</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-sora-navy hover:bg-sora-blue text-white rounded-xl shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Buat Pengumuman
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 font-bold text-gray-400">Memuat data...</div>
        ) : pengumuman.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[2rem] border border-gray-100 font-bold text-gray-400">Belum ada pengumuman yang dibuat.</div>
        ) : (
          pengumuman.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 md:gap-6 relative group hover:border-sora-blue/30 transition-all">
              <div className={`hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0 ${item.tipe === 'Penting' ? 'bg-red-50 text-red-500' : 'bg-sora-blue/10 text-sora-blue'}`}>
                {item.tipe === 'Penting' ? <Bell size={24} /> : <Megaphone size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${item.tipe === 'Penting' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-sora-blue'}`}>
                    {item.tipe}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Calendar size={12}/> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-sora-navy mb-2">{item.judul}</h3>
                <p className="text-sm font-medium text-gray-500 whitespace-pre-wrap">{item.pesan}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Pengumuman Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Judul Pengumuman</Label>
              <Input required value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} placeholder="Misal: Info Ujian Semester" />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={form.tipe} onValueChange={val => setForm({...form, tipe: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Tipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Informasi">Informasi (Biru)</SelectItem>
                  <SelectItem value="Penting">Penting (Merah)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Isi Pesan</Label>
              <Textarea required value={form.pesan} onChange={e => setForm({...form, pesan: e.target.value})} placeholder="Ketik isi pengumuman di sini..." rows={5} />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-sora-navy hover:bg-sora-blue text-white">
                {isSubmitting ? 'Menyimpan...' : 'Kirim Broadcast'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}