import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminContext } from './AdminContext';

export function AdminProvider({ children }) {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [agendas, setAgendas] = useState([
    { id: 1, rawDate: '2026-04-20', tanggal: '20', bulan: 'APR', judul: 'Batas Akhir SPP', sub: 'Agenda Sekolah', color: 'bg-sora-blue' },
    { id: 2, rawDate: '2026-05-02', tanggal: '02', bulan: 'MEI', judul: 'Ujian Semester', sub: 'Agenda Sekolah', color: 'bg-sora-green' }
  ]);
  const [broadcasts, setBroadcasts] = useState([
    { id: 1, tanggal: '15 Apr 2026', pesan: 'Pemberitahuan Libur Hari Raya', tipe: 'Pengumuman', file: null }
  ]);

  const fetchDataAdmin = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const resSiswa = await axios.get(`${import.meta.env.VITE_API_URL}/students`, config);
    const resInvoice = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, config);
    
    return resSiswa.data.data.map(student => {
      const studentInvoices = resInvoice.data.data
        .filter(inv => inv.student_id === student.id)
        .map(inv => ({
          id: inv.id,
          nama: `Tagihan Pembayaran ${inv.id.substring(0, 5)}`,
          kategori: 'SPP',
          nominal: inv.nominal,
          status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar'
        }));

      return {
        id: student.id,
        nisn: student.nisn,
        nama: student.nama_lengkap,
        kelas: student.kelas,
        telp: '-', 
        statusSiswa: 'Aktif',
        emailOrtu: student.user?.email || '-',
        tagihan: studentInvoices
      };
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchDataAdmin().then(data => {
      if (isMounted && data) {
        setDataSiswa(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [fetchDataAdmin]);

  const rekapKeuangan = useMemo(() => {
    let totalTagihan = 0; let totalLunas = 0; let totalNunggak = 0;
    const kategoriRekap = { 'SPP': 0, 'Daftar Ulang': 0, 'Buku': 0, 'Seragam': 0, 'Lainnya': 0 };

    dataSiswa.forEach(s => {
      s.tagihan.forEach(t => {
        totalTagihan += t.nominal;
        if (t.status === 'Lunas') {
          totalLunas += t.nominal;
          if (kategoriRekap[t.kategori] !== undefined) kategoriRekap[t.kategori] += t.nominal;
          else kategoriRekap['Lainnya'] += t.nominal;
        } else {
          totalNunggak += t.nominal;
        }
      });
    });
    return { totalTagihan, totalLunas, totalNunggak, kategoriRekap };
  }, [dataSiswa]);

  return (
    <AdminContext.Provider value={{ dataSiswa, setDataSiswa, agendas, setAgendas, broadcasts, setBroadcasts, rekapKeuangan, fetchDataAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}