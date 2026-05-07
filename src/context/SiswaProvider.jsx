import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SiswaContext } from './SiswaContext';

export function SiswaProvider({ children }) {
  const [profil, setProfil] = useState(null);
  const [tagihan, setTagihan] = useState([]);
  const [pengumuman] = useState([
    { id: 1, tipe: 'PENGUMUMAN', tanggal: '15 Apr 2026', judul: 'Pemberitahuan Libur Hari Raya Idul Fitri', file: 'Surat_Edaran_Libur.pdf', pesan: 'Diberitahukan kepada seluruh siswa bahwa libur akan dimulai pada tanggal 18 April 2026.' }
  ]);

  const fetchProfil = useCallback(async () => {
    const studentId = localStorage.getItem('studentId');
    const token = localStorage.getItem('token');
    if (!studentId || !token) return null;

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }, []);

  const fetchTagihanData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.data.map(inv => ({
      id: inv.id,
      nama: `Tagihan Pembayaran ${inv.id.substring(0, 5)}`,
      kategori: 'SPP',
      nominal: inv.nominal,
      status: inv.status === 'PAID' ? 'Lunas' : 'Belum Bayar',
      tglBatas: '20 Mei 2026'
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchProfil(), fetchTagihanData()]).then(([profilData, tagihanData]) => {
      if (isMounted) {
        if (profilData) setProfil(profilData);
        if (tagihanData) setTagihan(tagihanData);
      }
    }).catch(() => {
      if (isMounted) {
        setProfil(null);
        setTagihan([]);
      }
    });
    return () => { isMounted = false; };
  }, [fetchProfil, fetchTagihanData]);

  const totalNunggak = useMemo(() => {
    return tagihan.filter(t => t.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.nominal, 0);
  }, [tagihan]);

  const totalBulanNunggak = useMemo(() => {
    return tagihan.filter(t => t.status === 'Belum Bayar' && t.kategori === 'SPP').length;
  }, [tagihan]);

  const isBlokirUjian = totalBulanNunggak >= 3;

  return (
    <SiswaContext.Provider value={{ profil, setProfil, tagihan, setTagihan, pengumuman, totalNunggak, totalBulanNunggak, isBlokirUjian, fetchProfil, fetchTagihanData }}>
      {children}
    </SiswaContext.Provider>
  );
}