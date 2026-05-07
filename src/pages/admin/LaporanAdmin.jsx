import { useAdmin } from '../../context/AdminContext';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LaporanAdmin() {
  const { dataSiswa, rekapKeuangan } = useAdmin();

  const handleExport = (jenis) => {
    const dataUntukExcel = dataSiswa.map((s, index) => {
      const lunas = s.tagihan.filter(t => t.status === 'Lunas').reduce((a, c) => a + c.nominal, 0);
      const nunggak = s.tagihan.filter(t => t.status === 'Belum Bayar').reduce((a, c) => a + c.nominal, 0);
      return { "No": index + 1, "NISN": s.nisn, "Nama Siswa": s.nama, "Kelas": s.kelas, "Status Siswa": s.statusSiswa, "Total Lunas (Rp)": lunas, "Sisa Tunggakan (Rp)": nunggak };
    });
    
    dataUntukExcel.push({}); 
    dataUntukExcel.push({ "No": "", "NISN": "", "Nama Siswa": "TOTAL KESELURUHAN", "Kelas": "", "Status Siswa": "", "Total Lunas (Rp)": rekapKeuangan.totalLunas, "Sisa Tunggakan (Rp)": rekapKeuangan.totalNunggak });
    
    const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
    worksheet['!cols'] = [ { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 } ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan ${jenis}`);
    
    const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    XLSX.writeFile(workbook, `Laporan_SORA_${jenis}_${tanggal}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <div>
          <h3 className="text-xl font-black text-sora-navy">Rekapitulasi Lunas Berdasarkan Kategori</h3>
          <p className="text-xs font-bold text-sora-gray">Rincian pendapatan yang sudah masuk ke kas sekolah.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('Bulanan')} className="flex items-center gap-2 px-5 py-3 bg-sora-green text-white rounded-xl text-[10px] font-black uppercase hover:opacity-80 transition-all shadow-lg">
            <Download size={16}/> Bulanan
          </button>
          <button onClick={() => handleExport('Tahunan')} className="flex items-center gap-2 px-5 py-3 bg-sora-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-sora-navy transition-all shadow-lg">
            <Download size={16}/> Tahunan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(rekapKeuangan.kategoriRekap).map(([key, val]) => (
          <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-sora-gray uppercase tracking-widest mb-2">{key}</p>
            <p className="text-lg font-black text-sora-green">Rp {(val/1000).toLocaleString('id-ID')}k</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-sora-gray uppercase tracking-widest border-b">
            <tr>
              <th className="p-6">NISN</th>
              <th className="p-6">Nama Siswa</th>
              <th className="p-6 text-right">Total Tagihan</th>
              <th className="p-6 text-right text-sora-green">Terbayar (Lunas)</th>
              <th className="p-6 text-right text-red-500">Sisa Tunggakan</th>
            </tr>
          </thead>
          <tbody>
            {dataSiswa.map(s => {
              const total = s.tagihan.reduce((acc, curr) => acc + curr.nominal, 0);
              const lunas = s.tagihan.filter(t => t.status === 'Lunas').reduce((acc, curr) => acc + curr.nominal, 0);
              const nunggak = total - lunas;
              return (
                <tr key={s.id} className="border-b hover:bg-sora-bg/50">
                  <td className="p-6 font-mono text-xs">{s.nisn}</td>
                  <td className="p-6 font-black text-sora-navy">{s.nama}</td>
                  <td className="p-6 text-right font-bold">Rp {total.toLocaleString('id-ID')}</td>
                  <td className="p-6 text-right font-black text-sora-green">Rp {lunas.toLocaleString('id-ID')}</td>
                  <td className="p-6 text-right font-black text-red-500">Rp {nunggak.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-sora-navy text-white font-black">
            <tr>
              <td colSpan="2" className="p-6 text-right uppercase tracking-widest text-[10px]">TOTAL KESELURUHAN</td>
              <td className="p-6 text-right">Rp {rekapKeuangan.totalTagihan.toLocaleString('id-ID')}</td>
              <td className="p-6 text-right text-sora-green">Rp {rekapKeuangan.totalLunas.toLocaleString('id-ID')}</td>
              <td className="p-6 text-right text-red-400">Rp {rekapKeuangan.totalNunggak.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}