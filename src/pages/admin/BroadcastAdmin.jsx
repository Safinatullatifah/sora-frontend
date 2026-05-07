import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle2, Megaphone, FileText, X, Paperclip, Edit, Trash2 } from 'lucide-react';

export default function BroadcastAdmin() {
  const { broadcasts, setBroadcasts } = useAdmin();
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastFile, setBroadcastFile] = useState(null);
  const [editingBroadcastId, setEditingBroadcastId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcast = () => {
    if (!broadcastText && !broadcastFile) return alert("Isi pengumuman!");
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false); 
      setBroadcastSuccess(true);
      const payload = {
        id: editingBroadcastId || Date.now(), 
        tanggal: 'Hari Ini', 
        pesan: broadcastText,
        tipe: broadcastFile ? 'Dokumen Tersisip' : 'Pengumuman', 
        file: broadcastFile ? broadcastFile.name : null
      };
      
      if (editingBroadcastId) {
        setBroadcasts(broadcasts.map(b => b.id === editingBroadcastId ? payload : b));
      } else {
        setBroadcasts([payload, ...broadcasts]);
      }
      
      setBroadcastText(''); 
      setBroadcastFile(null); 
      setEditingBroadcastId(null);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }, 1500);
  };

  const handleEditBroadcast = (b) => { 
    setBroadcastText(b.pesan); 
    setEditingBroadcastId(b.id); 
    setBroadcastFile(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDeleteBroadcast = (id) => { 
    if(window.confirm('Tarik pengumuman ini dari siswa?')) {
      setBroadcasts(broadcasts.filter(b => b.id !== id)); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-sora-navy text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col h-fit">
        {broadcastSuccess && (
          <div className="absolute inset-0 bg-sora-green z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={56} className="text-white mb-4 shadow-xl rounded-full" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              {editingBroadcastId ? 'Diperbarui!' : 'Terkirim!'}
            </h3>
          </div>
        )}
        <div className="flex items-center gap-3 mb-6 relative z-0">
          <Megaphone className="text-sora-cyan" size={28}/>
          <h3 className="text-2xl font-black">{editingBroadcastId ? 'Edit Pengumuman' : 'Buat Pengumuman'}</h3>
        </div>
        <textarea 
          value={broadcastText} 
          onChange={(e) => setBroadcastText(e.target.value)} 
          placeholder="Tulis pengumuman resmi di sini..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-sora-cyan h-40 placeholder:text-white/30 resize-none mb-6" 
        />
        <div className="mb-8">
          {broadcastFile ? (
            <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={20} className="text-sora-cyan shrink-0"/>
                <span className="text-xs font-bold truncate">{broadcastFile.name}</span>
              </div>
              <button onClick={() => setBroadcastFile(null)} className="text-red-400 hover:text-red-300 p-2">
                <X size={18}/>
              </button>
            </div>
          ) : (
            <>
              <input type="file" id="file-upload" accept=".pdf" className="hidden" onChange={(e) => setBroadcastFile(e.target.files[0])} />
              <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 hover:text-white hover:border-white/40 cursor-pointer transition-all">
                <Paperclip size={18}/> Lampirkan Dokumen Baru (PDF)
              </label>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {editingBroadcastId && (
            <button onClick={() => {setEditingBroadcastId(null); setBroadcastText('');}} className="w-1/3 bg-white/10 py-5 rounded-2xl font-black text-xs hover:bg-white/20 transition-all uppercase tracking-widest">
              Batal
            </button>
          )}
          <button onClick={handleBroadcast} disabled={isBroadcasting} className="flex-1 bg-sora-blue py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-sora-cyan transition-all disabled:opacity-50 relative z-0">
            {isBroadcasting ? 'MEMPROSES...' : (editingBroadcastId ? 'Simpan Perubahan' : 'Kirim Pengumuman')}
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
        <h3 className="text-xl font-black text-sora-navy mb-8">Riwayat Broadcast</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {broadcasts.length === 0 && <p className="text-gray-400 font-bold italic text-sm">Belum ada pengumuman.</p>}
          {broadcasts.map(b => (
            <div key={b.id} className="p-5 border rounded-2xl flex items-start gap-4 hover:border-sora-blue transition-all group">
              <div className="bg-sora-bg p-3 rounded-xl text-sora-blue"><Megaphone size={20}/></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 mb-1">{b.tanggal} • {b.tipe}</p>
                <p className="text-sm font-black text-sora-navy leading-snug break-words">{b.pesan}</p>
                {b.file && <p className="text-[10px] text-sora-blue font-bold mt-2 flex items-center gap-1"><FileText size={12}/> {b.file}</p>}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditBroadcast(b)} className="p-2 text-sora-gray hover:text-sora-blue rounded-lg bg-gray-50 hover:bg-sora-bg"><Edit size={14}/></button>
                <button onClick={() => handleDeleteBroadcast(b.id)} className="p-2 text-sora-gray hover:text-red-500 rounded-lg bg-gray-50 hover:bg-red-50"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}