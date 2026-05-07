import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar, Edit, Trash2 } from 'lucide-react';

export default function KalenderAdmin() {
  const { agendas, setAgendas } = useAdmin();
  const [newAgenda, setNewAgenda] = useState({ id: null, judul: '', tanggal: '' });

  const handleAddAgenda = () => {
    if (!newAgenda.judul || !newAgenda.tanggal) return;
    const dateObj = new Date(newAgenda.tanggal);
    const agendaBaru = {
      id: newAgenda.id || Date.now(), 
      rawDate: newAgenda.tanggal,
      tanggal: dateObj.getDate().toString().padStart(2, '0'),
      bulan: dateObj.toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
      judul: newAgenda.judul, 
      sub: 'Agenda Sekolah',
      color: newAgenda.id ? 'bg-orange-500' : 'bg-sora-navy' 
    };
    
    if (newAgenda.id) {
      setAgendas(agendas.map(a => a.id === newAgenda.id ? agendaBaru : a));
    } else {
      setAgendas([agendaBaru, ...agendas]);
    }
    
    setNewAgenda({ id: null, judul: '', tanggal: '' });
  };

  const handleEditAgenda = (item) => setNewAgenda({ id: item.id, judul: item.judul, tanggal: item.rawDate });
  
  const handleDeleteAgenda = (id) => { 
    if(window.confirm('Hapus agenda ini?')) setAgendas(agendas.filter(a => a.id !== id)); 
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm h-fit sticky top-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-sora-blue/10 p-3 rounded-xl"><Calendar className="text-sora-blue"/></div>
          <h3 className="text-2xl font-black text-sora-navy">{newAgenda.id ? 'Edit Agenda' : 'Manajemen Agenda'}</h3>
        </div>
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-sora-gray ml-1">Nama Acara</label>
            <input type="text" className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-sora-blue text-sm font-bold" value={newAgenda.judul} onChange={(e) => setNewAgenda({...newAgenda, judul: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-sora-gray ml-1">Tanggal Pelaksanaan</label>
            <input type="date" className="w-full mt-2 p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:border-sora-blue text-sm font-bold" value={newAgenda.tanggal} onChange={(e) => setNewAgenda({...newAgenda, tanggal: e.target.value})} />
          </div>
          <div className="flex gap-2 mt-4">
            {newAgenda.id && (
              <button onClick={() => setNewAgenda({id:null, judul:'', tanggal:''})} className="w-1/3 bg-gray-100 text-sora-gray py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Batal</button>
            )}
            <button onClick={handleAddAgenda} className="flex-1 bg-sora-navy text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sora-blue transition-all">
              {newAgenda.id ? 'Simpan Perubahan' : 'Simpan Agenda'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-sora-bg p-10 rounded-[2.5rem] border border-gray-200">
        <h3 className="text-xl font-black text-sora-navy mb-8">Agenda Mendatang</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {agendas.length === 0 && <p className="text-gray-400 font-bold italic text-sm">Tidak ada agenda tercatat.</p>}
          {agendas.map((item) => (
            <div key={item.id} className="flex gap-4 items-center p-4 bg-white rounded-2xl shadow-sm group border border-transparent hover:border-sora-blue transition-all">
              <div className={`${item.color} text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold shadow-md`}>
                <span className="text-[10px] tracking-tighter">{item.bulan}</span>
                <span className="text-2xl leading-none">{item.tanggal}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-black text-sora-navy uppercase truncate">{item.judul}</p>
                <p className="text-[10px] text-sora-gray font-bold uppercase tracking-widest mt-1">{item.sub}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEditAgenda(item)} className="p-2 text-sora-gray hover:bg-sora-bg rounded-lg"><Edit size={16}/></button>
                <button onClick={() => handleDeleteAgenda(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}