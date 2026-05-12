import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SiswaContext } from './SiswaContext';

export function SiswaProvider({ children }) {
  const [profil, setProfil] = useState(null);
  const [tagihan, setTagihan] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [totalNunggak, setTotalNunggak] = useState(0);

  const fetchProfil = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('studentId');
      if (!studentId) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfil(res.data.data);
    } catch {
      console.error("Gagal memuat profil siswa");
    }
  }, []);

  const fetchTagihanData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rawData = res.data.data;
      let nunggak = 0;
      
      const mappedTagihan = rawData.map(item => {
        if (item.status !== 'PAID') {
          nunggak += item.nominal;
        }
        
        let statusUi = 'Belum Bayar';
        if (item.status === 'PAID') statusUi = 'Lunas';
        
        const manualPending = item.transactions?.some(tx => tx.metode_bayar === 'MANUAL' && tx.status === 'PENDING');
        if (manualPending) statusUi = 'Menunggu Konfirmasi';

        return {
          id: item.id,
          nama: item.judul_tagihan,
          kategori: item.jenis_tagihan,
          nominal: item.nominal,
          tglBatas: item.tanggal_jatuh_tempo ? new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          status: statusUi
        };
      });

      setTagihan(mappedTagihan);
      setTotalNunggak(nunggak);
    } catch {
      console.error("Gagal memuat tagihan siswa");
    }
  }, []);

  const fetchPengumuman = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/informasi/broadcast`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengumuman(res.data.data);
    } catch {
      console.error("Gagal memuat pengumuman");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfil();
      await fetchTagihanData();
      await fetchPengumuman();
    };
    loadData();
  }, [fetchProfil, fetchTagihanData, fetchPengumuman]);

  return (
    <SiswaContext.Provider value={{ profil, fetchProfil, tagihan, fetchTagihanData, totalNunggak, pengumuman }}>
      {children}
    </SiswaContext.Provider>
  );
}