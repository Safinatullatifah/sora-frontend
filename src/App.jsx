import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CekStatusPage = lazy(() => import('./pages/auth/CekStatusPage'));
const PrintLaporan = lazy(() => import('./pages/PrintLaporan'));
const PrintStrukTagihan = lazy(() => import('./pages/PrintStrukTagihan'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'));
const VerifikasiPendaftaranAdmin = lazy(() => import('./pages/admin/VerifikasiPendaftaranAdmin'));
const VerifikasiPembayaranAdmin = lazy(() => import('./pages/admin/VerifikasiPembayaranAdmin'));
const DataSiswaAdmin = lazy(() => import('./pages/admin/DataSiswaAdmin'));
const MasterDataAdmin = lazy(() => import('./pages/admin/MasterDataAdmin'));
const LaporanAdmin = lazy(() => import('./pages/admin/LaporanAdmin'));
const BroadcastAdmin = lazy(() => import('./pages/admin/BroadcastAdmin'));
const KalenderAdmin = lazy(() => import('./pages/admin/KalenderAdmin'));
const AuditLogAdmin = lazy(() => import('./pages/admin/AuditLogAdmin'));
const PengaturanSistemAdmin = lazy(() => import('./pages/admin/PengaturanSistemAdmin'));

const SiswaLayout = lazy(() => import('./layouts/SiswaLayout'));
const DashboardSiswa = lazy(() => import('./pages/siswa/DashboardSiswa'));
const TagihanSiswa = lazy(() => import('./pages/siswa/TagihanSiswa'));
const ProfilSiswa = lazy(() => import('./pages/siswa/ProfilSiswa'));
const KartuUjianSiswa = lazy(() => import('./pages/siswa/KartuUjianSiswa'));
const PengumumanSiswa = lazy(() => import('./pages/siswa/PengumumanSiswa'));
const KalenderSiswa = lazy(() => import('./pages/siswa/KalenderSiswa'));

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat SORA...</div>}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/siswa'} replace />} 
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cek-status" element={<CekStatusPage />} />
          <Route path="/print-laporan" element={<PrintLaporan />} />
          <Route path="/print-struk-tagihan" element={<PrintStrukTagihan />} />

          <Route path="/admin" element={user?.role === 'admin' ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardAdmin />} />
            <Route path="verifikasi-ppdb" element={<VerifikasiPendaftaranAdmin />} />
            <Route path="verifikasi-pembayaran" element={<VerifikasiPembayaranAdmin />} />
            <Route path="siswa" element={<DataSiswaAdmin />} />
            <Route path="master" element={<MasterDataAdmin />} />
            <Route path="laporan" element={<LaporanAdmin />} />
            <Route path="broadcast" element={<BroadcastAdmin />} />
            <Route path="kalender" element={<KalenderAdmin />} />
            <Route path="audit" element={<AuditLogAdmin />} />
            <Route path="pengaturan" element={<PengaturanSistemAdmin />} />
          </Route>

          <Route path="/siswa" element={(user?.role === 'siswa' || user?.role === 'ortu') ? <SiswaLayout onLogout={handleLogout} userRole={user?.role} /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardSiswa />} />
            <Route path="tagihan" element={<TagihanSiswa />} />
            <Route path="kartu-ujian" element={<KartuUjianSiswa />} />
            <Route path="pengumuman" element={<PengumumanSiswa />} />
            <Route path="kalender" element={<KalenderSiswa />} />
            <Route path="profil" element={<ProfilSiswa />} />
          </Route>
          
          <Route path="/ortu/*" element={user?.role === 'ortu' ? <Navigate to="/siswa" replace /> : <Navigate to="/login" replace />} />
          <Route path="/" element={<Navigate to={user?.role === 'admin' ? "/admin" : (user?.role === 'siswa' || user?.role === 'ortu') ? "/siswa" : "/login"} replace />} />
        </Routes>
        <Toaster position="top-center" />
      </Suspense>
    </BrowserRouter>
  );
}