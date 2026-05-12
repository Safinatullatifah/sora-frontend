import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MasterDataAdmin() {
  const [data, setData] = useState({ majors: [], grades: [], years: [] });
  const [newMajor, setNewMajor] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', desc: '', action: null });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/master`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch {
      toast.error("Gagal memuat data master");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (type, value, setter) => {
    if (!value) {
      toast.error("Input tidak boleh kosong");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/master/${type}`, 
        type === 'year' ? { year: value } : { name: value }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setter('');
      toast.success(`Data master berhasil ditambahkan`);
      fetchData();
    } catch (error) {
      toast.error("Gagal menambah data", { description: error.response?.data?.message || "Terjadi kesalahan sistem" });
    }
  };

  const executeDelete = async (type, id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/master/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data master");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleDelete = (type, id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Data",
      desc: "Apakah Anda yakin ingin menghapus data master ini? Penghapusan ini tidak dapat dibatalkan.",
      action: () => executeDelete(type, id)
    });
  };

  const handleActivateYear = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/master/year/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Tahun ajaran berhasil diaktifkan");
      fetchData();
    } catch {
      toast.error("Gagal mengaktifkan tahun ajaran");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Memuat Data Master...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <Database size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy">Manajemen Data Master</h2>
          <p className="text-sm font-bold text-gray-400">Kelola referensi Jurusan, Kelas, dan Tahun Ajaran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-sora-navy uppercase tracking-widest mb-4">Daftar Jurusan</h3>
          <div className="flex gap-2 mb-6">
            <Input placeholder="Nama Jurusan" value={newMajor} onChange={e => setNewMajor(e.target.value)} />
            <Button onClick={() => handleAdd('major', newMajor, setNewMajor)} className="bg-sora-navy"><Plus size={18}/></Button>
          </div>
          <div className="space-y-2">
            {data.majors.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-transparent hover:border-sora-blue/20 transition-all">
                <span className="text-xs font-bold text-sora-navy">{m.name}</span>
                <button onClick={() => handleDelete('major', m.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-sora-navy uppercase tracking-widest mb-4">Daftar Kelas</h3>
          <div className="flex gap-2 mb-6">
            <Input placeholder="Contoh: 10 IPA 1" value={newGrade} onChange={e => setNewGrade(e.target.value)} />
            <Button onClick={() => handleAdd('grade', newGrade, setNewGrade)} className="bg-sora-navy"><Plus size={18}/></Button>
          </div>
          <div className="space-y-2">
            {data.grades.map(g => (
              <div key={g.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-transparent hover:border-sora-blue/20 transition-all">
                <span className="text-xs font-bold text-sora-navy">{g.name}</span>
                <button onClick={() => handleDelete('grade', g.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-sora-navy uppercase tracking-widest mb-4">Tahun Ajaran</h3>
          <div className="flex gap-2 mb-6">
            <Input placeholder="2026/2027" value={newYear} onChange={e => setNewYear(e.target.value)} />
            <Button onClick={() => handleAdd('year', newYear, setNewYear)} className="bg-sora-navy"><Plus size={18}/></Button>
          </div>
          <div className="space-y-2">
            {data.years.map(y => (
              <div key={y.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${y.is_active ? 'bg-blue-50 border-sora-blue/30' : 'bg-gray-50 border-transparent'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sora-navy">{y.year}</span>
                  {y.is_active && <Badge className="bg-sora-blue text-[8px] h-4">AKTIF</Badge>}
                </div>
                <div className="flex gap-2">
                  {!y.is_active && <button onClick={() => handleActivateYear(y.id)} className="text-gray-300 hover:text-sora-blue"><CheckCircle2 size={14}/></button>}
                  <button onClick={() => handleDelete('year', y.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, isOpen: false })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.desc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDialog.action}>
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}