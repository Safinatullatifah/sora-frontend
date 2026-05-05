import PrintLaporan from './pages/PrintLaporan';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SiswaDashboard from './pages/SiswaDashboard';
import RegisterPage from './pages/RegisterPage'; // <--- Import Halaman Pendaftaran Baru

export default function App() {
  // Mengambil data user dari memory browser dengan aman
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Menggunakan clear untuk memastikan semua memori nyangkut terhapus saat logout
    localStorage.clear(); 
  };

  return (
    <Router>
      <Routes>
        {/* Halaman Login */}
        <Route 
          path="/login" 
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/siswa" replace />
            )
          } 
        />

        {/* Rute Baru PPDB (Pendaftaran Siswa Baru) */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Rute Khusus Cetak Laporan Keuangan */}
        <Route path="/print-laporan" element={<PrintLaporan />} />
        {/* Route Khusus Admin */}
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />

        {/* Route Khusus Siswa dan Orang Tua (Memakai Dashboard yang sama, dibedakan dengan prop isOrangTua) */}
        <Route 
          path="/siswa/*" 
          element={(user?.role === 'siswa' || user?.role === 'ortu') ? <SiswaDashboard onLogout={handleLogout} isOrangTua={user?.role === 'ortu'} /> : <Navigate to="/login" replace />} 
        />
        
        {/* Alias Rute jika kebetulan mengetik /ortu di URL */}
        <Route 
          path="/ortu/*" 
          element={user?.role === 'ortu' ? <Navigate to="/siswa" replace /> : <Navigate to="/login" replace />} 
        />

        {/* Redirect awal saat web pertama kali dibuka */}
        <Route 
          path="/" 
          element={
            <Navigate to={user?.role === 'admin' ? "/admin" : (user?.role === 'siswa' || user?.role === 'ortu') ? "/siswa" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
}