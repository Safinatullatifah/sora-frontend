import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, Suspense, lazy } from 'react';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PrintLaporan = lazy(() => import('./pages/PrintLaporan'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'));
const DataSiswaAdmin = lazy(() => import('./pages/admin/DataSiswaAdmin'));
const LaporanAdmin = lazy(() => import('./pages/admin/LaporanAdmin'));
const BroadcastAdmin = lazy(() => import('./pages/admin/BroadcastAdmin'));
const KalenderAdmin = lazy(() => import('./pages/admin/KalenderAdmin'));
const SiswaLayout = lazy(() => import('./layouts/SiswaLayout'));
const DashboardSiswa = lazy(() => import('./pages/siswa/DashboardSiswa'));
const TagihanSiswa = lazy(() => import('./pages/siswa/TagihanSiswa'));
const ProfilSiswa = lazy(() => import('./pages/siswa/ProfilSiswa'));

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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat...</div>}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/siswa'} replace />} 
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/print-laporan" element={<PrintLaporan />} />

          <Route path="/admin" element={user?.role === 'admin' ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardAdmin />} />
            <Route path="siswa" element={<DataSiswaAdmin />} />
            <Route path="laporan" element={<LaporanAdmin />} />
            <Route path="broadcast" element={<BroadcastAdmin />} />
            <Route path="kalender" element={<KalenderAdmin />} />
          </Route>

          <Route path="/siswa" element={(user?.role === 'siswa' || user?.role === 'ortu') ? <SiswaLayout onLogout={handleLogout} userRole={user?.role} /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardSiswa />} />
            <Route path="tagihan" element={<TagihanSiswa />} />
            <Route path="profil" element={<ProfilSiswa userRole={user?.role} />} />
          </Route>
          
          <Route path="/ortu/*" element={user?.role === 'ortu' ? <Navigate to="/siswa" replace /> : <Navigate to="/login" replace />} />
          <Route path="/" element={<Navigate to={user?.role === 'admin' ? "/admin" : (user?.role === 'siswa' || user?.role === 'ortu') ? "/siswa" : "/login"} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}