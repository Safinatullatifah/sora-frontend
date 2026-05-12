import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function VerifikasiPendaftaranAdmin() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [password, setPassword] = useState('');
  const [alasan, setAlasan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/registrations?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(res.data.data);
    } catch {
      alert("Gagal memuat data pendaftaran.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = `${import.meta.env.VITE_API_URL}/registrations/${selectedReg.id}/${actionType}`;
      const payload = actionType === 'accept' ? { password } : { alasan };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsActionOpen(false);
      setPassword('');
      setAlasan('');
      fetchRegistrations();
    } catch (error) {
      alert(error.response?.data?.message || `Gagal melakukan ${actionType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAction = (reg, type) => {
    setSelectedReg(reg);
    setActionType(type);
    setIsActionOpen(true);
  };

  const openFileSafe = (base64Data) => {
    try {
      const arr = base64Data.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) throw new Error("Format tidak valid");
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const blob = new Blob([u8arr], {type: mime});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      alert("Gagal memuat berkas. Format tidak didukung atau berkas rusak.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <UserCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy">Verifikasi PPDB</h2>
          <p className="text-sm font-bold text-gray-400">Kelola persetujuan pendaftaran calon siswa baru</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-xl shadow-sora-blue/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Calon Siswa</TableHead>
              <TableHead>NISN / Email</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center font-bold text-gray-400 py-8">Memuat data...</TableCell></TableRow>
            ) : registrations.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center font-bold text-gray-400 py-8">Tidak ada pendaftar menunggu verifikasi</TableCell></TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-bold text-sora-navy">{reg.nama_lengkap}</TableCell>
                  <TableCell>
                    <div className="text-sm font-bold">{reg.nisn}</div>
                    <div className="text-xs text-gray-400">{reg.email}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{reg.jurusan}</Badge></TableCell>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">PENDING</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedReg(reg); setIsDetailOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" /> Detail
                    </Button>
                    <Button size="sm" className="bg-sora-green hover:bg-sora-green/80 text-white" onClick={() => openAction(reg, 'accept')}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openAction(reg, 'reject')}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pendaftar: {selectedReg?.nama_lengkap}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm font-bold text-sora-navy mb-4">
            <div>NISN: <span className="text-gray-500">{selectedReg?.nisn}</span></div>
            <div>Email: <span className="text-gray-500">{selectedReg?.email}</span></div>
            <div>Jurusan: <span className="text-gray-500">{selectedReg?.jurusan}</span></div>
            <div>No HP Ortu: <span className="text-gray-500">{selectedReg?.hp_orang_tua}</span></div>
          </div>
          <div className="space-y-2">
            <Label>Berkas Terlampir</Label>
            <div className="grid grid-cols-2 gap-4">
              {selectedReg?.berkas_url?.length > 0 ? selectedReg.berkas_url.map((file, idx) => (
                <div key={idx} className="border p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-sora-blue flex-shrink-0" />
                    <span className="text-xs truncate font-bold">Berkas_{idx + 1}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-sora-blue" onClick={() => openFileSafe(file)}>Buka</Button>
                </div>
              )) : (
                <span className="text-sm text-gray-400">Tidak ada berkas diunggah.</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={actionType === 'accept' ? 'text-sora-green' : 'text-red-500'}>
              {actionType === 'accept' ? 'Terima Pendaftar' : 'Tolak Pendaftar'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAction} className="space-y-4 mt-4">
            {actionType === 'accept' ? (
              <div className="space-y-2">
                <Label>Buatkan Password Akun Siswa</Label>
                <Input required type="text" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Alasan Penolakan</Label>
                <Textarea required placeholder="Misal: Berkas tidak lengkap..." value={alasan} onChange={e => setAlasan(e.target.value)} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsActionOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className={actionType === 'accept' ? 'bg-sora-green hover:bg-sora-green/80 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}>
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}