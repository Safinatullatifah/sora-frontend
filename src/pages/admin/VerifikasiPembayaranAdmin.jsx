import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function VerifikasiPembayaranAdmin() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/invoices/transactions/manual/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.data);
    } catch {
      alert("Gagal memuat data transaksi manual.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/invoices/transactions/${selectedTx.id}/verify`,
        { action: actionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsActionOpen(false);
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || `Gagal memproses transaksi.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAction = (tx, type) => {
    setSelectedTx(tx);
    setActionType(type);
    setIsActionOpen(true);
  };

  const openFileSafe = (base64Data) => {
    try {
      if (!base64Data) {
        alert("Bukti transfer tidak tersedia.");
        return;
      }
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
      alert("Gagal memuat bukti transfer. Format tidak didukung.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-sora-blue/10 p-3 rounded-2xl text-sora-blue">
          <CreditCard size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-sora-navy">Konfirmasi Transfer Manual</h2>
          <p className="text-sm font-bold text-gray-400">Verifikasi bukti pembayaran yang diunggah siswa</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-xl shadow-sora-blue/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Detail Tagihan</TableHead>
              <TableHead>Nominal Transfer</TableHead>
              <TableHead>Tanggal Kirim</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center font-bold text-gray-400 py-8">Memuat data...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center font-bold text-gray-400 py-8">Tidak ada transaksi manual menunggu konfirmasi</TableCell></TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-bold text-sora-navy">{tx.invoice?.student?.nama_lengkap}</div>
                    <div className="text-xs text-gray-500 font-bold">{tx.invoice?.student?.nisn}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-bold">{tx.invoice?.judul_tagihan}</div>
                    <Badge variant="outline" className="mt-1">{tx.invoice?.jenis_tagihan}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-sora-blue">
                    Rp {tx.jumlah_bayar?.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedTx(tx); setIsDetailOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" /> Struk
                    </Button>
                    <Button size="sm" className="bg-sora-green hover:bg-sora-green/80 text-white" onClick={() => openAction(tx, 'accept')}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openAction(tx, 'reject')}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-sora-navy bg-gray-50 p-4 rounded-xl border">
              <div className="text-gray-500">Nama Siswa:</div>
              <div className="text-right">{selectedTx?.invoice?.student?.nama_lengkap}</div>
              <div className="text-gray-500">Tagihan:</div>
              <div className="text-right">{selectedTx?.invoice?.judul_tagihan}</div>
              <div className="text-gray-500">Nominal:</div>
              <div className="text-right text-sora-blue font-black">Rp {selectedTx?.jumlah_bayar?.toLocaleString('id-ID')}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-white hover:border-sora-blue transition-all cursor-pointer group" onClick={() => openFileSafe(selectedTx?.bukti_transfer_url)}>
                <div className="flex items-center gap-3">
                  <FileText className="text-sora-blue group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-bold text-sora-navy">Bukti Transfer</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Klik untuk melihat</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-sora-blue">Buka</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={actionType === 'accept' ? 'text-sora-green' : 'text-red-500'}>
              {actionType === 'accept' ? 'Konfirmasi Pembayaran Lunas?' : 'Tolak Bukti Transfer?'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm font-bold text-sora-gray">
            {actionType === 'accept' 
              ? 'Tindakan ini akan mengubah status tagihan menjadi LUNAS dan tidak dapat dibatalkan dengan mudah.' 
              : 'Tindakan ini akan mengembalikan status tagihan menjadi BELUM BAYAR. Siswa harus mengunggah ulang struk yang benar.'}
          </div>
          <form onSubmit={handleAction} className="mt-6">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsActionOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className={actionType === 'accept' ? 'bg-sora-green hover:bg-sora-green/80 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}>
                {isSubmitting ? 'Memproses...' : 'Ya, Lanjutkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}